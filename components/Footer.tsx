'use client';

import React from 'react';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

export default function Footer() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer
      className={cn(
        'border-t py-6 mt-16 text-center text-xs',
        isDark ? 'border-white/[0.04] text-ink-600' : 'border-black/[0.06] text-ink-500'
      )}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="px-2 py-0.5 rounded bg-evidence-strong-bg text-evidence-strong font-medium text-[11px]">
            Association
          </span>
          <span className={isDark ? 'text-ink-500' : 'text-ink-600'}>≠</span>
          <span className="px-2 py-0.5 rounded bg-evidence-moderate-bg text-evidence-moderate font-medium text-[11px]">
            Prediction
          </span>
          <span className={isDark ? 'text-ink-500' : 'text-ink-600'}>≠</span>
          <span className="px-2 py-0.5 rounded bg-evidence-preliminary-bg text-evidence-preliminary font-medium text-[11px]">
            Causation
          </span>
        </div>
        <p className={isDark ? 'text-ink-600' : 'text-ink-500'}>
          DecisionLens enforces epistemic distinctions. Observational findings do not establish operational causality.
        </p>
      </div>
    </footer>
  );
}
