'use client';

import React from 'react';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';

export default function StatusStrip() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const items = [
    { label: 'Pipeline', value: 'Complete', color: 'text-risk-low' },
    { label: 'Observation cutoff', value: '2024-09-30', mono: true },
    { label: 'Target window', value: 'Q4 2024', mono: true },
    { label: 'Data leakage', value: 'None verified', badge: true },
  ];

  return (
    <div
      className={cn(
        'border-b text-[11px] overflow-x-auto',
        isDark
          ? 'bg-white/[0.02] border-white/[0.04]'
          : 'bg-black/[0.015] border-black/[0.04]'
      )}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-5 py-1.5 whitespace-nowrap">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className={isDark ? 'text-ink-600' : 'text-ink-500'}>
              {item.label}:
            </span>
            {item.badge ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-risk-low/15 text-risk-low font-medium badge-verified">
                <ShieldCheck className="w-3 h-3" />
                {item.value}
              </span>
            ) : (
              <span
                className={cn(
                  'font-medium',
                  item.mono && 'font-mono',
                  item.color || (isDark ? 'text-ink-800' : 'text-ink-400')
                )}
              >
                {item.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
