'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { EvidenceItem } from '@/lib/data';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import {
  FlaskConical,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  X,
  Target,
  FileText,
  Sparkles,
} from 'lucide-react';

interface Props {
  evidenceList: EvidenceItem[];
  initialRecordId?: number;
}

export default function InsightInvestigationView({
  evidenceList,
  initialRecordId,
}: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const searchParams = useSearchParams();
  const router = useRouter();

  const [strengthFilter, setStrengthFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(
    initialRecordId || null
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const recParam = searchParams.get('record');
    if (recParam) {
      const parsed = parseInt(recParam, 10);
      if (!isNaN(parsed) && evidenceList.some((e) => e.id === parsed)) {
        setSelectedRecordId(parsed);
      }
    }
  }, [searchParams, evidenceList]);

  // Filter items
  const filteredRecords = useMemo(() => {
    return evidenceList.filter((item) => {
      const matchStrength =
        strengthFilter === 'ALL' || item.evidence_strength === strengthFilter;
      const matchSearch =
        searchQuery.trim() === '' ||
        item.business_question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.finding.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supporting_metric.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStrength && matchSearch;
    });
  }, [evidenceList, strengthFilter, searchQuery]);

  const activeRecord = useMemo(() => {
    if (!selectedRecordId) return null;
    return evidenceList.find((e) => e.id === selectedRecordId) || null;
  }, [evidenceList, selectedRecordId]);

  const counts = useMemo(() => {
    return {
      all: evidenceList.length,
      strong: evidenceList.filter((e) => e.evidence_strength === 'Strong').length,
      moderate: evidenceList.filter((e) => e.evidence_strength === 'Moderate').length,
      preliminary: evidenceList.filter((e) => e.evidence_strength === 'Preliminary').length,
    };
  }, [evidenceList]);

  const handleOpenRecord = (id: number) => {
    setSelectedRecordId(id);
    const url = new URL(window.location.href);
    url.searchParams.set('record', id.toString());
    window.history.pushState({}, '', url.toString());
  };

  const handleCloseRecord = () => {
    setSelectedRecordId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('record');
    window.history.pushState({}, '', url.toString());
  };

  const handleNavigateRecord = (delta: number) => {
    if (!selectedRecordId) return;
    const currentIndex = evidenceList.findIndex((e) => e.id === selectedRecordId);
    const nextIndex = (currentIndex + delta + evidenceList.length) % evidenceList.length;
    handleOpenRecord(evidenceList[nextIndex].id);
  };

  const handleCopyLink = () => {
    if (!selectedRecordId) return;
    const shareUrl = `${window.location.origin}/insights?record=${selectedRecordId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getBadgeStyle = (strength: string) => {
    if (strength === 'Strong') {
      return {
        bg: 'bg-emerald-500/15',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
      };
    }
    if (strength === 'Moderate') {
      return {
        bg: 'bg-amber-500/15',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
      };
    }
    return {
      bg: 'bg-blue-500/15',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
    };
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. EPISTEMIC BOUNDARY FRAMEWORK HERO */}
      <div
        className={cn(
          'p-6 sm:p-8 rounded-2xl border space-y-5 transition-colors',
          isDark
            ? 'bg-white/[0.03] border-white/10 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-accent-400 font-semibold text-sm">
            <FlaskConical className="w-5 h-5" />
            <span>Consulting Evidence Register & Epistemic Boundary System</span>
          </div>
          <span className="text-[11px] font-mono px-3 py-1 rounded-full border border-white/10 bg-white/5 text-ink-600 self-start sm:self-auto">
            7 Empirical Records • Audited Boundaries
          </span>
        </div>

        <p className={cn('text-xs sm:text-sm leading-relaxed max-w-4xl', isDark ? 'text-ink-700' : 'text-slate-600')}>
          DecisionLens enforces an uncompromising epistemic distinction to protect commercial stakeholders from confusing observational correlations with operational cause-and-effect. Every insight record is bounded by three empirical gates:
        </p>

        {/* 3 Validation Boundaries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Gate 1 */}
          <div
            className={cn(
              'p-4 rounded-xl border',
              isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'
            )}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold font-display text-emerald-400">
                1. Association
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold">
                Observed
              </span>
            </div>
            <p className={cn('text-[11px] leading-relaxed', isDark ? 'text-ink-600' : 'text-slate-600')}>
              Covariance in retrospective transactions. Demonstrates observed co-occurrence without proving intervention payoff.
            </p>
          </div>

          {/* Gate 2 */}
          <div
            className={cn(
              'p-4 rounded-xl border',
              isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'
            )}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold font-display text-amber-400">
                2. Prediction
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-semibold">
                Forecasted
              </span>
            </div>
            <p className={cn('text-[11px] leading-relaxed', isDark ? 'text-ink-600' : 'text-slate-600')}>
              Supervised statistical scoring. Orders customer dormancy risk without guaranteeing causal mechanism.
            </p>
          </div>

          {/* Gate 3 */}
          <div
            className={cn(
              'p-4 rounded-xl border',
              isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'
            )}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold font-display text-purple-400">
                3. Causation
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 font-semibold">
                Requires A/B
              </span>
            </div>
            <p className={cn('text-[11px] leading-relaxed', isDark ? 'text-ink-600' : 'text-slate-600')}>
              Counterfactual impact under randomized intervention. Absolute prerequisite before committing marketing budgets.
            </p>
          </div>
        </div>
      </div>

      {/* 2. FILTER CONTROLS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: 'ALL', label: `All (${counts.all})` },
            { key: 'Strong', label: `Strong (${counts.strong})` },
            { key: 'Moderate', label: `Moderate (${counts.moderate})` },
            { key: 'Preliminary', label: `Preliminary (${counts.preliminary})` },
          ].map((chip) => {
            const isActive = strengthFilter === chip.key;
            return (
              <button
                key={chip.key}
                onClick={() => setStrengthFilter(chip.key)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                  isActive
                    ? 'bg-accent-400 text-white border-accent-400 shadow-md shadow-accent-400/20'
                    : isDark
                    ? 'border-white/10 bg-white/5 hover:bg-white/10 text-ink-600 hover:text-white'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs'
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-ink-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records or findings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border focus:outline-none focus:border-accent-400 font-mono',
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder:text-ink-600'
                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
            )}
          />
        </div>
      </div>

      {/* 3. 7 EVIDENCE CARDS GRID */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AnimatePresence>
          {filteredRecords.map((item) => {
            const bStyle = getBadgeStyle(item.evidence_strength);

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 hover:scale-[1.01]',
                  isDark
                    ? 'bg-white/[0.03] border-white/10 hover:border-white/20'
                    : 'bg-white border-slate-200 shadow-xs hover:shadow-md'
                )}
              >
                <div>
                  {/* Top Bar: ID + Strength + Epistemic Type */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-accent-400 bg-accent-400/10 px-2 py-0.5 rounded">
                        #{String(item.id).padStart(2, '0')}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border',
                          bStyle.bg,
                          bStyle.text,
                          bStyle.border
                        )}
                      >
                        {item.evidence_strength}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-ink-600 bg-white/5 px-2 py-0.5 rounded">
                      {item.association_causal}
                    </span>
                  </div>

                  {/* Question */}
                  <h3 className="font-display font-bold text-sm leading-snug mb-2">
                    {item.business_question}
                  </h3>

                  {/* Finding */}
                  <p className={cn('text-xs leading-relaxed mb-4', isDark ? 'text-ink-700' : 'text-slate-600')}>
                    {item.finding}
                  </p>
                </div>

                <div>
                  {/* Metric Pill */}
                  <div
                    className={cn(
                      'p-2.5 rounded-xl border text-[11px] font-mono flex items-center justify-between mb-4',
                      isDark ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'
                    )}
                  >
                    <span className="text-ink-600">Metric Telemetry:</span>
                    <span className="font-semibold text-accent-300 truncate max-w-[220px]">
                      {item.supporting_metric}
                    </span>
                  </div>

                  {/* Inspect Button */}
                  <button
                    onClick={() => handleOpenRecord(item.id)}
                    className={cn(
                      'w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border',
                      isDark
                        ? 'border-white/10 hover:border-accent-400 hover:text-white bg-white/5 hover:bg-accent-400/20'
                        : 'border-slate-200 hover:border-accent-400 text-slate-800 hover:text-accent-600 bg-slate-50'
                    )}
                  >
                    <span>Inspect Evidence Record</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* 4. FULL RECORD MODAL INSPECTOR VIEW */}
      <AnimatePresence>
        {activeRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={handleCloseRecord}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border p-6 sm:p-8 z-10 shadow-2xl flex flex-col justify-between',
                isDark
                  ? 'bg-[#121438] border-white/15 text-white shadow-purple-950/50'
                  : 'bg-white border-slate-300 text-slate-900 shadow-2xl'
              )}
            >
              <div className="space-y-6">
                {/* Header & Controls */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-accent-400 bg-accent-400/10 px-2.5 py-1 rounded">
                      Record #{String(activeRecord.id).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        'text-xs font-mono px-2.5 py-1 rounded-full font-semibold border',
                        getBadgeStyle(activeRecord.evidence_strength).bg,
                        getBadgeStyle(activeRecord.evidence_strength).text,
                        getBadgeStyle(activeRecord.evidence_strength).border
                      )}
                    >
                      {activeRecord.evidence_strength} Evidence
                    </span>
                    <span className="text-xs font-mono text-ink-600 bg-white/5 px-2 py-1 rounded hidden sm:inline">
                      {activeRecord.association_causal}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="p-2 rounded-lg border border-white/10 hover:bg-white/10 text-ink-600 transition-colors"
                      title="Copy Shareable Link"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleCloseRecord}
                      className="p-2 rounded-lg border border-white/10 hover:bg-white/10 text-ink-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Business Question */}
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-accent-400 font-semibold block mb-1">
                    Primary Business Inquiry
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold font-display leading-snug">
                    {activeRecord.business_question}
                  </h2>
                </div>

                {/* Section 1: Empirical Finding & Metrics */}
                <div
                  className={cn(
                    'p-4 sm:p-5 rounded-xl border space-y-2',
                    isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'
                  )}
                >
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Empirical Finding & Metrics</span>
                  </div>
                  <p className={cn('text-xs sm:text-sm leading-relaxed', isDark ? 'text-ink-800' : 'text-slate-800')}>
                    {activeRecord.finding}
                  </p>
                  <div className="pt-2 font-mono text-xs text-accent-300">
                    Supporting Data: <strong>{activeRecord.supporting_metric}</strong>
                  </div>
                </div>

                {/* Section 2: Methodological Boundaries & Threats to Validity */}
                <div
                  className={cn(
                    'p-4 sm:p-5 rounded-xl border space-y-2',
                    isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'
                  )}
                >
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Methodological Boundaries & Threats to Validity</span>
                  </div>
                  <p className={cn('text-xs leading-relaxed', isDark ? 'text-amber-200/90' : 'text-amber-900')}>
                    {activeRecord.limitation}
                  </p>
                </div>

                {/* Section 3: Epistemic Boundary Statement */}
                <div
                  className={cn(
                    'p-4 sm:p-5 rounded-xl border space-y-2',
                    isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200'
                  )}
                >
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                    <FileText className="w-4 h-4" />
                    <span>Epistemic Boundary Statement</span>
                  </div>
                  <p className={cn('text-xs leading-relaxed', isDark ? 'text-purple-200/90' : 'text-purple-900')}>
                    Classification: <strong>{activeRecord.association_causal}</strong>. This metric captures historical co-occurrence. It must not be treated as a causal lever without counterfactual verification.
                  </p>
                </div>

                {/* Section 4: Recommended Empirical Experiment */}
                <div
                  className={cn(
                    'p-4 sm:p-5 rounded-xl border space-y-2',
                    isDark ? 'bg-teal-500/10 border-teal-500/20' : 'bg-teal-50 border-teal-200'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                      <Target className="w-4 h-4" />
                      <span>Recommended Empirical Experiment</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                      RCT Protocol • Power 80%
                    </span>
                  </div>
                  <p className={cn('text-xs leading-relaxed', isDark ? 'text-teal-200/90' : 'text-teal-900')}>
                    {activeRecord.next_investigation}
                  </p>
                </div>
              </div>

              {/* Modal Footer with Prev/Next Navigation */}
              <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => handleNavigateRecord(-1)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-white/10 hover:bg-white/10 text-xs font-medium text-ink-700 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous Record</span>
                </button>

                <div className="text-xs font-mono text-ink-600 hidden sm:block">
                  Record {activeRecord.id} of {evidenceList.length}
                </div>

                <button
                  onClick={() => handleNavigateRecord(1)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-white/10 hover:bg-white/10 text-xs font-medium text-ink-700 hover:text-white transition-colors"
                >
                  <span>Next Record</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
