'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPut, ApiError } from '@/lib/api-client';
import { ServerConfig, DEFAULT_CONFIG } from '@/lib/types';

export default function ConfigPanel() {
  const [config, setConfig] = useState<ServerConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/config');
      setConfig(data as ServerConfig);
    } catch { toast({ title: 'Error', description: 'Failed to load config', variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPut('/config', config);
      toast({ title: 'Success', description: 'Configuration saved and broadcasted' });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Network error';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const updateFeature = (key: keyof ServerConfig['featureToggles'], value: boolean) => {
    setConfig({ ...config, featureToggles: { ...config.featureToggles, [key]: value } });
  };

  const updateSidebar = (key: keyof ServerConfig['sidebarVisibility'], value: boolean) => {
    setConfig({ ...config, sidebarVisibility: { ...config.sidebarVisibility, [key]: value } });
  };

  const updateTopBar = (key: keyof ServerConfig['topBarElements'], value: boolean) => {
    setConfig({ ...config, topBarElements: { ...config.topBarElements, [key]: value } });
  };

  const updateProtection = (key: keyof ServerConfig['contentProtection'], value: boolean) => {
    setConfig({ ...config, contentProtection: { ...config.contentProtection, [key]: value } });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-xl bg-white/5 animate-pulse" />)}
      </div>
    );
  }

  const featureItems: { key: keyof ServerConfig['featureToggles']; label: string }[] = [
    { key: 'downloads', label: 'Downloads' },
    { key: 'bookmarks', label: 'Bookmarks' },
    { key: 'certificates', label: 'Certificates' },
    { key: 'liveSessions', label: 'Live Sessions' },
    { key: 'achievements', label: 'Achievements' },
    { key: 'assignments', label: 'Assignments' },
    { key: 'discussions', label: 'Discussions' },
    { key: 'community', label: 'Community' },
    { key: 'leaderboard', label: 'Leaderboard' },
    { key: 'studyGroups', label: 'Study Groups' },
    { key: 'peerConnections', label: 'Peer Connections' },
    { key: 'feedback', label: 'Feedback' },
    { key: 'pricing', label: 'Pricing' },
    { key: 'referral', label: 'Referral' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Action Bar */}
      <Card className="glass-card border-0">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Server-Driven Configuration</h3>
            <p className="text-xs text-muted-foreground">Changes are broadcast to all clients via MQTT</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfig(DEFAULT_CONFIG)} className="border-white/10">
              <RotateCcw className="h-4 w-4 mr-2" /> Reset
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gradient-primary text-white">
              <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save & Broadcast'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="features" className="space-y-4">
        <TabsList className="bg-white/5 border border-white/10 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="features" className="data-[state=active]:bg-dakkho-blue/20 data-[state=active]:text-dakkho-blue">Features</TabsTrigger>
          <TabsTrigger value="sidebar" className="data-[state=active]:bg-dakkho-blue/20 data-[state=active]:text-dakkho-blue">Sidebar</TabsTrigger>
          <TabsTrigger value="topbar" className="data-[state=active]:bg-dakkho-blue/20 data-[state=active]:text-dakkho-blue">Top Bar</TabsTrigger>
          <TabsTrigger value="navigation" className="data-[state=active]:bg-dakkho-blue/20 data-[state=active]:text-dakkho-blue">Navigation</TabsTrigger>
          <TabsTrigger value="style" className="data-[state=active]:bg-dakkho-blue/20 data-[state=active]:text-dakkho-blue">Style</TabsTrigger>
          <TabsTrigger value="protection" className="data-[state=active]:bg-dakkho-blue/20 data-[state=active]:text-dakkho-blue">Protection</TabsTrigger>
        </TabsList>

        <TabsContent value="features">
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-lg">Feature Toggles</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {featureItems.map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                    <Label className="text-sm cursor-pointer">{item.label}</Label>
                    <Switch
                      checked={config.featureToggles[item.key]}
                      onCheckedChange={(v) => updateFeature(item.key, v)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sidebar">
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-lg">Sidebar Visibility</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  { key: 'menu' as const, label: 'Menu' },
                  { key: 'departments' as const, label: 'Departments' },
                  { key: 'semesters' as const, label: 'Semesters' },
                  { key: 'exams' as const, label: 'Exams' },
                  { key: 'community' as const, label: 'Community' },
                  { key: 'general' as const, label: 'General' },
                ]).map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]">
                    <Label className="text-sm cursor-pointer">{item.label}</Label>
                    <Switch checked={config.sidebarVisibility[item.key]} onCheckedChange={(v) => updateSidebar(item.key, v)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topbar">
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-lg">Top Bar Elements</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  { key: 'search' as const, label: 'Search' },
                  { key: 'notifications' as const, label: 'Notifications' },
                  { key: 'avatar' as const, label: 'Avatar' },
                  { key: 'hamburger' as const, label: 'Hamburger Menu' },
                ]).map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]">
                    <Label className="text-sm cursor-pointer">{item.label}</Label>
                    <Switch checked={config.topBarElements[item.key]} onCheckedChange={(v) => updateTopBar(item.key, v)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation">
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-lg">Bottom Navigation Tabs</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {config.bottomNavTabs.tabs.map((tab, i) => (
                  <div key={tab.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-6">#{i + 1}</span>
                      <span className="text-sm font-medium">{tab.label}</span>
                    </div>
                    <Switch
                      checked={tab.enabled}
                      onCheckedChange={(v) => {
                        const newTabs = [...config.bottomNavTabs.tabs];
                        newTabs[i] = { ...newTabs[i], enabled: v };
                        setConfig({ ...config, bottomNavTabs: { tabs: newTabs } });
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="style">
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-lg">Card Style</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Card Style</Label>
                  <Select value={config.cardStyle} onValueChange={(v) => setConfig({ ...config, cardStyle: v as ServerConfig['cardStyle'] })}>
                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="glass">Glass (Glassmorphism)</SelectItem>
                      <SelectItem value="flat">Flat</SelectItem>
                      <SelectItem value="rounded">Rounded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {(['glass', 'flat', 'rounded'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setConfig({ ...config, cardStyle: style })}
                      className={`p-4 rounded-xl border-2 transition-all text-sm font-medium capitalize ${
                        config.cardStyle === style ? 'border-dakkho-blue bg-dakkho-blue/10 text-dakkho-blue' : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protection">
          <Card className="glass-card border-0">
            <CardHeader><CardTitle className="text-lg">Content Protection</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]">
                  <div><Label className="text-sm font-medium">Enable Content Protection</Label><p className="text-xs text-muted-foreground">Master switch for all protection features</p></div>
                  <Switch checked={config.contentProtection.enabled} onCheckedChange={(v) => updateProtection('enabled', v)} />
                </div>
                {config.contentProtection.enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {([
                      { key: 'noCopy' as const, label: 'No Copy' },
                      { key: 'noRightClick' as const, label: 'No Right Click' },
                      { key: 'noScreenshot' as const, label: 'No Screenshot' },
                      { key: 'noPrint' as const, label: 'No Print' },
                      { key: 'customContextMenu' as const, label: 'Custom Context Menu' },
                      { key: 'watermark' as const, label: 'Watermark' },
                      { key: 'dragProtection' as const, label: 'Drag Protection' },
                    ]).map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03]">
                        <Label className="text-sm cursor-pointer">{item.label}</Label>
                        <Switch checked={config.contentProtection[item.key]} onCheckedChange={(v) => updateProtection(item.key, v)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
