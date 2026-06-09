'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw, Cog } from 'lucide-react';
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

// ============================================================
// Animation Variants
// ============================================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

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
        {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-xl bg-white/5 animate-shimmer" />)}
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Cog className="h-5 w-5 text-white" />
            </div>
            Server Configuration
          </h1>
          <p className="page-description">Manage server-driven config, features, and protection settings</p>
        </div>
      </motion.div>

      {/* Action Bar */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card border-0 rounded-xl">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-medium">Server-Driven Configuration</h3>
              <p className="text-xs text-muted-foreground">Changes are broadcast to all clients in real-time</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={() => setConfig(DEFAULT_CONFIG)} className="border-white/[0.08] flex-1 sm:flex-initial">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="gradient-primary text-white flex-1 sm:flex-initial">
                <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save & Broadcast'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

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
          <Card className="glass-card border-0 rounded-xl">
            <CardHeader><CardTitle className="text-lg">Feature Toggles</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {featureItems.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.10] transition-all"
                  >
                    <Label className="text-sm cursor-pointer">{item.label}</Label>
                    <Switch
                      checked={config.featureToggles[item.key]}
                      onCheckedChange={(v) => updateFeature(item.key, v)}
                      className={config.featureToggles[item.key] ? '' : 'data-[state=unchecked]:bg-white/10'}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sidebar">
          <Card className="glass-card border-0 rounded-xl">
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
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.10] transition-all"
                  >
                    <Label className="text-sm cursor-pointer">{item.label}</Label>
                    <Switch
                      checked={config.sidebarVisibility[item.key]}
                      onCheckedChange={(v) => updateSidebar(item.key, v)}
                      className={config.sidebarVisibility[item.key] ? '' : 'data-[state=unchecked]:bg-white/10'}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topbar">
          <Card className="glass-card border-0 rounded-xl">
            <CardHeader><CardTitle className="text-lg">Top Bar Elements</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  { key: 'search' as const, label: 'Search' },
                  { key: 'notifications' as const, label: 'Notifications' },
                  { key: 'avatar' as const, label: 'Avatar' },
                  { key: 'hamburger' as const, label: 'Hamburger Menu' },
                ]).map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.10] transition-all"
                  >
                    <Label className="text-sm cursor-pointer">{item.label}</Label>
                    <Switch
                      checked={config.topBarElements[item.key]}
                      onCheckedChange={(v) => updateTopBar(item.key, v)}
                      className={config.topBarElements[item.key] ? '' : 'data-[state=unchecked]:bg-white/10'}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation">
          <Card className="glass-card border-0 rounded-xl">
            <CardHeader><CardTitle className="text-lg">Bottom Navigation Tabs</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {config.bottomNavTabs.tabs.map((tab, i) => (
                  <div
                    key={tab.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.10] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-6 h-6 flex items-center justify-center rounded-md bg-white/5">{i + 1}</span>
                      <span className="text-sm font-medium">{tab.label}</span>
                    </div>
                    <Switch
                      checked={tab.enabled}
                      onCheckedChange={(v) => {
                        const newTabs = [...config.bottomNavTabs.tabs];
                        newTabs[i] = { ...newTabs[i], enabled: v };
                        setConfig({ ...config, bottomNavTabs: { tabs: newTabs } });
                      }}
                      className={tab.enabled ? '' : 'data-[state=unchecked]:bg-white/10'}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="style">
          <Card className="glass-card border-0 rounded-xl">
            <CardHeader><CardTitle className="text-lg">Card Style</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Card Style</Label>
                  <Select value={config.cardStyle} onValueChange={(v) => setConfig({ ...config, cardStyle: v as ServerConfig['cardStyle'] })}>
                    <SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#141428] border-white/[0.08]">
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
                        config.cardStyle === style
                          ? 'border-dakkho-blue bg-dakkho-blue/10 text-dakkho-blue shadow-lg shadow-dakkho-blue/10'
                          : 'border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:border-white/20'
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
          <Card className="glass-card border-0 rounded-xl">
            <CardHeader><CardTitle className="text-lg">Content Protection</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div>
                    <Label className="text-sm font-medium">Enable Content Protection</Label>
                    <p className="text-xs text-muted-foreground">Master switch for all protection features</p>
                  </div>
                  <Switch
                    checked={config.contentProtection.enabled}
                    onCheckedChange={(v) => updateProtection('enabled', v)}
                    className={config.contentProtection.enabled ? '' : 'data-[state=unchecked]:bg-white/10'}
                  />
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
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.10] transition-all"
                      >
                        <Label className="text-sm cursor-pointer">{item.label}</Label>
                        <Switch
                          checked={config.contentProtection[item.key]}
                          onCheckedChange={(v) => updateProtection(item.key, v)}
                          className={config.contentProtection[item.key] ? '' : 'data-[state=unchecked]:bg-white/10'}
                        />
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
