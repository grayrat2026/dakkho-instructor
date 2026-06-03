'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  RefreshCw,
  Plus,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '@/lib/api-client';

export default function CoursesTable() {
  const [courses, setCourses] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Record<string, unknown> | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    level: 'beginner',
    language: 'bangla',
    duration: 0,
    isFeatured: false,
    isPublished: false,
  });

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (levelFilter !== 'all') params.set('level', levelFilter);

      const data = await apiGet(`/courses?${params}`) as Record<string, unknown>;
      setCourses((data.documents as Record<string, unknown>[]) || []);
      setTotal((data.total as number) || 0);
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch courses', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [page, search, levelFilter, toast]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const openCreateDialog = () => {
    setEditCourse(null);
    setForm({ title: '', slug: '', description: '', level: 'beginner', language: 'bangla', duration: 0, isFeatured: false, isPublished: false });
    setDialogOpen(true);
  };

  const openEditDialog = (course: Record<string, unknown>) => {
    setEditCourse(course);
    setForm({
      title: String(course.title || ''),
      slug: String(course.slug || ''),
      description: String(course.description || ''),
      level: String(course.level || 'beginner'),
      language: String(course.language || 'bangla'),
      duration: Number(course.duration || 0),
      isFeatured: Boolean(course.isFeatured),
      isPublished: Boolean(course.isPublished),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const payload = { ...form, slug, totalVideos: 0, rating: 0, totalReviews: 0, totalStudents: 0 };

      if (editCourse) {
        await apiPut('/courses', { courseId: editCourse.$id, ...payload });
      } else {
        await apiPost('/courses', payload);
      }
      toast({ title: 'Success', description: `Course ${editCourse ? 'updated' : 'created'}` });
      setDialogOpen(false);
      fetchCourses();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Network error';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const deleteCourse = async (id: string) => {
    if (!confirm('Delete this course?')) return;
    try {
      await apiDelete(`/courses?id=${id}`);
      toast({ title: 'Deleted', description: 'Course deleted' });
      fetchCourses();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Filters */}
      <Card className="glass-card border-0">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search courses..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 bg-white/5 border-white/10" />
            </div>
            <Select value={levelFilter} onValueChange={(v) => { setLevelFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[150px] bg-white/5 border-white/10"><SelectValue placeholder="Level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchCourses} className="border-white/10">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} className="gradient-primary text-white">
                  <Plus className="h-4 w-4 mr-2" /> New Course
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1A1A2E] border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editCourse ? 'Edit Course' : 'Create Course'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug (auto-generated if empty)</Label>
                    <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-white/5 border-white/10" rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Level</Label>
                      <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                        <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                        <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bangla">Bangla</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="hindi">Hindi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className="bg-white/5 border-white/10" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Featured</Label>
                    <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Published</Label>
                    <Switch checked={form.isPublished} onCheckedChange={(v) => setForm({ ...form, isPublished: v })} />
                  </div>
                  <Button onClick={handleSave} className="w-full gradient-primary text-white">
                    {editCourse ? 'Update Course' : 'Create Course'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Courses ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Title</TableHead>
                  <TableHead className="text-muted-foreground">Level</TableHead>
                  <TableHead className="text-muted-foreground">Language</TableHead>
                  <TableHead className="text-muted-foreground">Students</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-white/[0.06]">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><div className="h-5 rounded bg-white/5 animate-pulse" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : courses.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No courses found</TableCell></TableRow>
                ) : (
                  courses.map((course) => (
                    <TableRow key={String(course.$id)} className="border-white/[0.06] hover:bg-white/[0.03]">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {course.isFeatured && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />}
                          <span className="font-medium truncate max-w-[200px]">{String(course.title || 'Untitled')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={
                          course.level === 'expert' ? 'bg-red-500/10 text-red-400' :
                          course.level === 'advanced' ? 'bg-orange-500/10 text-orange-400' :
                          course.level === 'intermediate' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-green-500/10 text-green-400'
                        }>
                          {String(course.level || 'N/A')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{String(course.language || 'N/A')}</TableCell>
                      <TableCell className="text-sm">{String(course.totalStudents ?? 0)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={course.isPublished ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1A1A2E] border-white/10">
                            <DropdownMenuItem onClick={() => openEditDialog(course)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteCourse(String(course.$id))} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-white/5 animate-pulse" />
              ))
            ) : courses.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No courses found</p>
            ) : (
              courses.map((course) => (
                <div key={String(course.$id)} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {course.isFeatured && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />}
                        <p className="text-sm font-medium truncate">{String(course.title || 'Untitled')}</p>
                      </div>
                      <div className="flex gap-1 mt-1.5">
                        <Badge variant="secondary" className={
                          course.level === 'expert' ? 'bg-red-500/10 text-red-400 text-[10px]' :
                          course.level === 'advanced' ? 'bg-orange-500/10 text-orange-400 text-[10px]' :
                          course.level === 'intermediate' ? 'bg-blue-500/10 text-blue-400 text-[10px]' :
                          'bg-green-500/10 text-green-400 text-[10px]'
                        }>
                          {String(course.level || 'N/A')}
                        </Badge>
                        <Badge variant="secondary" className={course.isPublished ? 'bg-green-500/10 text-green-400 text-[10px]' : 'bg-gray-500/10 text-gray-400 text-[10px]'}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{String(course.language || 'N/A')} &middot; {String(course.totalStudents ?? 0)} students</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1A1A2E] border-white/10">
                        <DropdownMenuItem onClick={() => openEditDialog(course)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteCourse(String(course.$id))} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="border-white/10">Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="border-white/10">Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
