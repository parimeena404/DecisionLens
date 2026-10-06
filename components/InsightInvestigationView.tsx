'use client';

import React, { useState, useMemo } from 'react';
import { EvidenceItem } from '@/lib/data';
import {
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  FlaskConical,
  Filter,
  Search,
  Sparkles,
  Layers,
  FileCheck2,
  TrendingDown,
  Info,
  BadgeAlert,
} from 'lucide-react';

interface Props {
  evidenceList: EvidenceItem[];
}

const STRENGTH_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Strong: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Moderate: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Preliminary: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

export default function InsightInvestigationView({ evidenceList }: Props) {
  const [selectedId, setSelectedId] = useState<number>(evidenceList[0]?.id || 1);
  const [strengthFilter, setStrengthFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredEvidence = useMemo(() => {
    return evidenceList.filter((item) => {
      const matchStrength = strengthFilter === 'ALL' || item.evidence_strength === strengthFilter;
      const matchSearch =
        searchQuery.trim() === '' ||
        item.business_question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.finding.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supporting_metric.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStrength && matchSearch;
    });
  }, [evidenceList, strengthFilter, searchQuery]);

  const activeItem =
    evidenceList.find((item) => item.id === selectedId) ||
    filteredEvidence[0] ||
    evidenceList[0];

  const strengthStyle = STRENGTH_STYLES[activeItem?.evidence_strength] || STRENGTH_STYLES.Moderate;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Epistemic Boundary Framework Header */}
      <div className="bg-slate-900 text-white rounded-lg p-6 shadow-xs border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
            <FlaskConical className="w-4 h-4" />
            <span>Consulting Evidence Register & Epistemic Boundary System</span>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 self-start sm:self-auto">
            7 Peer-Reviewed Empirical Records
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          DecisionLens enforces strict epistemic taxonomy to protect leadership from confusing observational patterns with operational cause-and-effect. Every insight is audited against three validation boundaries:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-md bg-slate-800/90 border border-slate-700/80">
            <div className="font-semibold text-blue-300 mb-1 flex items-center justify-between">
              <span>1. Association</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-200">Observed</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Covariance in retrospective logs. Demonstrates pattern co-occurrence without proving intervention efficacy.
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-slate-800/90 border border-slate-700/80">
            <div className="font-semibold text-indigo-300 mb-1 flex items-center justify-between">
              <span>2. Prediction</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-200">Forecasted</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Temporal supervised machine learning. Orders accounts by future likelihood without explaining mechanism.
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-slate-800/90 border border-slate-700/80">
            <div className="font-semibold text-rose-300 mb-1 flex items-center justify-between">
              <span>3. Causation</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-900/60 text-rose-200">Requires A/B</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Never asserted from passive datasets. Demands randomized controlled trials to isolate confounders.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Investigation Toolbar */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-1">
            Filter Evidence:
          </span>
          {['ALL', 'Strong', 'Moderate', 'Preliminary'].map((s) => (
            <button
              key={s}
              onClick={() => setStrengthFilter(s)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                strengthFilter === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {s === 'ALL' ? 'All Evidence (7)' : `${s} Strength`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions or metrics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
      </div>

      {/* 3. Analyst Investigation Workspace: Split Master-Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List of Evidence Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Evidence Items ({filteredEvidence.length})</span>
            <span>Click to inspect record</span>
          </div>

          <div className="space-y-2.5">
            {filteredEvidence.map((item) => {
              const isSelected = item.id === activeItem?.id;
              const style = STRENGTH_STYLES[item.evidence_strength] || STRENGTH_STYLES.Moderate;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-blue-600 ring-1 ring-blue-600 shadow-sm'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        #{String(item.id).padStart(2, '0')}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}
                      >
                        {item.evidence_strength} Evidence
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {item.association_causal.includes('Prediction') ? 'Prediction' : 'Association'}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2">
                    {item.business_question}
                  </h3>

                  <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {item.finding}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span className="truncate max-w-[200px]" title={item.supporting_metric}>
                      {item.supporting_metric}
                    </span>
                    <span className="text-blue-600 font-sans font-medium flex items-center gap-0.5">
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Deep-Dive Inspection Board (7 Cols) */}
        {activeItem && (
          <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200/80 p-6 shadow-xs space-y-6 sticky top-20">
            {/* Board Header */}
            <div className="border-b border-slate-100 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    RECORD #{String(activeItem.id).padStart(2, '0')}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${strengthStyle.bg} ${strengthStyle.text} ${strengthStyle.border}`}
                  >
                    {activeItem.evidence_strength} Evidence Strength
                  </span>
                </div>

                {/* Explicit Epistemic Boundary Badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-semibold tracking-wide">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{activeItem.association_causal.toUpperCase()}</span>
                </div>
              </div>

              <h2 className="text-base font-bold text-slate-900 tracking-tight pt-1">
                {activeItem.business_question}
              </h2>
            </div>

            {/* Section 1: Empirical Finding & Supporting Metric */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Empirical Finding & Metrics</span>
              </div>
              <div className="p-4 rounded-md bg-slate-50 border border-slate-200/80 space-y-2">
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {activeItem.finding}
                </p>
                <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-xs font-mono text-blue-900 bg-blue-50/60 p-2.5 rounded">
                  <span className="text-[11px] font-sans font-semibold text-blue-700">Supporting Metric:</span>
                  <span className="font-bold">{activeItem.supporting_metric}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Methodological Limitation */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Methodological Boundaries & Threats to Validity</span>
              </div>
              <div className="p-4 rounded-md bg-amber-50/40 border border-amber-200/80 text-xs text-amber-950 leading-relaxed">
                <p>{activeItem.limitation}</p>
              </div>
            </div>

            {/* Section 3: Epistemic Boundary Audit */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Epistemic Boundary Statement</span>
              </div>
              <div className="p-4 rounded-md bg-slate-900 text-slate-200 text-xs leading-relaxed space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
                  <span>Status: {activeItem.association_causal}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  This finding records a historical pattern in observational data. Changing this metric operationally does not guarantee an outcome shift without prior randomized verification.
                </p>
              </div>
            </div>

            {/* Section 4: Recommended Next Empirical Investigation / Experiment */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <FlaskConical className="w-4 h-4 text-blue-600" />
                <span>Recommended Empirical Experiment</span>
              </div>
              <div className="p-4 rounded-md bg-blue-50/50 border border-blue-200 text-xs text-blue-950 leading-relaxed space-y-2">
                <p className="font-medium text-slate-900">
                  {activeItem.next_investigation}
                </p>
                <div className="pt-2 text-[11px] text-slate-500 border-t border-blue-100 flex items-center justify-between">
                  <span>Method: Randomized Controlled Trial (A/B Test)</span>
                  <span className="font-mono text-slate-700">Target Power: 80%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
