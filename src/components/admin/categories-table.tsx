'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Plus, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '@/lib/api-client';

export default function CategoriesTable() {
  const [categories, setCategories] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Record<string, unknown> | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({ name: '', slug: '', icon: '', color: '', order: 0 });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet('/categories?limit=50') as Record<string, unknown>;
      setCategories((data.documents as Record<string, unknown>[]) || []); setTotal((data.total as number) || 0);
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreateDialog = () => { setEditCategory(null); setForm({ name: '', slug: '', icon: '', color: '', order: 0 }); setDialogOpen(true); };
  const openEditDialog = (cat: Record<string, unknown>) => {
    setEditCategory(cat);
    setForm({ name: String(cat.name || ''), slug: String(cat.slug || ''), icon: String(cat.icon || ''), color: String(cat.color || ''), order: Number(cat.order || 0) });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const payload = { ...form, slug };
      if (editCategory) {
        await apiPut('/categories', { categoryId: editCategory.$id, ...payload });
      } else {
        await apiPost('/categories', payload);
      }
      toast({ title: 'Success' }); setDialogOpen(false); fetchCategories();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try { await apiDelete(`/categories?id=${id}`); toast({ title: 'Deleted' }); fetchCategories(); } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="glass-card border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={fetchCategories} className="border-white/10"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button onClick={openCreateDialog} className="gradient-primary text-white"><Plus className="h-4 w-4 mr-2" /> Add Category</Button></DialogTrigger>
              <DialogContent className="bg-[#1A1A2E] border-white/10 max-w-md">
                <DialogHeader><DialogTitle>{editCategory ? 'Edit Category' : 'Add Category'}</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-white/5 border-white/10" /></div>
                  <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="bg-white/5 border-white/10" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Icon</Label><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="bg-white/5 border-white/10" placeholder="emoji" /></div>
                    <div className="space-y-2"><Label>Color</Label><Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="bg-white/5 border-white/10" placeholder="#hex" /></div>
                  </div>
                  <div className="space-y-2"><Label>Order</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="bg-white/5 border-white/10" /></div>
                  <Button onClick={handleSave} className="w-full gradient-primary text-white">{editCategory ? 'Update' : 'Create'}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-0">
        <CardHeader className="pb-3"><CardTitle className="text-lg">Categories ({total})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Icon</TableHead>
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Slug</TableHead>
                  <TableHead className="text-muted-foreground">Order</TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-white/[0.06]">{Array.from({ length: 5 }).map((_, j) => (<TableCell key={j}><div className="h-5 rounded bg-white/5 animate-pulse" /></TableCell>))}</TableRow>
                  ))
                ) : categories.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No categories found</TableCell></TableRow>
                ) : (
                  categories.map((cat) => (
                    <TableRow key={String(cat.$id)} className="border-white/[0.06] hover:bg-white/[0.03]">
                      <TableCell>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: String(cat.color || '#4A90E2') + '20' }}>
                          {String(cat.icon || '📁')}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{String(cat.name || 'Unnamed')}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{String(cat.slug || 'N/A')}</TableCell>
                      <TableCell className="text-sm">{String(cat.order ?? 0)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1A1A2E] border-white/10">
                            <DropdownMenuItem onClick={() => openEditDialog(cat)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteCategory(String(cat.$id))} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
