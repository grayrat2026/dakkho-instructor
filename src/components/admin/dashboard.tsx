'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  Video,
  GraduationCap,
  TrendingUp,
  UserPlus,
  Activity,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/lib/types';
import { apiGet } from '@/lib/api-client';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [popularCourses, setPopularCourses] = useState<unknown[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await apiGet('/analytics') as Record<string, unknown>;
      setStats(data.stats as DashboardStats);
      setPopularCourses((data.popularCourses as unknown[]) || []);
      setRecentEnrollments((data.recentEnrollments as unknown[]) || []);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'from-blue-500 to-cyan-400', bgColor: 'bg-blue-500/10', textColor: 'text-blue-400' },
    { title: 'Total Courses', value: stats?.totalCourses ?? 0, icon: BookOpen, color: 'from-emerald-500 to-teal-400', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-400' },
    { title: 'Total Videos', value: stats?.totalVideos ?? 0, icon: Video, color: 'from-purple-500 to-pink-400', bgColor: 'bg-purple-500/10', textColor: 'text-purple-400' },
    { title: 'Enrollments', value: stats?.totalEnrollments ?? 0, icon: GraduationCap, color: 'from-amber-500 to-orange-400', bgColor: 'bg-amber-500/10', textColor: 'text-amber-400' },
    { title: 'New Today', value: stats?.newSignupsToday ?? 0, icon: UserPlus, color: 'from-rose-500 to-red-400', bgColor: 'bg-rose-500/10', textColor: 'text-rose-400' },
    { title: 'Active Sessions', value: stats?.activeSessions ?? 0, icon: Activity, color: 'from-cyan-500 to-blue-400', bgColor: 'bg-cyan-500/10', textColor: 'text-cyan-400' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} variants={itemVariants}>
              <Card className="glass-card glass-card-hover border-0 transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className={`text-3xl font-bold mt-1 ${stat.textColor}`}>
                        {loading ? '...' : stat.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${stat.textColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Courses */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400" />
                Popular Courses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : popularCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No course data available</p>
              ) : (
                (popularCourses as Record<string, unknown>[]).slice(0, 5).map((course, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{(course.title as string) || 'Untitled'}</p>
                        <p className="text-xs text-muted-foreground">{(course.level as string) || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-sm font-semibold text-dakkho-teal">{String(course.totalStudents ?? 0)}</p>
                      <p className="text-xs text-muted-foreground">students</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-dakkho-teal" />
                Recent Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : recentEnrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No enrollment data available</p>
              ) : (
                (recentEnrollments as Record<string, unknown>[]).slice(0, 8).map((enrollment, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">User {String(enrollment.userId ?? 'Unknown').slice(0, 8)}...</p>
                      <p className="text-xs text-muted-foreground">Course: {String(enrollment.courseId ?? 'N/A').slice(0, 8)}...</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-sm font-semibold">{String(enrollment.progress ?? 0)}%</p>
                      <p className="text-xs text-muted-foreground">
                        {enrollment.completed ? 'Completed' : 'In Progress'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Info */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">DAKKHO Admin Panel</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage users, courses, videos, and platform configuration from this dashboard.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-dakkho-teal animate-pulse-glow" />
                <span className="text-muted-foreground">System Online</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
