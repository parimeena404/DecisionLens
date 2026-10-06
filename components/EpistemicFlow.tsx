'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { Eye, TrendingUp, FlaskConical, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    name: 'Association',
    subtitle: 'Observed Patterns',
    icon: Eye,
    tag: 'Historical Empirical Data',
    color: '#22C3A6',
    border: 'rgba(34, 195, 166, 0.4)',
    bg: 'rgba(34, 195, 166, 0.08)',
    desc: 'Observational patterns present in historical transaction data. Non-interventional correlations describing customer behavior over 2023–2024.',
    metrics: [
      { label: 'Observed Cohort', val: '5,000 Accounts' },
      { label: 'Evaluation Period', val: '21 Months' },
    ],
  },
  {
    step: '02',
    name: 'Prediction',
    subtitle: 'Forecasted Probabilities',
    icon: TrendingUp,
    tag: 'Logistic Regression Model',
    color: '#F5B83D',
    border: 'rgba(245, 184, 61, 0.4)',
    bg: 'rgba(245, 184, 61, 0.08)',
    desc: 'Statistical model scoring individual propensity to churn in Q4 2024. Strictly predictive: estimates risk given features without claiming cause.',
    metrics: [
      { label: 'Holdout ROC-AUC', val: '0.705' },
      { label: 'Test Holdout', val: '989 Customers' },
    ],
  },
  {
    step: '03',
    name: 'Causation',
    subtitle: 'Requires Experimentation',
    icon: FlaskConical,
    tag: 'Operational Decision Gate',
    color: '#7C5CFF',
    border: 'rgba(124, 92, 255, 0.4)',
    bg: 'rgba(124, 92, 255, 0.08)',
    desc: 'Counterfactual impact of business interventions. True causality requires randomized controlled trials (A/B testing) before budget commitment.',
    metrics: [
      { label: 'Validation Protocol', val: 'Randomized Trial (A/B)' },
      { label: 'Required Statistical Power', val: '80% (α = 0.05)' },
    ],
  },
];

export default function EpistemicFlow() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-accent-400 font-semibold">
            Epistemic Boundary Architecture
          </span>
          <h3 className="text-lg sm:text-xl font-bold font-display mt-0.5">
            The Three Evidentiary Thresholds
          </h3>
        </div>
        <p className={cn('text-xs max-w-md', isDark ? 'text-ink-600' : 'text-slate-600')}>
          Observational association does not imply predictive accuracy; prediction does not establish operational causation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
        {STEPS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className={cn(
                'relative rounded-xl p-5 border flex flex-col justify-between transition-all duration-300 hover:scale-[1.01]',
                isDark
                  ? 'bg-white/[0.03] border-white/10 hover:border-white/20'
                  : 'bg-white border-slate-200/80 shadow-sm hover:shadow-md'
              )}
            >
              {/* Top Row */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: item.bg, color: item.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold font-display leading-tight">{item.name}</h4>
                      <span className="text-[11px] text-ink-600 font-mono">{item.subtitle}</span>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border"
                    style={{
                      borderColor: item.border,
                      backgroundColor: item.bg,
                      color: item.color,
                    }}
                  >
                    Step {item.step}
                  </span>
                </div>

                <p className={cn('text-xs leading-relaxed my-3', isDark ? 'text-ink-700' : 'text-slate-600')}>
                  {item.desc}
                </p>
              </div>

              {/* Metrics footer */}
              <div
                className={cn(
                  'pt-3 border-t grid grid-cols-2 gap-2 text-[11px]',
                  isDark ? 'border-white/5' : 'border-slate-100'
                )}
              >
                {item.metrics.map((m) => (
                  <div key={m.label}>
                    <div className="text-[10px] text-ink-600 truncate">{m.label}</div>
                    <div className="font-mono font-medium truncate mt-0.5">{m.val}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
