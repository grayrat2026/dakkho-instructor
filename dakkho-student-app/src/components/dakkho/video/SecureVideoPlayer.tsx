'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import { videoApi } from '@/lib/api-client';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward, Loader2, AlertCircle, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SecureVideoPlayerProps {
  videoId: string;
  title?: string;
  thumbnailUrl?: string;
  onComplete?: () => void;
  onProgress?: (progress: number, currentTime: number, duration: number) => void;
  className?: string;
}

export default function SecureVideoPlayer({
  videoId,
  title = '',
  thumbnailUrl,
  onComplete,
  onProgress,
  className = '',
}: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState<number>(-1); // -1 = auto
  const [qualities, setQualities] = useState<{ height: number; bitrate: number; name: string }[]>([]);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hlsReady, setHlsReady] = useState(false);
  const [watermarkText, setWatermarkText] = useState('');

  // ─── Format time helper ───
  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // ─── Apply forensic watermark ───
  useEffect(() => {
    try {
      const authData = localStorage.getItem('dakkho-unified-auth-session') ||
                       localStorage.getItem('dakkho_student_auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        const userId = parsed?.state?.user?.id || parsed?.userId || 'unknown';
        setWatermarkText(btoa(userId).replace(/=/g, ''));
      }
    } catch {}
  }, []);

  // ─── Initialize video streaming ───
  const initStreaming = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Create streaming session
      const session = await videoApi.createSession(videoId);

      if (session.hlsReady) {
        // ═══ HLS Mode — Tokenized, Protected ═══
        setHlsReady(true);
        const playlistUrl = videoApi.getPlaylistUrl(videoId, session.sessionId, session.token);

        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
          });

          hls.loadSource(playlistUrl);
          hls.attachMedia(videoRef.current!);

          hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
            setLoading(false);
            // Extract quality levels
            const q = data.levels.map((level, i) => ({
              height: level.height,
              bitrate: level.bitrate,
              name: `${level.height}p`,
            }));
            setQualities(q);
          });

          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  // Try to recover
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError();
                  break;
                default:
                  setError('Video playback failed. Please try again.');
                  hls.destroy();
                  break;
              }
            }
          });

          hlsRef.current = hls;
        } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari native HLS
          videoRef.current.src = playlistUrl;
          videoRef.current.addEventListener('loadedmetadata', () => setLoading(false));
        } else {
          setError('Your browser does not support HLS video playback.');
        }
      } else {
        // ═══ Fallback Mode — Raw MP4 Proxy ═══
        setHlsReady(false);
        const info = await videoApi.getInfo(videoId);
        if (info.video.fallbackUrl) {
          if (videoRef.current) {
            videoRef.current.src = info.video.fallbackUrl;
            videoRef.current.addEventListener('loadedmetadata', () => setLoading(false));
          }
        } else {
          setError('This video is being processed. Please try again in a few minutes.');
          setLoading(false);
        }
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to load video';
      if (err?.status === 403) {
        setError('You are not enrolled in this course.');
      } else if (err?.status === 404) {
        setError('Video not found.');
      } else {
        setError(msg);
      }
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    initStreaming();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [initStreaming]);

  // ─── Video event listeners ───
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setBuffered(video.buffered.length > 0 ? video.buffered.end(video.buffered.length - 1) : 0);
      if (onProgress && video.duration) {
        onProgress(video.currentTime / video.duration, video.currentTime, video.duration);
      }
    };
    const onDurationChange = () => setDuration(video.duration || 0);
    const onEnded = () => { setIsPlaying(false); onComplete?.(); };
    const onWaiting = () => setLoading(true);
    const onCanPlay = () => setLoading(false);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('ended', onEnded);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
    };
  }, [onProgress, onComplete]);

  // ─── DRM: Content protection ───
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Disable picture-in-picture
    video.disablePictureInPicture = true;

    // Set controls list
    video.controlsList = 'nodownload nofullscreen noremoteplayback';

    // Block right-click on video
    const blockContextMenu = (e: Event) => e.preventDefault();
    video.addEventListener('contextmenu', blockContextMenu);

    // Block keyboard shortcuts when video focused
    const blockKeys = (e: KeyboardEvent) => {
      if (['s', 'S'].includes(e.key) && (e.ctrlKey || e.metaKey)) e.preventDefault();
    };
    document.addEventListener('keydown', blockKeys);

    // Pause when tab hidden
    const handleVisibility = () => {
      if (document.hidden && !video.paused) video.pause();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      video.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('keydown', blockKeys);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // ─── Controls auto-hide ───
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  // ─── Playback controls ───
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  }, []);

  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(time, duration));
  }, [duration]);

  const skip = useCallback((seconds: number) => {
    seek(currentTime + seconds);
  }, [currentTime, seek]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const changeVolume = useCallback((v: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = v;
    setVolume(v);
    if (v > 0) { video.muted = false; setIsMuted(false); }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const changeQuality = useCallback((level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setQuality(level);
    }
    setShowQualityMenu(false);
  }, []);

  // ─── Progress bar click ───
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    seek(pos * duration);
  }, [duration, seek]);

  // ─── Error state ───
  if (error) {
    return (
      <div className={`relative aspect-video bg-slate-900 flex items-center justify-center ${className}`}>
        <div className="text-center p-6">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-white text-sm">{error}</p>
          <button
            onClick={initStreaming}
            className="mt-3 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative aspect-video bg-black group select-none ${className}`}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Forensic Watermark (nearly invisible) */}
      {watermarkText && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02] z-10 overflow-hidden"
          style={{ userSelect: 'none' }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-white text-[10px] font-mono whitespace-nowrap"
              style={{
                top: `${8 + (i * 8)}%`,
                left: `${(i * 23) % 80}%`,
                transform: `rotate(-15deg)`,
              }}
            >
              {watermarkText}
            </span>
          ))}
        </div>
      )}

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 z-20"
          >
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-violet-400 animate-spin mx-auto" />
              <p className="text-white/70 text-sm mt-2">Loading video...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thumbnail / Play Button (before play) */}
      {!isPlaying && !loading && currentTime === 0 && thumbnailUrl && (
        <div
          className="absolute inset-0 z-15 cursor-pointer flex items-center justify-center"
          onClick={togglePlay}
        >
          <img src={thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-contain opacity-30" />
          <div className="w-16 h-16 rounded-full bg-violet-600/90 flex items-center justify-center shadow-lg shadow-violet-600/30 hover:scale-110 transition-transform">
            <Play className="w-7 h-7 text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30 flex flex-col justify-end"
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

            {/* Center play/pause */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 text-white" fill="white" />
                ) : (
                  <Play className="w-7 h-7 text-white ml-1" fill="white" />
                )}
              </button>
            </div>

            {/* Bottom controls */}
            <div className="relative px-3 pb-3 space-y-1">
              {/* Progress bar */}
              <div
                ref={progressRef}
                className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group/progress hover:h-2.5 transition-all"
                onClick={handleProgressClick}
              >
                {/* Buffered */}
                <div
                  className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
                  style={{ width: duration ? `${(buffered / duration) * 100}%` : '0%' }}
                />
                {/* Progress */}
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                  style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                />
                {/* Thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity"
                  style={{ left: duration ? `calc(${(currentTime / duration) * 100}% - 7px)` : '-7px' }}
                />
              </div>

              {/* Control buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Skip back 10s */}
                  <button onClick={() => skip(-10)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                    <SkipBack className="w-4 h-4 text-white" />
                  </button>

                  {/* Play/Pause */}
                  <button onClick={togglePlay} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                    {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
                  </button>

                  {/* Skip forward 10s */}
                  <button onClick={() => skip(10)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                    <SkipForward className="w-4 h-4 text-white" />
                  </button>

                  {/* Volume */}
                  <div className="flex items-center gap-1 group/vol">
                    <button onClick={toggleMute} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4 h-4 text-white" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => changeVolume(parseFloat(e.target.value))}
                      className="w-0 group-hover/vol:w-16 transition-all duration-200 accent-violet-500 h-1"
                    />
                  </div>

                  {/* Time */}
                  <span className="text-white/80 text-xs ml-1">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* HLS indicator */}
                  {hlsReady && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-violet-600/50 rounded text-[10px] text-white/80">
                      <Shield className="w-2.5 h-2.5" />
                      HLS
                    </div>
                  )}

                  {/* Quality selector */}
                  {qualities.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => setShowQualityMenu(!showQualityMenu)}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-white" />
                      </button>
                      <AnimatePresence>
                        {showQualityMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full right-0 mb-2 bg-slate-900/95 backdrop-blur-lg rounded-lg shadow-xl border border-white/10 overflow-hidden min-w-[120px]"
                          >
                            <button
                              onClick={() => changeQuality(-1)}
                              className={`w-full px-3 py-2 text-left text-xs hover:bg-white/10 transition-colors ${quality === -1 ? 'text-violet-400' : 'text-white/80'}`}
                            >
                              Auto
                            </button>
                            {qualities.map((q, i) => (
                              <button
                                key={i}
                                onClick={() => changeQuality(i)}
                                className={`w-full px-3 py-2 text-left text-xs hover:bg-white/10 transition-colors ${quality === i ? 'text-violet-400' : 'text-white/80'}`}
                              >
                                {q.name}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Fullscreen */}
                  <button onClick={toggleFullscreen} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                    <Maximize className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
