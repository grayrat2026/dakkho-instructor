'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
  Check,
  MessageSquare,
  BookOpen,
  ListVideo,
  Clock,
  ChevronLeft,
  Settings,
  ChevronUp,
  Plus,
  Trash2,
  Reply,
  Send,
  X,
} from 'lucide-react';
import { useNavigationStore, useWatchProgressStore, useAuthStore } from '@/lib/store';
import { type Course, type Video, type Instructor, courseApi, instructorApi, watchHistoryApi } from '@/lib/api-client';
import { formatDuration } from '@/lib/utils';
import { GlassCard } from '../shared/GlassCard';
import { GradientButton } from '../shared/GradientButton';
import { ProgressBar } from '../shared/ProgressBar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import SecureVideoPlayer from './SecureVideoPlayer';

// --- Types ---
interface VideoNote {
  id: string;
  timestamp: number;
  text: string;
}

interface QAItem {
  id: string;
  author: string;
  avatar: string;
  question: string;
  timestamp: string;
  upvotes: number;
  replies: ReplyItem[];
  upvoted: boolean;
}

interface ReplyItem {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

interface ChapterMarker {
  time: number;
  label: string;
}

// --- Helpers ---
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
const QUALITY_OPTIONS = ['Auto', '1080p', '720p', '480p'] as const;

// --- Mock Q&A Data ---
const MOCK_QA: QAItem[] = [
  {
    id: 'qa1',
    author: 'Tanvir Hasan',
    avatar: '',
    question: 'Can you explain the difference between let and var in JavaScript?',
    timestamp: '2h ago',
    upvotes: 12,
    upvoted: false,
    replies: [
      { id: 'r1', author: 'Engr. Karim Uddin', text: 'Great question! let is block-scoped while var is function-scoped. This means let variables are only accessible within the block they are declared in.', timestamp: '1h ago' },
    ],
  },
  {
    id: 'qa2',
    author: 'Nusrat Jahan',
    avatar: '',
    question: 'What is the best way to practice the concepts from this video?',
    timestamp: '5h ago',
    upvotes: 8,
    upvoted: false,
    replies: [],
  },
  {
    id: 'qa3',
    author: 'Rafi Ahmed',
    avatar: '',
    question: 'Is there a project assignment for this section?',
    timestamp: '1d ago',
    upvotes: 15,
    upvoted: true,
    replies: [
      { id: 'r2', author: 'Engr. Karim Uddin', text: 'Yes! Check the resources section for the mini-project assignment.', timestamp: '22h ago' },
      { id: 'r3', author: 'Sadia Islam', text: 'I completed it last week. Very helpful for understanding the concepts!', timestamp: '20h ago' },
    ],
  },
];

export function VideoPlayerPage() {
  const { pageParams, navigate, goBack } = useNavigationStore();
  const { updateProgress, getProgress } = useWatchProgressStore();
  const { user } = useAuthStore();

  // --- Data ---
  const videoId = pageParams.videoId as string;
  const courseId = pageParams.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [instructor, setInstructor] = useState<Instructor | undefined>(undefined);

  useEffect(() => {
    if (!courseId) return;
    courseApi.get(courseId)
      .then((res) => {
        setCourse(res.course);
        if (res.course.instructorId) {
          instructorApi.get(res.course.instructorId)
            .then((instRes) => setInstructor(instRes.instructor))
            .catch(() => {});
        }
      })
      .catch(() => setCourse(null));
    courseApi.videos(courseId)
      .then((res) => setVideos(res.videos))
      .catch(() => {});
  }, [courseId]);

  const currentVideo = videos.find((v) => v.id === videoId);
  const watchProgress = getProgress(videoId);

  const currentIndex = videos.findIndex((v) => v.id === videoId);
  const nextVideo = currentIndex < videos.length - 1 ? videos[currentIndex + 1] : null;

  // --- Video State ---
  const videoDuration = currentVideo?.duration ?? 0;
  const initialPosition = (watchProgress?.lastPosition && watchProgress.lastPosition > 10 && !watchProgress.completed)
    ? watchProgress.lastPosition
    : 0;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialPosition);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [quality, setQuality] = useState<string>('Auto');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buffered, setBuffered] = useState(Math.min(initialPosition + 30, videoDuration));

  // --- Resume Dialog (computed from initial state, no effect needed) ---
  const [resumeDialogDismissed, setResumeDialogDismissed] = useState(false);
  const showResumeDialog = !resumeDialogDismissed && initialPosition > 10;

  // --- Controls Visibility ---
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Next Episode ---
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const [nextEpisodeCountdown, setNextEpisodeCountdown] = useState(5);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Tabs ---
  const [activeTab, setActiveTab] = useState<'upnext' | 'notes' | 'qa'>('upnext');

  // --- Notes ---
  const [notes, setNotes] = useState<VideoNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');

  // --- Q&A ---
  const [qaItems, setQaItems] = useState<QAItem[]>(MOCK_QA);
  const [newQuestion, setNewQuestion] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // --- Refs ---
  const playerRef = useRef<HTMLDivElement>(null);
  const simulatedTimeRef = useRef(initialPosition);

  // --- Chapter markers (mock, evenly spaced) ---
  const chapterMarkers: ChapterMarker[] = videoDuration > 0 ? [
    { time: 0, label: 'Introduction' },
    { time: videoDuration * 0.15, label: 'Core Concepts' },
    { time: videoDuration * 0.35, label: 'Deep Dive' },
    { time: videoDuration * 0.55, label: 'Practical Example' },
    { time: videoDuration * 0.75, label: 'Summary' },
  ] : [];

  // Keep simulatedTimeRef in sync with currentTime via effect
  useEffect(() => {
    simulatedTimeRef.current = currentTime;
  }, [currentTime]);

  // --- Handlers ---
  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const skip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(simulatedTimeRef.current + seconds, videoDuration));
    simulatedTimeRef.current = newTime;
    setCurrentTime(newTime);
  };

  const changeVolume = (delta: number) => {
    setVolume((prev) => {
      const next = Math.max(0, Math.min(prev + delta, 100));
      if (next === 0) setIsMuted(true);
      else setIsMuted(false);
      return next;
    });
  };

  const changeSpeed = (direction: 1 | -1) => {
    setPlaybackSpeed((prev) => {
      const idx = PLAYBACK_SPEEDS.indexOf(prev as typeof PLAYBACK_SPEEDS[number]);
      const newIdx = Math.max(0, Math.min(idx + direction, PLAYBACK_SPEEDS.length - 1));
      return PLAYBACK_SPEEDS[newIdx];
    });
  };

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    const newTime = pct * videoDuration;
    simulatedTimeRef.current = newTime;
    setCurrentTime(newTime);
  };

  const handlePlayNext = () => {
    setIsPlaying(false);
    setShowNextEpisode(false);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    simulatedTimeRef.current = 0;
    setCurrentTime(0);
    if (nextVideo) {
      navigate('video-player', { videoId: nextVideo.id, courseId });
    }
  };

  const handleMarkComplete = () => {
    updateProgress(videoId, {
      courseId,
      progress: 100,
      completed: true,
      lastPosition: currentVideo?.duration || 0,
    });
  };

  const handleResume = () => {
    setResumeDialogDismissed(true);
    setIsPlaying(true);
  };

  const handleStartOver = () => {
    simulatedTimeRef.current = 0;
    setCurrentTime(0);
    setResumeDialogDismissed(true);
    setIsPlaying(true);
  };

  // --- Notes ---
  const addNote = () => {
    if (!newNoteText.trim()) return;
    const note: VideoNote = {
      id: `note-${Date.now()}`,
      timestamp: simulatedTimeRef.current,
      text: newNoteText.trim(),
    };
    setNotes((prev) => [...prev, note]);
    setNewNoteText('');
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const jumpToNote = (timestamp: number) => {
    simulatedTimeRef.current = timestamp;
    setCurrentTime(timestamp);
  };

  // --- Q&A ---
  const toggleUpvote = (id: string) => {
    setQaItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, upvoted: !item.upvoted, upvotes: item.upvoted ? item.upvotes - 1 : item.upvotes + 1 }
          : item
      )
    );
  };

  const addQuestion = () => {
    if (!newQuestion.trim()) return;
    const item: QAItem = {
      id: `qa-${Date.now()}`,
      author: 'You',
      avatar: '',
      question: newQuestion.trim(),
      timestamp: 'Just now',
      upvotes: 0,
      upvoted: false,
      replies: [],
    };
    setQaItems((prev) => [item, ...prev]);
    setNewQuestion('');
  };

  const addReply = (qaId: string) => {
    if (!replyText.trim()) return;
    const reply: ReplyItem = {
      id: `reply-${Date.now()}`,
      author: 'You',
      text: replyText.trim(),
      timestamp: 'Just now',
    };
    setQaItems((prev) =>
      prev.map((item) =>
        item.id === qaId ? { ...item, replies: [...item.replies, reply] } : item
      )
    );
    setReplyText('');
    setReplyingTo(null);
  };

  const showControls = () => {
    setControlsVisible(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    if (isPlaying) {
      controlsTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
    }
  };

  // --- Simulated playback with auto-save and next episode detection ---
  useEffect(() => {
    if (!isPlaying || videoDuration <= 0) return;

    const tickInterval = setInterval(() => {
      simulatedTimeRef.current = Math.min(simulatedTimeRef.current + playbackSpeed, videoDuration);
      const newTime = simulatedTimeRef.current;
      setCurrentTime(newTime);
      setBuffered(Math.min(newTime + 30, videoDuration));

      // Auto-save progress every ~5 seconds (every 5 ticks)
      if (Math.floor(newTime) % 5 === 0) {
        const progress = Math.min((newTime / videoDuration) * 100, 100);
        const isCompleted = progress >= 95;
        updateProgress(videoId, {
          courseId,
          progress: isCompleted ? 100 : Math.round(progress),
          completed: isCompleted,
          lastPosition: newTime,
        });
        // Sync watch history to D1 via Worker API (non-blocking)
        if (user) {
          watchHistoryApi.upsert({
            videoId,
            videoTitle: currentVideo?.title,
            courseId,
            progress: isCompleted ? 100 : Math.round(progress),
            lastPosition: newTime,
            duration: videoDuration,
          }).catch(() => {});
        }
      }

      // Next episode auto-play detection
      if (newTime >= videoDuration && nextVideo) {
        setShowNextEpisode(true);
        setNextEpisodeCountdown(5);
      }
    }, 1000);

    return () => clearInterval(tickInterval);
  }, [isPlaying, videoDuration, playbackSpeed, videoId, courseId, updateProgress, nextVideo]);

  // --- Next episode countdown timer ---
  useEffect(() => {
    if (!showNextEpisode) return;

    countdownRef.current = setInterval(() => {
      setNextEpisodeCountdown((prev) => {
        if (prev <= 1) {
          // Time's up - navigate to next
          if (countdownRef.current) clearInterval(countdownRef.current);
          // We use a microtask to avoid calling navigate during render
          queueMicrotask(() => handlePlayNext());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [showNextEpisode]);

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          simulatedTimeRef.current = Math.max(0, simulatedTimeRef.current - 10);
          setCurrentTime(simulatedTimeRef.current);
          break;
        case 'ArrowRight':
          e.preventDefault();
          simulatedTimeRef.current = Math.min(simulatedTimeRef.current + 10, videoDuration);
          setCurrentTime(simulatedTimeRef.current);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume((prev) => {
            const next = Math.min(prev + 10, 100);
            setIsMuted(next === 0);
            return next;
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((prev) => {
            const next = Math.max(prev - 10, 0);
            setIsMuted(next === 0);
            return next;
          });
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          if (playerRef.current) {
            if (!document.fullscreenElement) {
              playerRef.current.requestFullscreen().catch(() => {});
            } else {
              document.exitFullscreen().catch(() => {});
            }
          }
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          setIsMuted((prev) => !prev);
          break;
        case '[':
          e.preventDefault();
          setPlaybackSpeed((prev) => {
            const idx = PLAYBACK_SPEEDS.indexOf(prev as typeof PLAYBACK_SPEEDS[number]);
            return PLAYBACK_SPEEDS[Math.max(0, idx - 1)];
          });
          break;
        case ']':
          e.preventDefault();
          setPlaybackSpeed((prev) => {
            const idx = PLAYBACK_SPEEDS.indexOf(prev as typeof PLAYBACK_SPEEDS[number]);
            return PLAYBACK_SPEEDS[Math.min(idx + 1, PLAYBACK_SPEEDS.length - 1)];
          });
          break;
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [videoDuration]);

  // --- Fullscreen change listener ---
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // --- Derived values ---
  const currentProgress = watchProgress?.progress ?? 0;
  const progressPercent = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;
  const bufferedPercent = videoDuration > 0 ? (buffered / videoDuration) * 100 : 0;
  const effectiveVolume = isMuted ? 0 : volume;

  const VolumeIcon = effectiveVolume === 0 ? VolumeX : effectiveVolume < 50 ? Volume1 : Volume2;

  if (!course || !currentVideo) {
    return (
      <div className="text-center py-16">
        <p className="text-lg font-bold">Video not found</p>
        <GradientButton onClick={goBack} className="mt-4">
          Go Back
        </GradientButton>
      </div>
    );
  }

  const thumbnailColors = ['from-sky-400 to-blue-600', 'from-emerald-400 to-teal-600', 'from-purple-400 to-indigo-600'];
  const colorClass = thumbnailColors[currentIndex % thumbnailColors.length];

  return (
    <div>
      {/* Back button */}
      <motion.button
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        onClick={() => navigate('course-detail', { courseId })}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -3 }}
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Course
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video player area */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Video player — Real HLS streaming with DRM */}
            <GlassCard className="overflow-hidden mb-4 p-0">
              <SecureVideoPlayer
                videoId={videoId}
                title={currentVideo.title}
                thumbnailUrl={currentVideo ? undefined : undefined}
                onProgress={(progress, currentTime, duration) => {
                  if (Math.floor(currentTime) % 5 === 0) {
                    const isCompleted = progress >= 95;
                    updateProgress(videoId, {
                      courseId,
                      progress: isCompleted ? 100 : Math.round(progress),
                      completed: isCompleted,
                      lastPosition: currentTime,
                    });
                    if (user) {
                      watchHistoryApi.upsert({
                        videoId,
                        videoTitle: currentVideo?.title,
                        courseId,
                        progress: isCompleted ? 100 : Math.round(progress),
                        lastPosition: currentTime,
                        duration,
                      }).catch(() => {});
                    }
                  }
                }}
                onComplete={() => {
                  updateProgress(videoId, {
                    courseId,
                    progress: 100,
                    completed: true,
                    lastPosition: currentVideo?.duration || 0,
                  });
                  if (nextVideo) {
                    navigate('video-player', { videoId: nextVideo.id, courseId });
                  }
                }}
              />
            </GlassCard>

            {/* Video info */}
            <div className="mb-4">
              <h1 className="text-lg font-extrabold text-foreground mb-1">{currentVideo.title}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {instructor && <span>{instructor.name}</span>}
                <span>&bull;</span>
                <span>{course.title}</span>
              </div>
            </div>

            {/* Mark complete + Next Video */}
            <div className="flex items-center gap-3 mb-4">
              <GradientButton
                onClick={handleMarkComplete}
                variant={(watchProgress?.completed || currentProgress >= 100) ? 'success' : 'primary'}
                size="sm"
              >
                <Check className="w-4 h-4" />
                {(watchProgress?.completed || currentProgress >= 100) ? 'Completed' : 'Mark as Complete'}
              </GradientButton>
              {nextVideo && (
                <GradientButton
                  onClick={() => navigate('video-player', { videoId: nextVideo.id, courseId })}
                  size="sm"
                  className="bg-muted/50 text-foreground hover:bg-muted/70 shadow-transparent"
                  variant="primary"
                >
                  <SkipForward className="w-4 h-4" />
                  Next Video
                </GradientButton>
              )}
            </div>

            {/* Progress */}
            <GlassCard className="p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Your Progress</span>
                <span className="text-sm font-bold text-sky-500">{Math.round(currentProgress)}%</span>
              </div>
              <ProgressBar value={currentProgress} size="md" />
            </GlassCard>
          </motion.div>
        </div>

        {/* Sidebar tabs */}
        <div>
          <GlassCard className="overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/20 dark:border-white/5">
              {[
                { key: 'upnext' as const, icon: ListVideo, label: 'Up Next' },
                { key: 'notes' as const, icon: BookOpen, label: 'Notes' },
                { key: 'qa' as const, icon: MessageSquare, label: 'Q&A' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors ${
                    activeTab === tab.key
                      ? 'text-sky-500 border-b-2 border-sky-500'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              {/* Up Next Tab */}
              {activeTab === 'upnext' && (
                <div className="p-2">
                  {videos.map((video, i) => {
                    const isActive = video.id === videoId;
                    const vProgress = getProgress(video.id);
                    return (
                      <motion.div
                        key={video.id}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                          isActive ? 'bg-sky-50 dark:bg-sky-900/20' : 'hover:bg-muted/30'
                        }`}
                        onClick={() => navigate('video-player', { videoId: video.id, courseId })}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            isActive
                              ? 'bg-sky-500 text-white'
                              : vProgress?.completed
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {vProgress?.completed ? <Check className="w-4 h-4" /> : i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-semibold line-clamp-1 ${
                              isActive ? 'text-sky-600 dark:text-sky-400' : 'text-foreground'
                            }`}
                          >
                            {video.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{formatDuration(video.duration)}</span>
                          </div>
                        </div>
                        {isActive && (
                          <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse flex-shrink-0" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div className="p-4">
                  {/* Add note input */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Add a note at current time..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addNote(); }}
                      className="flex-1 px-3 py-2 text-sm rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                    />
                    <button
                      className="p-2 rounded-xl bg-sky-500 text-white hover:bg-sky-400 transition-colors flex-shrink-0"
                      onClick={addNote}
                      title="Add note"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {notes.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-6">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                      <p>No notes yet</p>
                      <p className="text-xs">Take notes while watching the video</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notes.map((note) => (
                        <motion.div
                          key={note.id}
                          className="flex items-start gap-2 p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-white/10"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <button
                            className="text-xs font-mono text-sky-500 font-bold whitespace-nowrap mt-0.5 hover:underline flex-shrink-0"
                            onClick={() => jumpToNote(note.timestamp)}
                          >
                            {formatTime(note.timestamp)}
                          </button>
                          <p className="text-sm text-foreground flex-1 min-w-0">{note.text}</p>
                          <button
                            className="p-1 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                            onClick={() => deleteNote(note.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Q&A Tab */}
              {activeTab === 'qa' && (
                <div className="p-4">
                  {/* Add question */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Ask a question..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addQuestion(); }}
                      className="flex-1 px-3 py-2 text-sm rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                    />
                    <button
                      className="p-2 rounded-xl bg-sky-500 text-white hover:bg-sky-400 transition-colors flex-shrink-0"
                      onClick={addQuestion}
                      title="Post question"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Questions list */}
                  <div className="space-y-3">
                    {qaItems.map((item) => (
                      <motion.div
                        key={item.id}
                        className="p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-white/10"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex items-start gap-2">
                          {/* Upvote */}
                          <div className="flex flex-col items-center flex-shrink-0">
                            <button
                              className={`p-0.5 rounded hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors ${
                                item.upvoted ? 'text-sky-500' : 'text-muted-foreground'
                              }`}
                              onClick={() => toggleUpvote(item.id)}
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-bold text-muted-foreground">{item.upvotes}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-foreground">{item.author}</span>
                              <span className="text-[10px] text-muted-foreground">{item.timestamp}</span>
                            </div>
                            <p className="text-sm text-foreground">{item.question}</p>

                            {/* Replies */}
                            {item.replies.length > 0 && (
                              <div className="mt-2 ml-2 space-y-2 border-l-2 border-white/30 dark:border-white/10 pl-3">
                                {item.replies.map((reply) => (
                                  <div key={reply.id}>
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-xs font-bold text-foreground">{reply.author}</span>
                                      <span className="text-[10px] text-muted-foreground">{reply.timestamp}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{reply.text}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Reply input */}
                            {replyingTo === item.id ? (
                              <div className="flex gap-2 mt-2">
                                <input
                                  type="text"
                                  placeholder="Write a reply..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') addReply(item.id); }}
                                  className="flex-1 px-2 py-1 text-xs rounded-lg bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                                  autoFocus
                                />
                                <button
                                  className="p-1 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg"
                                  onClick={() => addReply(item.id)}
                                >
                                  <Send className="w-3 h-3" />
                                </button>
                                <button
                                  className="p-1 text-muted-foreground hover:bg-muted/30 rounded-lg"
                                  onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-sky-500 transition-colors"
                                onClick={() => setReplyingTo(item.id)}
                              >
                                <Reply className="w-3 h-3" />
                                Reply
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
