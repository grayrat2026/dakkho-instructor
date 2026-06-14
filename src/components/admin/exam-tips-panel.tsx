'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPut } from '@/lib/api-client';
import { Sparkles, Plus, Trash2, Save, Loader2, Brain, Clock, AlertTriangle, Coffee, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ───

interface Strategy {
  title: string;
  description: string;
  tip: string;
}

interface TimeManagementTip {
  title: string;
  desc: string;
  priority: string;
}

interface CommonMistake {
  mistake: string;
  consequence: string;
  fix: string;
}

interface WellnessTip {
  title: string;
  desc: string;
  time: string;
}

interface TipsData {
  strategies: Strategy[];
  timeManagement: TimeManagementTip[];
  commonMistakes: CommonMistake[];
  wellness: WellnessTip[];
}

const EMPTY_TIPS: TipsData = {
  strategies: [],
  timeManagement: [],
  commonMistakes: [],
  wellness: [],
};

// ─── Component ───

export default function ExamTipsPanel() {
  const [tips, setTips] = useState<TipsData>(EMPTY_TIPS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    strategies: true,
    timeManagement: false,
    commonMistakes: false,
    wellness: false,
  });

  // Fetch existing tips
  useEffect(() => {
    async function fetchTips() {
      try {
        const res = await apiGet<{ tips: TipsData }>('/exam-tips');
        setTips(res.tips || EMPTY_TIPS);
      } catch (err) {
        console.error('Failed to fetch exam tips:', err);
        setTips(EMPTY_TIPS);
      } finally {
        setLoading(false);
      }
    }
    fetchTips();
  }, []);

  // Save tips
  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await apiPut('/exam-tips', tips);
      setMessage({ type: 'success', text: 'Exam tips saved successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to save exam tips' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // ─── Strategy helpers ───
  const addStrategy = () => {
    setTips((prev) => ({
      ...prev,
      strategies: [...prev.strategies, { title: '', description: '', tip: '' }],
    }));
  };
  const updateStrategy = (index: number, field: keyof Strategy, value: string) => {
    setTips((prev) => {
      const updated = [...prev.strategies];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, strategies: updated };
    });
  };
  const removeStrategy = (index: number) => {
    setTips((prev) => ({
      ...prev,
      strategies: prev.strategies.filter((_, i) => i !== index),
    }));
  };

  // ─── Time Management helpers ───
  const addTimeManagement = () => {
    setTips((prev) => ({
      ...prev,
      timeManagement: [...prev.timeManagement, { title: '', desc: '', priority: 'Medium' }],
    }));
  };
  const updateTimeManagement = (index: number, field: keyof TimeManagementTip, value: string) => {
    setTips((prev) => {
      const updated = [...prev.timeManagement];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, timeManagement: updated };
    });
  };
  const removeTimeManagement = (index: number) => {
    setTips((prev) => ({
      ...prev,
      timeManagement: prev.timeManagement.filter((_, i) => i !== index),
    }));
  };

  // ─── Common Mistakes helpers ───
  const addCommonMistake = () => {
    setTips((prev) => ({
      ...prev,
      commonMistakes: [...prev.commonMistakes, { mistake: '', consequence: '', fix: '' }],
    }));
  };
  const updateCommonMistake = (index: number, field: keyof CommonMistake, value: string) => {
    setTips((prev) => {
      const updated = [...prev.commonMistakes];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, commonMistakes: updated };
    });
  };
  const removeCommonMistake = (index: number) => {
    setTips((prev) => ({
      ...prev,
      commonMistakes: prev.commonMistakes.filter((_, i) => i !== index),
    }));
  };

  // ─── Wellness helpers ───
  const addWellness = () => {
    setTips((prev) => ({
      ...prev,
      wellness: [...prev.wellness, { title: '', desc: '', time: '' }],
    }));
  };
  const updateWellness = (index: number, field: keyof WellnessTip, value: string) => {
    setTips((prev) => {
      const updated = [...prev.wellness];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, wellness: updated };
    });
  };
  const removeWellness = (index: number) => {
    setTips((prev) => ({
      ...prev,
      wellness: prev.wellness.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Exam Tips</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage exam tips shown to students</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-sm shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 transition-shadow disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-xl text-sm font-medium ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Strategies Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => toggleSection('strategies')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-violet-500" />
            <span className="font-semibold text-gray-900 dark:text-white">Study Strategies</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">{tips.strategies.length}</span>
          </div>
          {expandedSections.strategies ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        <AnimatePresence>
          {expandedSections.strategies && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-4">
                {tips.strategies.map((strategy, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 space-y-3 relative group">
                    <button
                      onClick={() => removeStrategy(i)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <input
                      value={strategy.title}
                      onChange={(e) => updateStrategy(i, 'title', e.target.value)}
                      placeholder="Strategy Title"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-violet-400"
                    />
                    <textarea
                      value={strategy.description}
                      onChange={(e) => updateStrategy(i, 'description', e.target.value)}
                      placeholder="Description"
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:border-violet-400 resize-none"
                    />
                    <input
                      value={strategy.tip}
                      onChange={(e) => updateStrategy(i, 'tip', e.target.value)}
                      placeholder="Pro Tip (optional)"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:border-violet-400"
                    />
                  </div>
                ))}
                <button
                  onClick={addStrategy}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm font-medium hover:border-violet-400 hover:text-violet-500 transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" /> Add Strategy
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Time Management Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => toggleSection('timeManagement')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-sky-500" />
            <span className="font-semibold text-gray-900 dark:text-white">Time Management</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">{tips.timeManagement.length}</span>
          </div>
          {expandedSections.timeManagement ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        <AnimatePresence>
          {expandedSections.timeManagement && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-4">
                {tips.timeManagement.map((tip, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 space-y-3 relative group">
                    <button
                      onClick={() => removeTimeManagement(i)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <input
                      value={tip.title}
                      onChange={(e) => updateTimeManagement(i, 'title', e.target.value)}
                      placeholder="Tip Title"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-sky-400"
                    />
                    <textarea
                      value={tip.desc}
                      onChange={(e) => updateTimeManagement(i, 'desc', e.target.value)}
                      placeholder="Description"
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:border-sky-400 resize-none"
                    />
                    <select
                      value={tip.priority}
                      onChange={(e) => updateTimeManagement(i, 'priority', e.target.value)}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-sky-400"
                    >
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>
                ))}
                <button
                  onClick={addTimeManagement}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm font-medium hover:border-sky-400 hover:text-sky-500 transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" /> Add Time Management Tip
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Common Mistakes Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => toggleSection('commonMistakes')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-gray-900 dark:text-white">Common Mistakes</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">{tips.commonMistakes.length}</span>
          </div>
          {expandedSections.commonMistakes ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        <AnimatePresence>
          {expandedSections.commonMistakes && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-4">
                {tips.commonMistakes.map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 space-y-3 relative group">
                    <button
                      onClick={() => removeCommonMistake(i)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <input
                      value={item.mistake}
                      onChange={(e) => updateCommonMistake(i, 'mistake', e.target.value)}
                      placeholder="Mistake"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-amber-400"
                    />
                    <input
                      value={item.consequence}
                      onChange={(e) => updateCommonMistake(i, 'consequence', e.target.value)}
                      placeholder="Consequence / Impact"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:border-amber-400"
                    />
                    <input
                      value={item.fix}
                      onChange={(e) => updateCommonMistake(i, 'fix', e.target.value)}
                      placeholder="How to Fix"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:border-amber-400"
                    />
                  </div>
                ))}
                <button
                  onClick={addCommonMistake}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm font-medium hover:border-amber-400 hover:text-amber-500 transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" /> Add Common Mistake
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Wellness Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => toggleSection('wellness')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Coffee className="w-5 h-5 text-emerald-500" />
            <span className="font-semibold text-gray-900 dark:text-white">Wellness Tips</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">{tips.wellness.length}</span>
          </div>
          {expandedSections.wellness ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        <AnimatePresence>
          {expandedSections.wellness && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-4">
                {tips.wellness.map((tip, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 space-y-3 relative group">
                    <button
                      onClick={() => removeWellness(i)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <input
                      value={tip.title}
                      onChange={(e) => updateWellness(i, 'title', e.target.value)}
                      placeholder="Tip Title"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-emerald-400"
                    />
                    <textarea
                      value={tip.desc}
                      onChange={(e) => updateWellness(i, 'desc', e.target.value)}
                      placeholder="Description"
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:border-emerald-400 resize-none"
                    />
                    <input
                      value={tip.time}
                      onChange={(e) => updateWellness(i, 'time', e.target.value)}
                      placeholder="When (e.g. Night, All Day, Before Study)"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:border-emerald-400"
                    />
                  </div>
                ))}
                <button
                  onClick={addWellness}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm font-medium hover:border-emerald-400 hover:text-emerald-500 transition-colors w-full justify-center"
                >
                  <Plus className="w-4 h-4" /> Add Wellness Tip
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
