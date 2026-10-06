'use client';

import React, { useState } from 'react';
import { EvidenceItem } from '@/lib/data';
import {
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  FlaskConical,
} from 'lucide-react';

interface Props {
  evidenceList: EvidenceItem[];
}

const STRENGTH_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Strong: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Moderate: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Preliminary: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
};

export default function InsightInvestigationView({ evidenceList }: Props) {
  const [selectedId, setSelectedId] = useState<number>(evidenceList[0]?.id || 1);

  const selectedItem = evidenceList.find((item) => item.id === selectedId) || evidenceList[0];
  const strengthStyle = STRENGTH_STYLES[selectedItem.evidence_strength] || STRENGTH_STYLES.Moderate;

  return (
    <div className="space-y-8">
      {/* Epistemic Framework Explainer */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800">
        <div className="flex items-center gap-2.5 text-blue-400 font-semibold text-sm mb-2">
          <FlaskConical className="w-4 h-4" />
          <span>DecisionLens Epistemic Boundary Framework</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          DecisionLens enforces rigorous scientific boundaries to protect decision-makers from confusing observational correlation with operational causation.
          All insights in this platform are classified into three distinct layers:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <span className="font-semibold text-blue-400">1. Prediction</span>
            <p className="text-slate-400 mt-1 text-[11px]">
              Who is likely to become inactive? Evaluated by ROC-AUC (0.705) and Recall (70.1%).
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <span className="font-semibold text-indigo-400">2. Explanation</span>
            <p className="text-slate-400 mt-1 text-[11px]">
              What historical behaviors correlate with risk? Standardized coefficients & odds ratios.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
            <span className="font-semibold text-rose-400">3. Causation</span>
            <p className="text-slate-400 mt-1 text-[11px]">
              What happens if we intervene? Never inferred without randomized controlled A/B experiments.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Selector & Detail Card */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Insight Deep-Dive Inspector
          </h2>
          <p className="text-xs text-slate-500">
            Select any business question below to examine its empirical metrics, boundary caveats, and proposed experiment
          </p>
        </div>

        {/* Question Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {evidenceList.map((item) => {
            const isSelected = item.id === selectedId;
            const badge = STRENGTH_STYLES[item.evidence_strength] || STRENGTH_STYLES.Moderate;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`p-4 rounded-xl text-left border transition-all duration-150 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400">Insight #{item.id}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                      {item.evidence_strength}
                    </span>
                  </div>
                  <h4 className={`text-xs font-semibold line-clamp-2 ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                    {item.business_question}
                  </h4>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{item.association_causal}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Evidence Card */}
        {selectedItem && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 mt-4">
            {/* Card Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Evidence Card #{selectedItem.id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${strengthStyle.bg} ${strengthStyle.text} ${strengthStyle.border}`}>
                    {selectedItem.evidence_strength} Evidence
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {selectedItem.association_causal}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedItem.business_question}
                </h3>
              </div>
            </div>

            {/* Core Finding Callout */}
            <div className="p-4 rounded-xl bg-blue-50/70 border-l-4 border-blue-600 text-slate-900">
              <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                Core Empirical Finding
              </div>
              <p className="text-sm font-medium leading-relaxed">
                {selectedItem.finding}
              </p>
            </div>

            {/* Evidence Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supporting Metric */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Quantitative Evidence / Metric</span>
                </div>
                <p className="text-xs font-mono text-slate-800 bg-white p-3 rounded-lg border border-slate-200">
                  {selectedItem.supporting_metric}
                </p>
                <p className="text-[11px] text-slate-500">
                  Derived directly from pipeline SQL aggregations, cohort decay tables, and scikit-learn models.
                </p>
              </div>

              {/* Boundary Conditions & Limitations */}
              <div className="bg-amber-50/60 p-5 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Boundary Conditions & Limitations</span>
                </div>
                <p className="text-xs text-amber-950 bg-white/80 p-3 rounded-lg border border-amber-200 leading-relaxed">
                  {selectedItem.limitation}
                </p>
                <p className="text-[11px] text-amber-800">
                  Caveats that must be considered prior to committing capital or strategic resources.
                </p>
              </div>

              {/* Causal Guardrail */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  <span>Causal Status Classification</span>
                </div>
                <p className="text-xs text-slate-800 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                  <b>Status:</b> {selectedItem.association_causal}<br />
                  This finding is an observed relationship within historical transaction data.
                  Changes in behavior cannot be presumed to produce guaranteed counterfactual outcomes without testing.
                </p>
              </div>

              {/* Recommended Next Investigation */}
              <div className="bg-emerald-50/60 p-5 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900">
                  <Lightbulb className="w-4 h-4 text-emerald-700" />
                  <span>Recommended Next Investigation</span>
                </div>
                <p className="text-xs text-emerald-950 bg-white/80 p-3 rounded-lg border border-emerald-200 leading-relaxed font-medium">
                  {selectedItem.next_investigation}
                </p>
                <p className="text-[11px] text-emerald-800">
                  Concrete operational next step to validate or act upon this insight with controlled risk.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <hr className="border-slate-200" />

      {/* Master Evidence Table Display */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-900">
            Complete Evidence Register
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured repository of all 7 primary platform hypotheses and evidence classifications
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Business Question</th>
                <th className="px-4 py-3">Strength</th>
                <th className="px-4 py-3">Classification</th>
                <th className="px-4 py-3">Supporting Metric</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {evidenceList.map((item) => {
                const badge = STRENGTH_STYLES[item.evidence_strength] || STRENGTH_STYLES.Moderate;
                const isSelected = item.id === selectedId;
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">#{item.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.business_question}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {item.evidence_strength}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{item.association_causal}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600 truncate max-w-xs">{item.supporting_metric}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedId(item.id)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
