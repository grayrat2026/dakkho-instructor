'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Plus, Search, Package, Trash2, Edit, X, Zap, User, Users, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '@/lib/api-client';
import type { CoursePackage, Course } from '@/lib/types';

const EMPTY_FORM = {
  courseId: '',
  packageType: 'single' as 'single' | 'dual' | 'friend' | 'custom' | 'basic' | 'standard' | 'premium',
  price: '',
  durationMonths: '6',
  maxUsers: '1',
  isAutoAssign: false,
  isActive: true,
};

// Package type config with icons, colors, and descriptions
const PACKAGE_TYPES = {
  single: { label: 'Single', description: '1 user access — perfect for individual learners', icon: User, color: 'bg-sky-500/10 text-sky-400 border-sky-500/20', maxUsersDefault: 1 },
  dual: { label: 'Dual Pack', description: '2 users — share with a friend!', icon: Users, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', maxUsersDefault: 2 },
  friend: { label: 'Friend Pack', description: '2 users — share with a friend!', icon: Users, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', maxUsersDefault: 2 },
  custom: { label: 'Custom Pack', description: '5+ users — group learning', icon: Package, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', maxUsersDefault: 5 },
  basic: { label: 'Basic', description: 'Basic package', icon: Package, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', maxUsersDefault: 1 },
  standard: { label: 'Standard', description: 'Standard package', icon: Package, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', maxUsersDefault: 1 },
  premium: { label: 'Premium', description: 'Premium package', icon: Package, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', maxUsersDefault: 1 },
} as const;

const TYPE_COLORS: Record<string, string> = {
  single: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  dual: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  friend: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  custom: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  basic: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  standard: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  premium: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const TYPE_LABELS: Record<string, string> = {
  single: 'Single (1 User)',
  dual: 'Dual Pack (2 Users)',
  friend: 'Friend Pack (2 Users)',
  custom: 'Custom Pack (5+ Users)',
  basic: 'Basic',
  standard: 'Standard',
  premium: 'Premium',
};

export default function PackagesPanel() {
  const [packages, setPackages] = useState<CoursePackage[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [autoGenResult, setAutoGenResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet('/packages?page=1&limit=100') as any;
      setPackages(data.packages || data.documents || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load packages');
      toast({ title: 'Error loading packages', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchCourses = useCallback(async () => {
    try {
      const data = await apiGet('/courses?page=1&limit=500') as any;
      setCourses(data.courses || data.documents || []);
    } catch {
      // silently fail — course select will just be empty
    }
  }, []);

  useEffect(() => {
    fetchPackages();
    fetchCourses();
  }, [fetchPackages, fetchCourses]);

  const getCourseTitle = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return course?.title || courseId;
  };

  // Count courses without packages
  const coursesWithoutPackages = courses.filter((c) =>
    !packages.some((p) => p.courseId === c.id)
  );

  const filtered = packages.filter((pkg) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      getCourseTitle(pkg.courseId).toLowerCase().includes(q) ||
      pkg.packageType.toLowerCase().includes(q)
    );
  });

  // Group packages by course for better overview
  const packagesByCourse = filtered.reduce((acc, pkg) => {
    const key = pkg.courseId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(pkg);
    return acc;
  }, {} as Record<string, CoursePackage[]>);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openCreateForCourse = (courseId: string) => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, courseId });
    setDialogOpen(true);
  };

  const openEdit = (pkg: CoursePackage) => {
    setEditingId(pkg.id);
    setForm({
      courseId: pkg.courseId,
      packageType: pkg.packageType,
      price: String(pkg.price),
      durationMonths: String(pkg.durationMonths),
      maxUsers: String(pkg.maxUsers),
      isAutoAssign: pkg.isAutoAssign === 1,
      isActive: pkg.isActive === 1,
    });
    setDialogOpen(true);
  };

  // Auto-update maxUsers when package type changes
  const handlePackageTypeChange = (type: string) => {
    const typeConfig = PACKAGE_TYPES[type as keyof typeof PACKAGE_TYPES];
    setForm({
      ...form,
      packageType: type as any,
      maxUsers: typeConfig ? String(typeConfig.maxUsersDefault) : form.maxUsers,
    });
  };

  // Auto-set price based on course price and package type
  const handleCourseChange = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      const basePrice = course.price || 0;
      let suggestedPrice = basePrice;
      if (form.packageType === 'dual' || form.packageType === 'friend') {
        suggestedPrice = Math.round(basePrice * 1.6);
      } else if (form.packageType === 'custom') {
        suggestedPrice = Math.round(basePrice * 3);
      }
      setForm({ ...form, courseId, price: String(suggestedPrice) });
    } else {
      setForm({ ...form, courseId });
    }
  };

  const handleSubmit = async () => {
    if (!form.courseId || !form.price) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        course_id: form.courseId,
        package_type: form.packageType,
        price: parseFloat(form.price),
        duration_months: parseInt(form.durationMonths) || 1,
        max_users: parseInt(form.maxUsers) || 1,
        is_auto_assign: form.isAutoAssign ? 1 : 0,
        is_active: form.isActive ? 1 : 0,
      };

      if (editingId) {
        await apiPut(`/packages`, { id: editingId, ...payload });
        toast({ title: 'Package updated!' });
      } else {
        await apiPost('/packages', payload);
        toast({ title: 'Package created!' });
      }
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      fetchPackages();
    } catch (err) {
      toast({
        title: editingId ? 'Update failed' : 'Create failed',
        description: err instanceof ApiError ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this package?')) return;
    try {
      await apiDelete(`/packages/${id}`);
      toast({ title: 'Package deleted' });
      fetchPackages();
    } catch {
      toast({ title: 'Error deleting package', variant: 'destructive' });
    }
  };

  // Auto-generate packages for courses that don't have any
  const handleAutoGenerate = async () => {
    setAutoGenerating(true);
    setAutoGenResult(null);
    try {
      // Run migration which auto-creates packages
      const result = await apiPost('/migrate', {}) as any;
      setAutoGenResult({
        success: true,
        message: `Migration completed! Packages generated for courses without packages.`,
      });
      toast({ title: 'Packages auto-generated!' });
      fetchPackages();
      fetchCourses();
    } catch (err) {
      const errMsg = err instanceof ApiError ? err.message : 'Unknown error';
      setAutoGenResult({ success: false, message: errMsg });
      toast({ title: 'Auto-generation failed', description: errMsg, variant: 'destructive' });
    } finally {
      setAutoGenerating(false);
    }
  };

  const toggleAutoAssign = async (pkg: CoursePackage) => {
    try {
      await apiPut('/packages', {
        id: pkg.id,
        is_auto_assign: pkg.isAutoAssign === 1 ? 0 : 1,
      });
      fetchPackages();
    } catch {
      toast({ title: 'Error toggling auto-assign', variant: 'destructive' });
    }
  };

  const toggleActive = async (pkg: CoursePackage) => {
    try {
      await apiPut('/packages', {
        id: pkg.id,
        is_active: pkg.isActive === 1 ? 0 : 1,
      });
      fetchPackages();
    } catch {
      toast({ title: 'Error toggling active status', variant: 'destructive' });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Page Header */}
      <Card className="glass-card border-0">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={fetchPackages} className="border-white/10">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-dakkho-teal" />
                Course Packages
                <span className="text-sm font-normal text-muted-foreground">({total})</span>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search packages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-white/[0.04] border-white/[0.08] w-56"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
              {coursesWithoutPackages.length > 0 && (
                <Button
                  onClick={handleAutoGenerate}
                  disabled={autoGenerating}
                  variant="outline"
                  className="border-dakkho-teal/30 text-dakkho-teal hover:bg-dakkho-teal/10"
                >
                  {autoGenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Auto-Generate ({coursesWithoutPackages.length})
                </Button>
              )}
              <Button onClick={openCreate} className="gradient-primary text-white">
                <Plus className="h-4 w-4 mr-2" /> Create Package
              </Button>
            </div>
          </div>

          {/* Auto-generate result */}
          {autoGenResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-3 flex items-center gap-2 p-3 rounded-lg ${
                autoGenResult.success
                  ? 'bg-emerald-500/10 border border-emerald-500/20'
                  : 'bg-red-500/10 border border-red-500/20'
              }`}
            >
              {autoGenResult.success ? (
                <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              )}
              <span className={`text-xs ${autoGenResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                {autoGenResult.message}
              </span>
              <button onClick={() => setAutoGenResult(null)} className="ml-auto">
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Courses without packages warning */}
      {coursesWithoutPackages.length > 0 && !loading && (
        <Card className="glass-card border-0 border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Courses without packages</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {coursesWithoutPackages.length} course{coursesWithoutPackages.length > 1 ? 's' : ''} don&apos;t have any packages yet. Students won&apos;t be able to enroll in these courses.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {coursesWithoutPackages.slice(0, 5).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => openCreateForCourse(c.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-xs hover:bg-dakkho-teal/10 hover:border-dakkho-teal/20 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      {c.title}
                    </button>
                  ))}
                  {coursesWithoutPackages.length > 5 && (
                    <span className="text-xs text-muted-foreground px-2 py-1">+{coursesWithoutPackages.length - 5} more</span>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleAutoGenerate}
                disabled={autoGenerating}
                className="gradient-primary text-white"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Auto-Generate All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="glass-card border-0">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-3">{error}</p>
            <Button variant="outline" onClick={fetchPackages} className="border-white/10">
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Data Table - Grouped by Course */}
      {!error && (
        <Card className="glass-card border-0">
          <CardContent className="p-0">
            <div className="hidden md:block overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Duration</th>
                    <th>Max Users</th>
                    <th>Auto-assign</th>
                    <th>Active</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j}><div className="h-5 rounded bg-white/5 animate-shimmer" /></td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-muted-foreground">
                        <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>No packages found</p>
                        {search && <p className="text-xs mt-1">Try adjusting your search</p>}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((pkg) => {
                      const typeConfig = PACKAGE_TYPES[pkg.packageType as keyof typeof PACKAGE_TYPES];
                      return (
                        <tr key={pkg.id}>
                          <td className="font-medium max-w-[200px] truncate">
                            {getCourseTitle(pkg.courseId)}
                          </td>
                          <td>
                            <Badge className={`${TYPE_COLORS[pkg.packageType] || 'bg-white/5'} border text-xs`}>
                              {typeConfig?.icon && <typeConfig.icon className="h-3 w-3 mr-1 inline" />}
                              {TYPE_LABELS[pkg.packageType] || pkg.packageType}
                            </Badge>
                          </td>
                          <td className="font-semibold">৳{pkg.price.toLocaleString()}</td>
                          <td className="text-sm">{pkg.durationMonths} {pkg.durationMonths === 1 ? 'month' : 'months'}</td>
                          <td className="text-sm">{pkg.maxUsers}</td>
                          <td>
                            <Switch
                              checked={pkg.isAutoAssign === 1}
                              onCheckedChange={() => toggleAutoAssign(pkg)}
                            />
                          </td>
                          <td>
                            <Switch
                              checked={pkg.isActive === 1}
                              onCheckedChange={() => toggleActive(pkg)}
                            />
                          </td>
                          <td className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(pkg)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(pkg.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden p-4 space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-lg bg-white/5 animate-shimmer" />
                ))
              ) : filtered.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No packages found</p>
                </div>
              ) : (
                // Group by course on mobile
                Object.entries(packagesByCourse).map(([courseId, pkgs]) => (
                  <div key={courseId} className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {getCourseTitle(courseId)}
                    </p>
                    {pkgs.map((pkg) => {
                      const typeConfig = PACKAGE_TYPES[pkg.packageType as keyof typeof PACKAGE_TYPES];
                      return (
                        <div key={pkg.id} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge className={`${TYPE_COLORS[pkg.packageType] || 'bg-white/5'} border text-xs`}>
                                  {typeConfig?.icon && <typeConfig.icon className="h-3 w-3 mr-1 inline" />}
                                  {TYPE_LABELS[pkg.packageType] || pkg.packageType}
                                </Badge>
                                <span className="text-sm font-semibold">৳{pkg.price.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`status-badge ${pkg.isActive === 1 ? 'status-badge-active' : 'status-badge-inactive'}`}>
                                {pkg.isActive === 1 ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{pkg.durationMonths}mo · {pkg.maxUsers} users</span>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(pkg)}>
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(pkg.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog - Enhanced UI */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#141428] border-white/[0.08] max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-dakkho-teal" />
              {editingId ? 'Edit Package' : 'Create Package'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Course Select */}
            <div className="space-y-2">
              <Label>Course *</Label>
              <select
                value={form.courseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full h-9 rounded-md bg-white/[0.04] border border-white/[0.08] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-dakkho-blue"
              >
                <option value="">Select a course...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title} — ৳{c.price}</option>
                ))}
              </select>
            </div>

            {/* Package Type - Visual Selection */}
            <div className="space-y-2">
              <Label>Package Type *</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['single', 'dual', 'custom'] as const).map((type) => {
                  const config = PACKAGE_TYPES[type];
                  const Icon = config.icon;
                  const isSelected = form.packageType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => handlePackageTypeChange(type)}
                      className={`p-2.5 rounded-lg border-2 text-center transition-all ${
                        isSelected
                          ? 'border-dakkho-teal bg-dakkho-teal/10'
                          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                      }`}
                    >
                      <Icon className={`h-4 w-4 mx-auto mb-1 ${isSelected ? 'text-dakkho-teal' : 'text-muted-foreground'}`} />
                      <p className={`text-xs font-bold ${isSelected ? 'text-dakkho-teal' : 'text-muted-foreground'}`}>{config.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{config.maxUsersDefault} user{config.maxUsersDefault > 1 ? 's' : ''}</p>
                    </button>
                  );
                })}
              </div>
              {/* More package types */}
              <details className="group">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  More types (friend, basic, standard, premium)
                </summary>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {(['friend', 'basic', 'standard', 'premium'] as const).map((type) => {
                    const config = PACKAGE_TYPES[type];
                    const Icon = config.icon;
                    const isSelected = form.packageType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => handlePackageTypeChange(type)}
                        className={`p-2 rounded-lg border-2 text-center transition-all ${
                          isSelected
                            ? 'border-dakkho-teal bg-dakkho-teal/10'
                            : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                        }`}
                      >
                        <Icon className={`h-3 w-3 mx-auto mb-1 ${isSelected ? 'text-dakkho-teal' : 'text-muted-foreground'}`} />
                        <p className={`text-[10px] font-bold ${isSelected ? 'text-dakkho-teal' : 'text-muted-foreground'}`}>{config.label}</p>
                      </button>
                    );
                  })}
                </div>
              </details>
            </div>

            {/* Price & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Price (৳) *</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="bg-white/[0.04] border-white/[0.08]"
                  placeholder="0"
                />
                {/* Price hint */}
                {form.courseId && (() => {
                  const course = courses.find((c) => c.id === form.courseId);
                  if (course && course.price > 0) {
                    const base = course.price;
                    const hint = form.packageType === 'dual' || form.packageType === 'friend'
                      ? `Suggested: ৳${Math.round(base * 1.6)} (${base} × 1.6)`
                      : form.packageType === 'custom'
                        ? `Suggested: ৳${Math.round(base * 3)} (${base} × 3)`
                        : `Course price: ৳${base}`;
                    return <p className="text-[10px] text-muted-foreground">{hint}</p>;
                  }
                  return null;
                })()}
              </div>
              <div className="space-y-2">
                <Label>Duration (months)</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.durationMonths}
                  onChange={(e) => setForm({ ...form, durationMonths: e.target.value })}
                  className="bg-white/[0.04] border-white/[0.08]"
                />
              </div>
            </div>

            {/* Max Users */}
            <div className="space-y-2">
              <Label>Max Users per Package</Label>
              <Input
                type="number"
                min="1"
                value={form.maxUsers}
                onChange={(e) => setForm({ ...form, maxUsers: e.target.value })}
                className="bg-white/[0.04] border-white/[0.08]"
              />
            </div>

            {/* Switches */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-assign">Auto-assign to enrolled students</Label>
                <Switch
                  id="auto-assign"
                  checked={form.isAutoAssign}
                  onCheckedChange={(checked) => setForm({ ...form, isAutoAssign: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="pkg-active">Active</Label>
                <Switch
                  id="pkg-active"
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full gradient-primary text-white"
            >
              {submitting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {editingId ? 'Update Package' : 'Create Package'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
