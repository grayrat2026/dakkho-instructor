'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw, Plus, Trophy, Trash2, Edit, X, Star,
  Flame, Users, Sparkles, TrendingUp, Award, Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost, apiPut, apiDelete, ApiError } from '@/lib/api-client';
import type { AchievementDefinition, StudentAchievement } from '@/lib/types';

interface AchievementWithUnlocks extends AchievementDefinition {
  unlockCount?: number;
}

const EMPTY_FORM = {
  slug: '',
  name: '',
  name_bn: '',
  description: '',
  description_bn: '',
  category: 'learning' as 'learning' | 'streaks' | 'social' | 'special',
  icon: '🏆',
  xp: '10',
  condition_type: '',
  condition_value: '',
  is_active: true,
};

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; gradient: string }> = {
  learning: { label: 'Learning', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: <Zap className="h-3.5 w-3.5" />, gradient: 'from-blue-500 to-cyan-500' },
  streaks: { label: 'Streaks', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: <Flame className="h-3.5 w-3.5" />, gradient: 'from-orange-500 to-red-500' },
  social: { label: 'Social', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20', icon: <Users className="h-3.5 w-3.5" />, gradient: 'from-pink-500 to-purple-500' },
  special: { label: 'Special', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: <Sparkles className="h-3.5 w-3.5" />, gradient: 'from-amber-500 to-yellow-500' },
};

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function AchievementsPanel() {
  const [achievements, setAchievements] = useState<AchievementWithUnlocks[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet('/achievements?page=1&limit=100') as any;
      setAchievements(data.achievements || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load achievements');
      toast({ title: 'Error loading achievements', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  // Compute stats
  const totalUnlocks = achievements.reduce((sum, a) => sum + (a.unlockCount || 0), 0);
  const learningCount = achievements.filter((a) => a.category === 'learning').length;
  const mostPopular = achievements.length > 0
    ? achievements.reduce((best, a) => ((a.unlockCount || 0) > (best.unlockCount || 0) ? a : best), achievements[0])
    : null;

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (ach: AchievementDefinition) => {
    setEditingId(ach.id);
    setForm({
      slug: ach.slug,
      name: ach.name,
      name_bn: ach.name_bn || '',
      description: ach.description,
      description_bn: ach.description_bn || '',
      category: ach.category,
      icon: ach.icon,
      xp: String(ach.xp),
      condition_type: ach.condition_type,
      condition_value: ach.condition_value,
      is_active: ach.is_active === 1,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.slug || !form.name || !form.description) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        slug: form.slug,
        name: form.name,
        name_bn: form.name_bn || null,
        description: form.description,
        description_bn: form.description_bn || null,
        category: form.category,
        icon: form.icon,
        xp: parseInt(form.xp) || 10,
        condition_type: form.condition_type,
        condition_value: form.condition_value,
        is_active: form.is_active ? 1 : 0,
      };

      if (editingId) {
        await apiPut('/achievements', { id: editingId, ...payload });
        toast({ title: 'Achievement updated!' });
      } else {
        await apiPost('/achievements', payload);
        toast({ title: 'Achievement created!' });
      }
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      fetchAchievements();
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
    if (!confirm('Delete this achievement definition?')) return;
    try {
      await apiDelete(`/achievements/${id}`);
      toast({ title: 'Achievement deleted' });
      fetchAchievements();
    } catch {
      toast({ title: 'Error deleting achievement', variant: 'destructive' });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Page Header */}
      <Card className="glass-card border-0">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={fetchAchievements} className="border-white/10">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-dakkho-warning" />
                Achievements
                <span className="text-sm font-normal text-muted-foreground">({total})</span>
              </h2>
            </div>
            <Button onClick={openCreate} className="gradient-primary text-white">
              <Plus className="h-4 w-4 mr-2" /> Create Achievement
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-stat-blue flex items-center justify-center">
                <Trophy className="h-5 w-5 text-dakkho-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold">{total}</p>
                <p className="text-xs text-muted-foreground">Total Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-stat-teal flex items-center justify-center">
                <Star className="h-5 w-5 text-dakkho-teal" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalUnlocks}</p>
                <p className="text-xs text-muted-foreground">Total Unlocked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-stat-purple flex items-center justify-center">
                <Zap className="h-5 w-5 text-dakkho-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold">{learningCount}</p>
                <p className="text-xs text-muted-foreground">Learning Category</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-stat-amber flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-dakkho-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mostPopular?.unlockCount || 0}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[100px]">
                  {mostPopular ? mostPopular.name : 'Most Popular'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="glass-card border-0">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-3">{error}</p>
            <Button variant="outline" onClick={fetchAchievements} className="border-white/10">
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Achievement Cards Grid */}
      {!error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="glass-card border-0">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 animate-shimmer" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-3/4 rounded bg-white/5 animate-shimmer" />
                      <div className="h-4 w-1/2 rounded bg-white/5 animate-shimmer" />
                      <div className="h-3 w-full rounded bg-white/5 animate-shimmer" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : achievements.length === 0 ? (
            <Card className="glass-card border-0 col-span-full">
              <CardContent className="p-12 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-muted-foreground">No achievements defined yet</p>
                <p className="text-xs text-muted-foreground mt-1">Create your first achievement to gamify learning</p>
                <Button onClick={openCreate} className="gradient-primary text-white mt-4">
                  <Plus className="h-4 w-4 mr-2" /> Create Achievement
                </Button>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence mode="popLayout">
              {achievements.map((ach, index) => {
                const catConfig = CATEGORY_CONFIG[ach.category] || CATEGORY_CONFIG.learning;
                return (
                  <motion.div
                    key={ach.id}
                    variants={CARD_VARIANTS}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: index * 0.04 }}
                    layout
                  >
                    <Card className="glass-card border-0 group hover:border-white/[0.12] transition-all">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          {/* Icon in gradient circle */}
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${catConfig.gradient} flex items-center justify-center text-xl shrink-0 shadow-lg`}>
                            {ach.icon || '🏆'}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-semibold text-sm truncate">{ach.name}</p>
                                {ach.name_bn && (
                                  <p className="text-xs text-muted-foreground truncate">{ach.name_bn}</p>
                                )}
                              </div>
                              {/* Actions */}
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(ach)}>
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(ach.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>

                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ach.description}</p>

                            <div className="flex flex-wrap items-center gap-2 mt-2.5">
                              {/* Category Badge */}
                              <Badge className={`${catConfig.color} border text-[10px] flex items-center gap-1`}>
                                {catConfig.icon}
                                {catConfig.label}
                              </Badge>

                              {/* XP */}
                              <span className="text-[10px] font-semibold text-dakkho-warning flex items-center gap-0.5">
                                <Zap className="h-3 w-3" />{ach.xp} XP
                              </span>

                              {/* Active Status */}
                              {ach.is_active !== 1 && (
                                <span className="status-badge status-badge-inactive text-[10px]">Inactive</span>
                              )}

                              {/* Unlock Count */}
                              <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-0.5">
                                <Award className="h-3 w-3" />{ach.unlockCount || 0} unlocked
                              </span>
                            </div>

                            {/* Condition */}
                            {(ach.condition_type || ach.condition_value) && (
                              <div className="mt-2 pt-2 border-t border-white/[0.04]">
                                <p className="text-[10px] text-muted-foreground">
                                  {ach.condition_type && <span className="font-medium">{ach.condition_type}</span>}
                                  {ach.condition_type && ach.condition_value && ': '}
                                  {ach.condition_value && <span>{ach.condition_value}</span>}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#141428] border-white/[0.08] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Achievement' : 'Create Achievement'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Slug */}
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() })}
                className="bg-white/[0.04] border-white/[0.08]"
                placeholder="first-course-complete"
              />
            </div>

            {/* Names */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-white/[0.04] border-white/[0.08]"
                  placeholder="First Course Complete"
                />
              </div>
              <div className="space-y-2">
                <Label>Name (বাংলা)</Label>
                <Input
                  value={form.name_bn}
                  onChange={(e) => setForm({ ...form, name_bn: e.target.value })}
                  className="bg-white/[0.04] border-white/[0.08]"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-white/[0.04] border-white/[0.08] min-h-[60px]"
                placeholder="Complete your first course to earn this achievement"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (বাংলা)</Label>
              <Textarea
                value={form.description_bn}
                onChange={(e) => setForm({ ...form, description_bn: e.target.value })}
                className="bg-white/[0.04] border-white/[0.08] min-h-[60px]"
              />
            </div>

            {/* Category & Icon */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category *</Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as 'learning' | 'streaks' | 'social' | 'special' })}
                  className="w-full h-9 rounded-md bg-white/[0.04] border border-white/[0.08] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-dakkho-blue"
                >
                  <option value="learning">Learning</option>
                  <option value="streaks">Streaks</option>
                  <option value="social">Social</option>
                  <option value="special">Special</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Icon (emoji)</Label>
                <Input
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="bg-white/[0.04] border-white/[0.08]"
                  placeholder="🏆"
                />
              </div>
            </div>

            {/* XP */}
            <div className="space-y-2">
              <Label>XP Value</Label>
              <Input
                type="number"
                min="0"
                value={form.xp}
                onChange={(e) => setForm({ ...form, xp: e.target.value })}
                className="bg-white/[0.04] border-white/[0.08]"
              />
            </div>

            {/* Condition */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Condition Type</Label>
                <Input
                  value={form.condition_type}
                  onChange={(e) => setForm({ ...form, condition_type: e.target.value })}
                  className="bg-white/[0.04] border-white/[0.08]"
                  placeholder="courses_completed"
                />
              </div>
              <div className="space-y-2">
                <Label>Condition Value</Label>
                <Input
                  value={form.condition_value}
                  onChange={(e) => setForm({ ...form, condition_value: e.target.value })}
                  className="bg-white/[0.04] border-white/[0.08]"
                  placeholder="1"
                />
              </div>
            </div>

            {/* Active Switch */}
            <div className="flex items-center justify-between">
              <Label htmlFor="ach-active">Active</Label>
              <Switch
                id="ach-active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
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
              {editingId ? 'Update Achievement' : 'Create Achievement'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
