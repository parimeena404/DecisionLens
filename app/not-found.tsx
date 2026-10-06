'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass, ArrowLeft, Home } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

export default function NotFound() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={cn(
          'p-8 sm:p-12 rounded-2xl border max-w-md w-full relative overflow-hidden backdrop-blur-xl',
          isDark
            ? 'bg-white/[0.03] border-white/10 text-white shadow-2xl shadow-purple-950/40'
            : 'bg-white/80 border-slate-200 text-slate-900 shadow-xl shadow-slate-200'
        )}
      >
        <div className="w-16 h-16 rounded-2xl bg-accent-400/10 border border-accent-400/20 flex items-center justify-center mx-auto mb-6">
          <Compass className="w-8 h-8 text-accent-400 animate-spin-slow" />
        </div>

        <span className="text-xs uppercase tracking-widest font-mono text-accent-400 font-semibold mb-2 block">
          Error 404 • Coordinate Unresolved
        </span>
        <h1 className="text-2xl font-bold font-display mb-3">
          Lens Focus Lost
        </h1>
        <p className={cn('text-sm mb-6', isDark ? 'text-ink-600' : 'text-slate-600')}>
          The requested analytical horizon does not exist within the current temporal observation boundaries.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-accent-400 hover:bg-accent-500 text-white text-xs font-semibold shadow-lg shadow-accent-400/25 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            Return to Overview
          </Link>
          <Link
            href="/insights"
            className={cn(
              'w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium border transition-colors',
              isDark
                ? 'border-white/10 hover:bg-white/5 text-ink-800'
                : 'border-slate-300 hover:bg-slate-100 text-slate-700'
            )}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Evidence Board
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
