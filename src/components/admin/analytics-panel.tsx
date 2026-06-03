'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';

import { apiGet } from '@/lib/api-client';

const COLORS = ['#4A90E2', '#00D4AA', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AnalyticsPanel() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await apiGet('/analytics') as Record<string, unknown>;
      setStats((data.stats as Record<string, number>) || {});
    } catch { console.error('Failed to fetch analytics'); }
    finally { setLoading(false); }
  };

  // Sample data for charts (would come from real API in production)
  const enrollmentData = [
    { month: 'Jan', enrollments: 65 },
    { month: 'Feb', enrollments: 78 },
    { month: 'Mar', enrollments: 90 },
    { month: 'Apr', enrollments: 81 },
    { month: 'May', enrollments: 95 },
    { month: 'Jun', enrollments: 110 },
  ];

  const courseDistribution = [
    { name: 'Beginner', value: 35 },
    { name: 'Intermediate', value: 28 },
    { name: 'Advanced', value: 22 },
    { name: 'Expert', value: 15 },
  ];

  const userGrowth = [
    { month: 'Jan', users: 1200 },
    { month: 'Feb', users: 1450 },
    { month: 'Mar', users: 1780 },
    { month: 'Apr', users: 2100 },
    { month: 'May', users: 2450 },
    { month: 'Jun', users: 2800 },
  ];

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1A1A2E] border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-dakkho-teal">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Users', value: stats.totalUsers ?? 0, icon: Users, color: 'text-blue-400' },
          { title: 'Total Courses', value: stats.totalCourses ?? 0, icon: BookOpen, color: 'text-emerald-400' },
          { title: 'Total Videos', value: stats.totalVideos ?? 0, icon: BarChart3, color: 'text-purple-400' },
          { title: 'Enrollments', value: stats.totalEnrollments ?? 0, icon: TrendingUp, color: 'text-amber-400' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="glass-card border-0">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.title}</p>
                    <p className={`text-2xl font-bold mt-1 ${item.color}`}>
                      {loading ? '...' : item.value.toLocaleString()}
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 ${item.color} opacity-50`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <Card className="glass-card border-0">
          <CardHeader><CardTitle className="text-lg">Enrollment Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="enrollments" fill="#4A90E2" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Course Distribution */}
        <Card className="glass-card border-0">
          <CardHeader><CardTitle className="text-lg">Course Level Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={courseDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {courseDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {courseDistribution.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card className="glass-card border-0 lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">User Growth</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="users" stroke="#00D4AA" strokeWidth={3} dot={{ r: 5, fill: '#00D4AA' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
