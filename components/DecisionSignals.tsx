'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Clock,
  TrendingDown,
  Users,
  ChevronDown,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface Signal {
  id: string;
  title: string;
  badge: string;
  badgeType: 'strong' | 'moderate' | 'preliminary';
  icon: any;
  metric: string;
  metricLabel: string;
  summary: string;
  implication: string;
  action: string;
}

const SIGNALS: Signal[] = [
  {
    id: 'sig-1',
    title: 'Revenue Concentration Risk',
    badge: 'Strong Evidence',
    badgeType: 'strong',
    icon: AlertTriangle,
    metric: '50.55%',
    metricLabel: 'from 21.06% accounts',
    summary: 'High Value cohort (1,053 accounts) generates more than half of all platform receipts (₹4,492,966.2).',
    implication: 'High value accounts drive bulk operating margin; loss of even a small fraction of this cohort creates severe revenue drag.',
    action: 'Prioritize VIP retention concierge and dedicated account health monitoring over broad acquisition.',
  },
  {
    id: 'sig-2',
    title: 'Recency Dominates Churn Risk',
    badge: 'Model Driver',
    badgeType: 'moderate',
    icon: Clock,
    metric: '+0.5453',
    metricLabel: 'Standardized Logistic Coef',
    summary: 'Days since last transaction is the single strongest multivariate predictor of Q4 customer dormancy.',
    implication: 'Every additional week of inactivity exponentially increases churn likelihood; early warning signals trigger well before formal churn.',
    action: 'Implement automated re-engagement triggers at day 35–45 before accounts cross into irreversible inactivity.',
  },
  {
    id: 'sig-3',
    title: 'First-Month Retention Cliff',
    badge: 'Cohort Decay',
    badgeType: 'strong',
    icon: TrendingDown,
    metric: '65.0%',
    metricLabel: 'Drop from M0 to M1',
    summary: 'Retention collapses from 100% at onboarding (M0) to ~35% at month 1 before stabilizing near ~25% by month 6.',
    implication: 'Post-purchase disengagement is overwhelmingly concentrated in the first 30 days following initial transaction.',
    action: 'Focus product onboarding, post-purchase communication, and 14-day check-ins to bridge the initial cliff.',
  },
  {
    id: 'sig-4',
    title: 'Intervention Pool Size',
    badge: 'Intervention Pool',
    badgeType: 'preliminary',
    icon: Users,
    metric: '645 Accounts',
    metricLabel: '12.9% above >0.70 threshold',
    summary: 'A clearly circumscribed high-risk group of 645 accounts exhibits imminent dormancy probability.',
    implication: 'Intervention pool is small enough for targeted, high-touch outreach without overwhelming operational resources.',
    action: 'Design a randomized controlled trial (A/B test) offering proactive incentives to 322 test accounts vs 323 controls.',
  },
];

export default function DecisionSignals() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-accent-400 font-semibold">
            Synthesis
          </span>
          <h3 className="text-lg sm:text-xl font-bold font-display">
            Decision Signals & Tactical Implications
          </h3>
        </div>
        <span className="text-xs text-ink-600 font-mono hidden sm:inline">
          4 High-Priority Signals
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SIGNALS.map((sig) => {
          const Icon = sig.icon;
          const isExpanded = expandedId === sig.id;

          return (
            <motion.div
              key={sig.id}
              layout
              onClick={() => toggle(sig.id)}
              className={cn(
                'rounded-xl border p-5 cursor-pointer transition-all duration-200 select-none',
                isDark
                  ? 'bg-white/[0.03] border-white/10 hover:border-white/20'
                  : 'bg-white border-slate-200 shadow-xs hover:shadow-md'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'p-2.5 rounded-lg shrink-0 mt-0.5',
                      sig.badgeType === 'strong'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : sig.badgeType === 'moderate'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-sm">
                        {sig.title}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold',
                          sig.badgeType === 'strong'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : sig.badgeType === 'moderate'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-blue-500/15 text-blue-400'
                        )}
                      >
                        {sig.badge}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold font-mono text-accent-300">
                        {sig.metric}
                      </span>
                      <span className="text-xs text-ink-600 font-mono">
                        {sig.metricLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-ink-600 p-1"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </div>

              <p className={cn('text-xs mt-3 leading-relaxed', isDark ? 'text-ink-700' : 'text-slate-600')}>
                {sig.summary}
              </p>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className={cn(
                      'mt-4 pt-3 border-t space-y-2 text-xs',
                      isDark ? 'border-white/10' : 'border-slate-100'
                    )}
                  >
                    <div>
                      <span className="font-semibold text-accent-400 text-[11px] uppercase tracking-wider block mb-0.5">
                        Operational Implication
                      </span>
                      <p className={isDark ? 'text-ink-800' : 'text-slate-700'}>
                        {sig.implication}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-emerald-400 text-[11px] uppercase tracking-wider block mb-0.5">
                        Recommended Action
                      </span>
                      <p className={isDark ? 'text-ink-800' : 'text-slate-700'}>
                        {sig.action}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
