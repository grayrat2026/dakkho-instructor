'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, CheckCircle, Loader2, PlayCircle } from 'lucide-react';
import { enrollmentApi, type EnrollmentWithCourse } from '@/lib/api-client';
import { useAuthStore, useNavigationStore } from '@/lib/store';
import { useWatchProgressStore } from '@/lib/store';
import { mapApiCourse } from '@/components/dakkho/shared/apiMappers';
import type { Course } from '@/lib/mock-data';
import { GlassCard } from '../shared/GlassCard';

export function MyCoursesPage() {
  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed' | 'all'>('all');
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigationStore((s) => s.navigate);
  const watchProgress = useWatchProgressStore((s) => s.progress);

  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the user's enrollments from the API
  const fetchEnrollments = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      setEnrollments([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await enrollmentApi.mine();
      setEnrollments(res.enrollments || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load enrollments');
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  // Convert enrollment data to Course objects for display
  const enrolledCourses: Course[] = enrollments.map((enr) =>
    mapApiCourse({
      id: enr.course_id,
      title: enr.course_title || 'Unknown Course',
      description: enr.course_description || '',
      thumbnail_url: enr.course_thumbnail || '',
      thumbnailUrl: enr.course_thumbnail || '',
      technology_id: enr.course_technology_id || '',
      categoryId: enr.course_technology_id || '',
      level: enr.course_level || 'beginner',
      duration: enr.course_duration || 0,
      total_videos: enr.course_total_videos || 0,
      totalVideos: enr.course_total_videos || 0,
      rating: enr.course_rating || 0,
      is_featured: enr.course_is_featured || 0,
      isFeatured: !!enr.course_is_featured,
      price: enr.course_price || 0,
    })
  );

  // Compute per-course progress from watch progress store
  const getCourseProgress = (courseId: string): number => {
    const courseVideos = Object.values(watchProgress).filter(
      (wp) => wp.courseId === courseId
    );
    if (courseVideos.length === 0) return 0;
    const totalProgress = courseVideos.reduce((sum, wp) => sum + wp.progress, 0);
    return Math.round(totalProgress / courseVideos.length);
  };

  // Filter by tab
  const displayCourses = (() => {
    switch (activeTab) {
      case 'in-progress':
        return enrolledCourses.filter((c) => {
          const progress = getCourseProgress(c.id);
          return progress > 0 && progress < 100;
        });
      case 'completed':
        return enrolledCourses.filter((c) => {
          const progress = getCourseProgress(c.id);
          return progress >= 100;
        });
      case 'all':
      default:
        return enrolledCourses;
    }
  })();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
        <p className="text-sm text-muted-foreground font-semibold">Loading your courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-lg font-bold text-red-500">Failed to load courses</p>
        <p className="text-sm text-muted-foreground mt-2">{error}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-16">
        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">Please login first</h3>
        <p className="text-sm text-muted-foreground/60 mt-1">Login to see your enrolled courses.</p>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-extrabold text-foreground mb-2">My Courses</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {enrolledCourses.length > 0
            ? `${enrolledCourses.length} course${enrolledCourses.length !== 1 ? 's' : ''} enrolled`
            : 'Track your learning progress'}
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted/30 rounded-xl p-1">
        {[
          { key: 'all' as const, label: 'All', icon: BookOpen },
          { key: 'in-progress' as const, label: 'In Progress', icon: Clock },
          { key: 'completed' as const, label: 'Completed', icon: CheckCircle },
        ].map((tab) => (
          <motion.button
            key={tab.key}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-white dark:bg-slate-800 shadow-sm text-sky-600 dark:text-sky-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab(tab.key)}
            whileTap={{ scale: 0.97 }}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Course grid */}
      {displayCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayCourses.map((course, i) => {
            const progress = getCourseProgress(course.id);
            const enrollment = enrollments.find((e) => e.course_id === course.id);
            const expiresAt = enrollment?.expires_at;

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard
                  hover
                  className="overflow-hidden cursor-pointer group"
                  onClick={() => navigate('course-detail', { courseId: course.id })}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-sky-400 to-blue-600">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle className="w-10 h-10 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayCircle className="w-6 h-6 text-sky-600" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 space-y-2">
                    <h3 className="text-sm font-bold text-foreground line-clamp-2">{course.title}</h3>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-sky-500">{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 }}
                        />
                      </div>
                    </div>

                    {/* Expiry info */}
                    {expiresAt && (
                      <p className="text-[10px] text-muted-foreground">
                        Expires {new Date(expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">
            {activeTab === 'in-progress' ? 'No courses in progress' : activeTab === 'completed' ? 'No completed courses yet' : enrolledCourses.length === 0 ? 'No enrolled courses yet' : 'No courses found'}
          </h3>
          <p className="text-sm text-muted-foreground/60 mt-1">
            {activeTab === 'all' && enrolledCourses.length === 0
              ? 'Enroll in courses to see them here.'
              : 'Keep learning to see courses here.'}
          </p>
        </div>
      )}
    </div>
  );
}
