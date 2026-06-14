'use client';

import { motion } from 'framer-motion';
import { Download, CloudOff } from 'lucide-react';
import { GlassCard } from '../shared/GlassCard';

export function DownloadsPage() {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Download className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold gradient-text">Downloads</h1>
          <p className="text-sm text-muted-foreground">Your offline content</p>
        </div>
      </motion.div>

      {/* Empty State */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
            <CloudOff className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">No Downloads Yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Downloaded videos and course materials will appear here for offline access. Start watching courses and save them for later.
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
