'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Plus, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '@/lib/api-client';

export default function InstitutesTable() {
  const [institutes, setInstitutes] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editInstitute, setEditInstitute] = useState<Record<string, unknown> | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({ name: '', code: '', address: '' });

  const fetchInstitutes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet(`/institutes?page=${page}&limit=20`) as Record<string, unknown>;
      setInstitutes((data.documents as Record<string, unknown>[]) || []); setTotal((data.total as number) || 0);
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
    finally { setLoading(false); }
  }, [page, toast]);

  useEffect(() => { fetchInstitutes(); }, [fetchInstitutes]);

  const openCreateDialog = () => { setEditInstitute(null); setForm({ name: '', code: '', address: '' }); setDialogOpen(true); };
  const openEditDialog = (inst: Record<string, unknown>) => {
    setEditInstitute(inst);
    setForm({ name: String(inst.name || ''), code: String(inst.code || ''), address: String(inst.address || '') });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editInstitute) {
        await apiPut('/institutes', { instituteId: editInstitute.$id, ...form });
      } else {
        await apiPost('/institutes', form);
      }
      toast({ title: 'Success' }); setDialogOpen(false); fetchInstitutes();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const deleteInstitute = async (id: string) => {
    if (!confirm('Delete this institute?')) return;
    try { await apiDelete(`/institutes?id=${id}`); toast({ title: 'Deleted' }); fetchInstitutes(); } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="glass-card border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={fetchInstitutes} className="border-white/10"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild><Button onClick={openCreateDialog} className="gradient-primary text-white"><Plus className="h-4 w-4 mr-2" /> Add Institute</Button></DialogTrigger>
              <DialogContent className="bg-[#1A1A2E] border-white/10 max-w-md">
                <DialogHeader><DialogTitle>{editInstitute ? 'Edit Institute' : 'Add Institute'}</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-white/5 border-white/10" /></div>
                  <div className="space-y-2"><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="bg-white/5 border-white/10" /></div>
                  <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="bg-white/5 border-white/10" /></div>
                  <Button onClick={handleSave} className="w-full gradient-primary text-white">{editInstitute ? 'Update' : 'Create'}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-0">
        <CardHeader className="pb-3"><CardTitle className="text-lg">Institutes ({total})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Code</TableHead>
                  <TableHead className="text-muted-foreground">Address</TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-white/[0.06]">{Array.from({ length: 4 }).map((_, j) => (<TableCell key={j}><div className="h-5 rounded bg-white/5 animate-pulse" /></TableCell>))}</TableRow>
                  ))
                ) : institutes.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No institutes found</TableCell></TableRow>
                ) : (
                  institutes.map((inst) => (
                    <TableRow key={String(inst.$id)} className="border-white/[0.06] hover:bg-white/[0.03]">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-xs font-semibold text-amber-400">
                            {String(inst.name || 'I').charAt(0).toUpperCase()}
                          </div>
                          {String(inst.name || 'Unknown')}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">{String(inst.code || 'N/A')}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{String(inst.address || 'N/A')}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1A1A2E] border-white/10">
                            <DropdownMenuItem onClick={() => openEditDialog(inst)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteInstitute(String(inst.$id))} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
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
