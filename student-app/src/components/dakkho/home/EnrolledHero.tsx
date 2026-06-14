'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Clock, Flame, Target, BookOpen, TrendingUp,
  Calendar, ChevronRight, Zap, Star, CheckCircle2, BarChart3, Loader2
} from 'lucide-react';
import { useNavigationStore, useAuthStore } from '@/lib/store';
import { useCourses, useInstructors } from '@/lib/data-hooks';
import { studentProfileApi, learningStatsApi, enrollmentApi } from '@/lib/api-client';
import type { Course, Instructor } from '@/lib/mock-data';
import { GlassCard } from '../shared/GlassCard';

interface RealStats {
  hoursWatched: number;
  videosCompleted: number;
  currentStreak: number;
  xpEarned: number;
}

interface EnrollmentCourse {
  id: string;
  progress: number;
  lastWatched: string;
  nextVideo: string;
  streak: number;
}

export function EnrolledHero() {
  const navigate = useNavigationStore((s) => s.navigate);
  const user = useAuthStore((s) => s.user);
  const [currentTime, setCurrentTime] = useState('');
  const { data: courses } = useCourses({ limit: 30 });
  const { data: instructors } = useInstructors({ limit: 20 });

  // Real stats from API
  const [stats, setStats] = useState<RealStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Enrolled courses from API
  const [enrolledCourses, setEnrolledCourses] = useState<EnrollmentCourse[]>([]);
  const [enrolledLoading, setEnrolledLoading] = useState(true);

  // Fetch real stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await studentProfileApi.stats();
        const s = res.stats;
        setStats({
          hoursWatched: s.hoursWatched || 0,
          videosCompleted: s.coursesEnrolled || 0, // Using coursesEnrolled as proxy
          currentStreak: s.currentStreak || 0,
          xpEarned: s.certificates || 0, // Using certificates as proxy for XP
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        // Fallback: try learning-stats
        try {
          const lsRes = await learningStatsApi.get();
          const o = lsRes.overview;
          setStats({
            hoursWatched: o.hoursWatched || 0,
            videosCompleted: o.coursesEnrolled || 0,
            currentStreak: o.currentStreak || 0,
            xpEarned: o.certificates || 0,
          });
        } catch {
          setStats({ hoursWatched: 0, videosCompleted: 0, currentStreak: 0, xpEarned: 0 });
        }
      } finally {
        setStatsLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Fetch real enrolled courses
  useEffect(() => {
    async function fetchEnrollments() {
      try {
        const res = await enrollmentApi.mine();
        const enrollments = res.enrollments || [];
        setEnrolledCourses(enrollments.map((e: any) => ({
          id: e.course_id,
          progress: e.progress || 0,
          lastWatched: e.updated_at ? formatTimeAgo(e.updated_at) : 'N/A',
          nextVideo: e.course_title || 'Continue Learning',
          streak: 0, // Streak per course not available
        })));
      } catch (err) {
        console.error('Failed to fetch enrollments:', err);
        setEnrolledCourses([]);
      } finally {
        setEnrolledLoading(false);
      }
    }
    fetchEnrollments();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      let greeting = 'Good Morning';
      if (hours >= 12 && hours < 17) greeting = 'Good Afternoon';
      else if (hours >= 17 && hours < 21) greeting = 'Good Evening';
      else if (hours >= 21 || hours < 5) greeting = 'Good Night';
      setCurrentTime(greeting);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const firstName = user?.fullName?.split(' ')[0] || 'Student';

  // Helper to find instructor by id
  const findInstructor = (id: string) => instructors.find((i) => i.id === id);
  // Get the most pressing "continue watching" course
  const primaryCourse = enrolledCourses[0];
  const courseData = primaryCourse ? courses.find((c) => c.id === primaryCourse.id) : null;
  const instructor = courseData ? findInstructor(courseData.instructorId) : null;

  // Stats configuration with real data
  const STATS = [
    { label: 'Hours Watched', value: stats?.hoursWatched ?? 0, icon: Clock, color: 'text-sky-500' },
    { label: 'Courses Joined', value: stats?.videosCompleted ?? 0, icon: Play, color: 'text-emerald-500' },
    { label: 'Day Streak', value: stats?.currentStreak ?? 0, icon: Flame, color: 'text-orange-500' },
    { label: 'Certificates', value: stats?.xpEarned ?? 0, icon: Zap, color: 'text-amber-500' },
  ];

  return (
    <div className="mb-8 space-y-4">
      {/* Greeting + Quick Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 p-6 text-white"
      >
        {/* Decorative elements */}
        <motion.div
          className="absolute top-4 right-8 w-16 h-16 rounded-full bg-white/10"
          animate={{ y: [0, -10, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-4 left-4 w-8 h-8 rounded-full bg-white/10"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10">
          <motion.div
            className="flex items-center gap-2 mb-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-sm font-bold text-white/80">{currentTime}</span>
          </motion.div>

          <motion.h1
            className="text-2xl md:text-3xl font-extrabold mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Welcome back, {firstName}! 👋
          </motion.h1>

          <motion.p
            className="text-sm text-white/80 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {(stats?.currentStreak ?? 0) > 0 ? (
              <>You&apos;re on a <span className="font-bold text-amber-300">{stats?.currentStreak}-day streak</span>! Keep learning to maintain it.</>
            ) : (
              <>Start learning today to build your streak! 🚀</>
            )}
          </motion.p>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <stat.icon className="w-4 h-4 mx-auto mb-1 text-white/90" />
                {statsLoading ? (
                  <Loader2 className="w-4 h-4 mx-auto animate-spin text-white/60" />
                ) : (
                  <p className="text-lg font-extrabold leading-tight">{stat.value}</p>
                )}
                <p className="text-[10px] text-white/60 font-medium leading-tight mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Continue Learning + Enrolled Courses Row */}
      <div className="grid grid-cols-1 gap-4">
        {/* Continue Learning Card */}
        {courseData && primaryCourse && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard
              hover
              className="p-4 cursor-pointer overflow-hidden"
              onClick={() => navigate('course-detail', { courseId: courseData.id })}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white" fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground">Continue Learning</h3>
                  <p className="text-xs text-muted-foreground">Pick up where you left off</p>
                </div>
              </div>

              {/* Course info */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-foreground line-clamp-1">{courseData.title}</p>
                  <p className="text-xs text-muted-foreground">{instructor?.name} • {primaryCourse.lastWatched}</p>
                </div>

                {/* Next video */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-50 dark:bg-sky-900/20">
                  <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0">
                    <Play className="w-3 h-3 text-white ml-0.5" fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-sky-700 dark:text-sky-300">Up Next</p>
                    <p className="text-xs text-foreground line-clamp-1">{primaryCourse.nextVideo}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-muted-foreground">Progress</span>
                    <span className="text-xs font-bold text-sky-500">{primaryCourse.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${primaryCourse.progress}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* No enrolled courses yet */}
        {!enrolledLoading && enrolledCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard className="p-6 text-center">
              <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-foreground mb-1">No courses yet</h3>
              <p className="text-xs text-muted-foreground mb-3">Enroll in a course to start tracking your progress</p>
              <motion.button
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold shadow-lg shadow-sky-500/20"
                onClick={() => navigate('explore')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Courses
              </motion.button>
            </GlassCard>
          </motion.div>
        )}

        {/* Enrolled Courses Progress List */}
        {enrolledCourses.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-sky-500" />
                  <h3 className="text-sm font-bold text-foreground">Your Courses</h3>
                </div>
                <motion.button
                  className="text-xs font-semibold text-sky-500 flex items-center gap-1"
                  onClick={() => navigate('my-courses')}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View All <ChevronRight className="w-3 h-3" />
                </motion.button>
              </div>

              <div className="space-y-2.5">
                {enrolledCourses.slice(0, 4).map((enrolled, i) => {
                  const course = courses.find((c) => c.id === enrolled.id);
                  if (!course) return null;
                  const inst = findInstructor(course.instructorId);
                  return (
                    <motion.div
                      key={enrolled.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/40 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.05 }}
                      onClick={() => navigate('course-detail', { courseId: course.id })}
                    >
                      {/* Progress circle */}
                      <div className="relative w-10 h-10 flex-shrink-0">
                        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            className="text-muted/30"
                            strokeWidth="3.5"
                          />
                          <motion.path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={enrolled.progress >= 80 ? '#10b981' : enrolled.progress >= 50 ? '#0ea5e9' : '#f59e0b'}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: enrolled.progress / 100 }}
                            transition={{ duration: 0.8, delay: 0.7 + i * 0.05 }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[9px] font-extrabold text-foreground">{enrolled.progress}%</span>
                        </div>
                      </div>

                      {/* Course info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground line-clamp-1">{course.title}</p>
                        <p className="text-[10px] text-muted-foreground">{inst?.name} • {enrolled.lastWatched}</p>
                      </div>

                      {/* Streak */}
                      {enrolled.streak > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 flex-shrink-0">
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">{enrolled.streak}</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Utility: format time ago
function formatTimeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
