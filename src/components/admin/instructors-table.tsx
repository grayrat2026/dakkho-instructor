'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCw, Plus, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '@/lib/api-client';

export default function InstructorsTable() {
  const [instructors, setInstructors] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editInstructor, setEditInstructor] = useState<Record<string, unknown> | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({ name: '', email: '', bio: '', specialization: '', avatarUrl: '' });

  const fetchInstructors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      const data = await apiGet(`/instructors?${params}`) as Record<string, unknown>;
      setInstructors((data.documents as Record<string, unknown>[]) || []);
      setTotal((data.total as number) || 0);
    } catch { toast({ title: 'Error', description: 'Failed to fetch instructors', variant: 'destructive' }); }
    finally { setLoading(false); }
  }, [page, search, toast]);

  useEffect(() => { fetchInstructors(); }, [fetchInstructors]);

  const openCreateDialog = () => { setEditInstructor(null); setForm({ name: '', email: '', bio: '', specialization: '', avatarUrl: '' }); setDialogOpen(true); };
  const openEditDialog = (inst: Record<string, unknown>) => {
    setEditInstructor(inst);
    setForm({ name: String(inst.name || ''), email: String(inst.email || ''), bio: String(inst.bio || ''), specialization: String(inst.specialization || ''), avatarUrl: String(inst.avatarUrl || '') });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, rating: 0, totalStudents: 0, totalCourses: 0 };
      if (editInstructor) {
        await apiPut('/instructors', { instructorId: editInstructor.$id, ...payload });
      } else {
        await apiPost('/instructors', payload);
      }
      toast({ title: 'Success' }); setDialogOpen(false); fetchInstructors();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const deleteInstructor = async (id: string) => {
    if (!confirm('Delete this instructor?')) return;
    try { await apiDelete(`/instructors?id=${id}`); toast({ title: 'Deleted' }); fetchInstructors(); } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="glass-card border-0">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search instructors..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 bg-white/5 border-white/10" />
            </div>
            <Button variant="outline" size="icon" onClick={fetchInstructors} className="border-white/10"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button onClick={openCreateDialog} className="gradient-primary text-white"><Plus className="h-4 w-4 mr-2" /> Add Instructor</Button></DialogTrigger>
              <DialogContent className="bg-[#1A1A2E] border-white/10 max-w-lg">
                <DialogHeader><DialogTitle>{editInstructor ? 'Edit Instructor' : 'Add Instructor'}</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-white/5 border-white/10" /></div>
                  <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-white/5 border-white/10" /></div>
                  <div className="space-y-2"><Label>Specialization</Label><Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className="bg-white/5 border-white/10" /></div>
                  <div className="space-y-2"><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="bg-white/5 border-white/10" rows={3} /></div>
                  <Button onClick={handleSave} className="w-full gradient-primary text-white">{editInstructor ? 'Update' : 'Create'}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-0">
        <CardHeader className="pb-3"><CardTitle className="text-lg">Instructors ({total})</CardTitle></CardHeader>
        <CardContent>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Email</TableHead>
                  <TableHead className="text-muted-foreground">Specialization</TableHead>
                  <TableHead className="text-muted-foreground">Students</TableHead>
                  <TableHead className="text-muted-foreground">Courses</TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-white/[0.06]">{Array.from({ length: 6 }).map((_, j) => (<TableCell key={j}><div className="h-5 rounded bg-white/5 animate-pulse" /></TableCell>))}</TableRow>
                  ))
                ) : instructors.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No instructors found</TableCell></TableRow>
                ) : (
                  instructors.map((inst) => (
                    <TableRow key={String(inst.$id)} className="border-white/[0.06] hover:bg-white/[0.03]">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-dakkho-teal/20 flex items-center justify-center text-xs font-semibold text-dakkho-teal">
                            {String(inst.name || 'I').charAt(0).toUpperCase()}
                          </div>
                          {String(inst.name || 'Unknown')}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{String(inst.email || 'N/A')}</TableCell>
                      <TableCell><Badge variant="secondary" className="bg-blue-500/10 text-blue-400">{String(inst.specialization || 'N/A')}</Badge></TableCell>
                      <TableCell className="text-sm">{String(inst.totalStudents ?? 0)}</TableCell>
                      <TableCell className="text-sm">{String(inst.totalCourses ?? 0)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1A1A2E] border-white/10">
                            <DropdownMenuItem onClick={() => openEditDialog(inst)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteInstructor(String(inst.$id))} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
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
            ) : instructors.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No instructors found</p>
            ) : (
              instructors.map((inst) => (
                <div key={String(inst.$id)} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-dakkho-teal/20 flex items-center justify-center text-xs font-semibold text-dakkho-teal">
                          {String(inst.name || 'I').charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm font-medium truncate">{String(inst.name || 'Unknown')}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{String(inst.email || 'N/A')}</p>
                      <div className="flex gap-1 mt-1.5">
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 text-[10px]">
                          {String(inst.specialization || 'N/A')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{String(inst.totalStudents ?? 0)} students &middot; {String(inst.totalCourses ?? 0)} courses</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1A1A2E] border-white/10">
                        <DropdownMenuItem onClick={() => openEditDialog(inst)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteInstructor(String(inst.$id))} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
