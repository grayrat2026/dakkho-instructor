'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiPost, ApiError } from '@/lib/api-client';

export default function EmailPanel() {
  const [form, setForm] = useState({ to: '', subject: '', html: '' });
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSendTest = async () => {
    if (!form.to) {
      toast({ title: 'Error', description: 'Email address required', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      await apiPost('/email/test', { to: form.to, template: 'test' });
      toast({ title: 'Success', description: 'Test email sent!' });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Network error';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const handleSendCustom = async () => {
    if (!form.to || !form.subject || !form.html) {
      toast({ title: 'Error', description: 'All fields are required', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      await apiPost('/email/test', { to: form.to, subject: form.subject, html: form.html });
      toast({ title: 'Success', description: 'Email sent!' });
      setForm({ to: '', subject: '', html: '' });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Network error';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Tabs defaultValue="test" className="space-y-4">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="test" className="data-[state=active]:bg-dakkho-blue/20 data-[state=active]:text-dakkho-blue">
            <Send className="h-4 w-4 mr-2" /> Test Email
          </TabsTrigger>
          <TabsTrigger value="custom" className="data-[state=active]:bg-dakkho-blue/20 data-[state=active]:text-dakkho-blue">
            <Mail className="h-4 w-4 mr-2" /> Custom Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="test">
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-lg">Send Test Email</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <p className="text-sm text-blue-400">This will send a simple test email to verify your Resend configuration is working correctly.</p>
              </div>
              <div className="space-y-2">
                <Label>Recipient Email</Label>
                <Input
                  type="email"
                  value={form.to}
                  onChange={(e) => setForm({ ...form, to: e.target.value })}
                  className="bg-white/5 border-white/10"
                  placeholder="admin@dakkho.pro.bd"
                />
              </div>
              <Button onClick={handleSendTest} disabled={sending} className="w-full gradient-primary text-white">
                {sending ? 'Sending...' : <><Send className="h-4 w-4 mr-2" /> Send Test Email</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-lg">Send Custom Email</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Recipient Email</Label>
                <Input
                  type="email"
                  value={form.to}
                  onChange={(e) => setForm({ ...form, to: e.target.value })}
                  className="bg-white/5 border-white/10"
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="bg-white/5 border-white/10"
                  placeholder="Email subject"
                />
              </div>
              <div className="space-y-2">
                <Label>HTML Body</Label>
                <Textarea
                  value={form.html}
                  onChange={(e) => setForm({ ...form, html: e.target.value })}
                  className="bg-white/5 border-white/10 font-mono text-sm"
                  rows={10}
                  placeholder="<h1>Hello!</h1><p>Your email content here...</p>"
                />
              </div>
              <Button onClick={handleSendCustom} disabled={sending} className="w-full gradient-primary text-white">
                {sending ? 'Sending...' : <><Mail className="h-4 w-4 mr-2" /> Send Email</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Email Config Info */}
      <Card className="glass-card border-0">
        <CardHeader><CardTitle className="text-lg">Email Configuration</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 rounded bg-white/[0.03]">
              <span className="text-muted-foreground">Provider</span>
              <span>Resend</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-white/[0.03]">
              <span className="text-muted-foreground">From Email</span>
              <span>{process.env.NEXT_PUBLIC_APP_URL ? 'noreply@dakkho.pro.bd' : 'Not configured'}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-white/[0.03]">
              <span className="text-muted-foreground">Support Email</span>
              <span>support@dakkho.pro.bd</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
