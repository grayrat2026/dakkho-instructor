'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bell, Users, Building2, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost, ApiError } from '@/lib/api-client';

export default function NotificationsPanel() {
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'info',
    targetAll: false,
    targetUserId: '',
    targetInstitute: '',
    actionUrl: '',
  });
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!form.title || !form.message) {
      toast({ title: 'Error', description: 'Title and message are required', variant: 'destructive' });
      return;
    }
    if (!form.targetAll && !form.targetUserId && !form.targetInstitute) {
      toast({ title: 'Error', description: 'Select a target audience', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const data = await apiPost('/notifications', form) as Record<string, unknown>;
      toast({ title: 'Success', description: `Sent ${data.count} notification(s)` });
      setForm({ title: '', message: '', type: 'info', targetAll: false, targetUserId: '', targetInstitute: '', actionUrl: '' });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Network error';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await apiGet('/notifications?limit=20') as Record<string, unknown>;
      setHistory((data.documents as Record<string, unknown>[]) || []);
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
    finally { setLoadingHistory(false); }
  };

  const typeColors: Record<string, string> = {
    info: 'bg-blue-500/10 text-blue-400',
    success: 'bg-green-500/10 text-green-400',
    warning: 'bg-amber-500/10 text-amber-400',
    error: 'bg-red-500/10 text-red-400',
    announcement: 'bg-purple-500/10 text-purple-400',
    'course-update': 'bg-cyan-500/10 text-cyan-400',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Tabs defaultValue="send" className="space-y-4">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="send" className="data-[state=active]:bg-dakkho-blue/20 data-[state=active]:text-dakkho-blue">
            <Send className="h-4 w-4 mr-2" /> Send
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-dakkho-blue/20 data-[state=active]:text-dakkho-blue" onClick={fetchHistory}>
            <Bell className="h-4 w-4 mr-2" /> History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send">
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-lg">Send Notification</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-white/5 border-white/10" placeholder="Notification title" />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="course-update">Course Update</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="bg-white/5 border-white/10" rows={4} placeholder="Notification message..." />
              </div>
              <div className="space-y-2">
                <Label>Action URL (optional)</Label>
                <Input value={form.actionUrl} onChange={(e) => setForm({ ...form, actionUrl: e.target.value })} className="bg-white/5 border-white/10" placeholder="https://..." />
              </div>

              <div className="border-t border-white/[0.06] pt-4">
                <p className="text-sm font-medium mb-3">Target Audience</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]">
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-dakkho-teal" /><span className="text-sm">All Users</span></div>
                    <Switch checked={form.targetAll} onCheckedChange={(v) => setForm({ ...form, targetAll: v, targetUserId: '', targetInstitute: '' })} />
                  </div>
                  {!form.targetAll && (
                    <>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><User className="h-3.5 w-3.5" /> Specific User ID</Label>
                        <Input value={form.targetUserId} onChange={(e) => setForm({ ...form, targetUserId: e.target.value, targetInstitute: '' })} className="bg-white/5 border-white/10" placeholder="User ID" />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" /> Institute</Label>
                        <Input value={form.targetInstitute} onChange={(e) => setForm({ ...form, targetInstitute: e.target.value, targetUserId: '' })} className="bg-white/5 border-white/10" placeholder="Institute ID" />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Button onClick={handleSend} disabled={sending} className="w-full gradient-primary text-white">
                {sending ? 'Sending...' : <><Send className="h-4 w-4 mr-2" /> Send Notification</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-lg">Notification History</CardTitle></CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-lg bg-white/5 animate-pulse" />)}</div>
              ) : history.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No notifications yet. Click &quot;History&quot; tab to load.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {history.map((notif) => (
                    <div key={String(notif.$id)} className="p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{String(notif.title || 'No Title')}</span>
                        <Badge variant="secondary" className={typeColors[String(notif.type)] || typeColors.info}>
                          {String(notif.type || 'info')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{String(notif.message || '')}</p>
                      <p className="text-xs text-muted-foreground mt-1">User: {String(notif.userId || 'N/A').slice(0, 8)}... | {notif.$createdAt ? new Date(String(notif.$createdAt)).toLocaleString() : 'N/A'}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
