'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb, ChevronLeft, Clock, Brain, BookOpen,
  AlertTriangle, CheckCircle, Coffee, Moon, Sparkles, Timer, PenTool, Loader2,
} from 'lucide-react';
import { useNavigationStore } from '@/lib/store';
import { examTipsApi } from '@/lib/api-client';
import { GlassCard } from '../shared/GlassCard';

interface TipsData {
  strategies: Array<{ title: string; description: string; tip: string }>;
  timeManagement: Array<{ title: string; desc: string; priority: string }>;
  commonMistakes: Array<{ mistake: string; consequence: string; fix: string }>;
  wellness: Array<{ title: string; desc: string; time: string }>;
}

const DEFAULT_TIPS: TipsData = {
  strategies: [],
  timeManagement: [],
  commonMistakes: [],
  wellness: [],
};

const STRATEGY_ICONS = [Brain, Clock, Timer, Lightbulb, Sparkles, PenTool];
const STRATEGY_COLORS = [
  'text-violet-500 bg-violet-50 dark:bg-violet-900/20',
  'text-sky-500 bg-sky-50 dark:bg-sky-900/20',
  'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
  'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
  'text-rose-500 bg-rose-50 dark:bg-rose-900/20',
  'text-teal-500 bg-teal-50 dark:bg-teal-900/20',
];

export function ExamTipsPage() {
  const { goBack } = useNavigationStore();
  const [activeTab, setActiveTab] = useState('strategies');
  const [tips, setTips] = useState<TipsData>(DEFAULT_TIPS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTips() {
      try {
        const res = await examTipsApi.get();
        setTips(res.tips || DEFAULT_TIPS);
      } catch (err) {
        console.error('Failed to fetch exam tips:', err);
        setTips(DEFAULT_TIPS);
      } finally {
        setLoading(false);
      }
    }
    fetchTips();
  }, []);

  const tabs = [
    { id: 'strategies', label: 'Strategies', icon: Brain },
    { id: 'time', label: 'Time Mgmt', icon: Clock },
    { id: 'mistakes', label: 'Mistakes', icon: AlertTriangle },
    { id: 'wellness', label: 'Wellness', icon: Coffee },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'strategies':
        return tips.strategies.length > 0 ? (
          <div className="space-y-3">
            {tips.strategies.map((strategy, i) => {
              const Icon = STRATEGY_ICONS[i % STRATEGY_ICONS.length];
              const color = STRATEGY_COLORS[i % STRATEGY_COLORS.length];
              return (
                <motion.div key={strategy.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <GlassCard className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-foreground mb-1">{strategy.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-2">{strategy.description}</p>
                        {strategy.tip && (
                          <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-start gap-2">
                            <Lightbulb className="w-3 h-3 text-sky-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-sky-700 dark:text-sky-300">{strategy.tip}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <GlassCard className="p-6 text-center">
            <Brain className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No study strategies available yet.</p>
          </GlassCard>
        );

      case 'time':
        return tips.timeManagement.length > 0 ? (
          <div className="space-y-3">
            {tips.timeManagement.map((tip, i) => (
              <motion.div key={tip.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GlassCard className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center text-sm font-bold text-sky-500 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-foreground">{tip.title}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          tip.priority === 'High' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' :
                          tip.priority === 'Medium' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' :
                          'bg-sky-50 dark:bg-sky-900/20 text-sky-500'
                        }`}>{tip.priority}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{tip.desc}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard className="p-6 text-center">
            <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No time management tips available yet.</p>
          </GlassCard>
        );

      case 'mistakes':
        return tips.commonMistakes.length > 0 ? (
          <div className="space-y-3">
            {tips.commonMistakes.map((item, i) => (
              <motion.div key={item.mistake} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GlassCard className="p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    <h4 className="text-sm font-bold text-foreground">{item.mistake}</h4>
                  </div>
                  <div className="ml-11 space-y-2">
                    <div className="p-2 rounded-lg bg-red-50/50 dark:bg-red-900/10">
                      <p className="text-xs text-red-600 dark:text-red-400"><span className="font-bold">Impact:</span> {item.consequence}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400"><span className="font-bold">Fix:</span> {item.fix}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard className="p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No common mistakes tips available yet.</p>
          </GlassCard>
        );

      case 'wellness':
        return tips.wellness.length > 0 ? (
          <div className="space-y-3">
            {tips.wellness.map((tip, i) => (
              <motion.div key={tip.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GlassCard className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                      <Coffee className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-foreground">{tip.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-900/20 text-sky-500 font-bold">{tip.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{tip.desc}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard className="p-6 text-center">
            <Coffee className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No wellness tips available yet.</p>
          </GlassCard>
        );
    }
  };

  return (
    <div className="pb-20 lg:pb-0">
      {/* Header */}
      <motion.div className="flex items-center gap-3 mb-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <motion.button className="w-9 h-9 rounded-xl bg-muted/30 flex items-center justify-center text-foreground" onClick={goBack} whileTap={{ scale: 0.9 }}>
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Exam Tips</h1>
          <p className="text-xs text-muted-foreground">Study smarter, not harder</p>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Tab Selector */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-4">
            <div className="flex gap-1 bg-muted/30 rounded-lg p-0.5 overflow-x-auto">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    activeTab === tab.id ? 'bg-white dark:bg-slate-700 shadow-sm text-foreground' : 'text-muted-foreground'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                  whileTap={{ scale: 0.95 }}
                >
                  <tab.icon className="w-3 h-3" /> {tab.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Content */}
          {renderContent()}
        </>
      )}
    </div>
  );
}
