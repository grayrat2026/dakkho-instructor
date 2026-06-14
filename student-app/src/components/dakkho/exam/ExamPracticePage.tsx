'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, Brain, Sparkles } from 'lucide-react';
import { useNavigationStore } from '@/lib/store';
import { GlassCard } from '../shared/GlassCard';

export function ExamPracticePage() {
  const { goBack } = useNavigationStore();

  return (
    <div className="pb-20 lg:pb-0">
      <motion.div className="flex items-center gap-3 mb-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <motion.button className="w-9 h-9 rounded-xl bg-muted/30 flex items-center justify-center text-foreground" onClick={goBack} whileTap={{ scale: 0.9 }}>
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Practice Mode</h1>
          <p className="text-xs text-muted-foreground">Test your knowledge</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
        <GlassCard className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-sky-500/50" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Practice mode with subject-wise quizzes, difficulty levels, timed sessions, and detailed explanations are being built. Stay tuned!
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
