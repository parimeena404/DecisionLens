'use client';

import React, { useState } from 'react';
import { ChurnMetrics, FeatureImportance, CohortRow } from '@/lib/data';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  ShieldCheck,
  HelpCircle,
  Activity,
  Layers,
  ArrowRight,
  TrendingDown,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Target,
  FlaskConical,
} from 'lucide-react';

interface Props {
  metrics: ChurnMetrics;
  featureImportance: FeatureImportance[];
  riskTierCounts: { name: string; value: number }[];
  cohortMatrix: CohortRow[];
  decayCurve: { monthOffset: number; retention: number }[];
}

const TIER_COLORS: Record<string, string> = {
  'Low Risk': '#10b981',    // Emerald
  'Medium Risk': '#f59e0b', // Amber
  'High Risk': '#ef4444',   // Rose
};

export default function RetentionChurnView({
  metrics,
  featureImportance,
  riskTierCounts,
  cohortMatrix,
  decayCurve,
}: Props) {
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);

  // Features sorted by coefficient
  const sortedByMagnitude = [...featureImportance].sort(
    (a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient)
  );

  const featChartData = [...featureImportance]
    .sort((a, b) => a.coefficient - b.coefficient)
    .map((f) => ({
      feature: f.feature,
      coefficient: f.coefficient,
      absVal: Math.abs(f.coefficient),
      fill: f.coefficient > 0 ? '#ef4444' : '#10b981',
      labelDirection: f.coefficient > 0 ? 'Increases Churn Risk' : 'Protective / Retentive',
    }));

  const cm = metrics.confusion_matrix;
  const displayMonths = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  const totalTierAccounts = riskTierCounts.reduce((acc, t) => acc + t.value, 0) || 5000;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Methodology & Zero Leakage Banner */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-200/80 rounded-lg p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-md bg-blue-600 text-white shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Strict Temporal Zero-Leakage Architecture</span>
              <span className="font-mono text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed max-w-3xl">
              All 8 behavioural features are strictly derived from orders placed before the <strong>2024-09-30</strong> cutoff. The binary churn target evaluates transactions exclusively within <strong>Q4 2024 (Oct 1 – Dec 31, 2024)</strong>. No future information is accessible during inference.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto text-[11px] font-mono text-slate-500 bg-white/80 px-2.5 py-1 rounded border border-slate-200">
          <span>Target: Zero Q4 Purchases</span>
        </div>
      </div>

      {/* 2. Longitudinal Cohort Retention Dynamics */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>1. Longitudinal Cohort Retention Dynamics</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                12-Month Observation
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Tracking repeat order persistence across monthly acquisition cohorts from M+0 to M+12
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Avg 6-Mo Retention: <strong className="text-slate-800">26.2%</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Smooth Decay Curve Area Chart */}
          <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Mean Cohort Retention Decay Curve
                </h3>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                  Aggregate
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-4">
                Percentage of acquired buyers returning for subsequent purchases by month offset
              </p>

              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={decayCurve} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="decayGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="monthOffset"
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickFormatter={(val) => `${val}%`}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Mean Retention']}
                      labelFormatter={(lbl) => `Month +${lbl}`}
                      contentStyle={{
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '11px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="retention"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#decayGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-3 p-3 bg-slate-50 rounded-md border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Retention Finding:</strong> Steepest attrition occurs immediately between M0 (100%) and M1 (~35%), leveling to an asymptotic plateau around 25% by M6.
            </div>
          </div>

          {/* Cohort Heatmap Matrix Table */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Cohort Retention Heatmap (%)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Cell intensity reflects proportion of cohort placing transactions in offset month
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-100 inline-block border border-slate-200" />
                <span>&lt;20%</span>
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-100 inline-block border border-blue-200" />
                <span>20-35%</span>
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-300 inline-block border border-blue-300" />
                <span>35-50%</span>
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block" />
                <span>&gt;50%</span>
              </div>
            </div>

            <div className="overflow-x-auto flex-1 max-h-[290px]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-[10px] font-semibold text-slate-500 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 text-slate-600 font-sans">Cohort</th>
                    {displayMonths.map((m) => (
                      <th key={m} className="px-2 py-2 text-center">+{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cohortMatrix.slice(0, 12).map((row) => (
                    <tr
                      key={row.cohort_month}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        selectedCohort === row.cohort_month ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => setSelectedCohort(row.cohort_month)}
                    >
                      <td className="px-3 py-1.5 font-medium text-slate-900 whitespace-nowrap text-[11px]">
                        {row.cohort_month}
                      </td>
                      {displayMonths.map((m) => {
                        const valStr = row[m];
                        const val = valStr !== '' && valStr !== undefined ? parseFloat(String(valStr)) : null;

                        let cellClass = 'text-slate-300';
                        if (val !== null) {
                          if (val >= 80) cellClass = 'bg-blue-600 text-white font-bold';
                          else if (val >= 40) cellClass = 'bg-blue-300 text-blue-950 font-medium';
                          else if (val >= 25) cellClass = 'bg-blue-100 text-blue-900';
                          else if (val >= 15) cellClass = 'bg-blue-50/80 text-blue-800';
                          else cellClass = 'bg-slate-50 text-slate-600';
                        }

                        return (
                          <td
                            key={m}
                            className={`px-1.5 py-1 text-center text-[10px] ${cellClass}`}
                            title={val !== null ? `${row.cohort_month} +${m}: ${val.toFixed(1)}%` : undefined}
                          >
                            {val !== null ? `${val.toFixed(0)}%` : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between text-[11px] text-slate-500">
              <span>Best cohort: <strong className="text-slate-800">2023-01 (36.7% at M6)</strong></span>
              <span>Lowest: <strong className="text-slate-800">2023-10 (12.8% at M6)</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Predictive Churn Diagnostic Cockpit */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>2. Churn Risk Distribution & Holdout Validation</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Logistic Regression (Balanced)
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Evaluated on 989 held-out test accounts using regularized logistic classification
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Test Holdout: <strong className="text-slate-800">N = {metrics.test_size}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Tier Donut & Proportions */}
          <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Customer Risk Tier Split
                </h3>
                <span className="text-[10px] font-mono text-slate-500">5,000 Total</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Distribution of accounts classified by model-estimated churn probability
              </p>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskTierCounts}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {riskTierCounts.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={TIER_COLORS[entry.name] || '#94a3b8'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${Number(val).toLocaleString()} accounts`, 'Volume']}
                      contentStyle={{
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '11px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Tiers Legend with Proportions */}
              <div className="space-y-2 mt-2">
                {riskTierCounts.map((tier) => {
                  const pct = ((tier.value / totalTierAccounts) * 100).toFixed(1);
                  return (
                    <div
                      key={tier.name}
                      className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-50/70 border border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: TIER_COLORS[tier.name] }}
                        />
                        <span className="font-medium text-slate-800">{tier.name}</span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-600">
                        <strong className="text-slate-900">{tier.value.toLocaleString()}</strong> ({pct}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              High Risk accounts (&gt;65% prob) constitute an actionable, constrained pool for re-engagement.
            </div>
          </div>

          {/* Model Performance Cards + Confusion Matrix */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Holdout Validation Metrics (N = {metrics.test_size})
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  Train N: {metrics.train_size} | Test N: {metrics.test_size}
                </span>
              </div>

              {/* 4 Score Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                <div className="p-3 bg-blue-50/60 rounded-md border border-blue-100">
                  <div className="text-[10px] font-semibold text-blue-800 uppercase tracking-wider">
                    ROC-AUC
                  </div>
                  <div className="text-xl font-bold font-mono text-blue-950 mt-0.5">
                    {metrics.roc_auc.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-blue-700 mt-1">
                    Strong discriminative ranking
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-md border border-emerald-100">
                  <div className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider">
                    Recall
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-950 mt-0.5">
                    {(metrics.recall * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-1">
                    Captures 7 in 10 churners
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/60 rounded-md border border-indigo-100">
                  <div className="text-[10px] font-semibold text-indigo-800 uppercase tracking-wider">
                    Precision
                  </div>
                  <div className="text-xl font-bold font-mono text-indigo-950 mt-0.5">
                    {(metrics.precision * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-indigo-700 mt-1">
                    Alert veracity rate
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <div className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">
                    F1-Score
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    {metrics.f1.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Harmonic mean of P & R
                  </div>
                </div>
              </div>

              {/* Confusion Matrix Breakdown */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                    Confusion Matrix (Holdout Accounts)
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Threshold: p = 0.50
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-600">True Retained (TN)</span>
                      <span className="font-mono text-xs font-bold text-slate-900">{cm[0][0]}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Correctly classified active buyers
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50/60 rounded-md border border-amber-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-amber-800">False Churn (FP)</span>
                      <span className="font-mono text-xs font-bold text-amber-950">{cm[0][1]}</span>
                    </div>
                    <p className="text-[10px] text-amber-700 mt-0.5">
                      Active customers incorrectly flagged
                    </p>
                  </div>

                  <div className="p-3 bg-rose-50/60 rounded-md border border-rose-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-rose-800">Missed Churn (FN)</span>
                      <span className="font-mono text-xs font-bold text-rose-950">{cm[1][0]}</span>
                    </div>
                    <p className="text-[10px] text-rose-700 mt-0.5">
                      Inactive customers missed by model
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50/60 rounded-md border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-emerald-800">Detected Churn (TP)</span>
                      <span className="font-mono text-xs font-bold text-emerald-950">{cm[1][1]}</span>
                    </div>
                    <p className="text-[10px] text-emerald-700 mt-0.5">
                      Accurately anticipated inactivity
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 flex items-center justify-between">
              <span>Balanced class weighting applied during optimization to prevent majority-class bias.</span>
              <span className="font-mono text-slate-700">Holdout N = {metrics.test_size}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Risk Driver Engine & Directional Explanation */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>3. Feature Attribution Engine & Directional Effects</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Standardized Log-Odds Coefficients
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Ranking attributes by statistical magnitude and association with predicted Q4 inactivity
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Observational Associations, Not Causal Levers
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Horizontal Bar Chart of Standardized Coefficients */}
          <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Standardized Coefficient Weights (β)
                </h3>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1 text-rose-700">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    + Risk
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    - Risk (Protective)
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mb-4">
                Positive values correlate with higher likelihood of Q4 inactivity; negative values correlate with retention
              </p>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={featChartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 65, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis
                      type="number"
                      domain={[-0.8, 0.8]}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      type="category"
                      dataKey="feature"
                      tick={{ fontSize: 11, fill: '#1e293b' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <Tooltip
                      formatter={(val: any) => [
                        `${Number(val) > 0 ? '+' : ''}${Number(val).toFixed(4)}`,
                        'Std Coefficient (β)',
                      ]}
                      contentStyle={{
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '11px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      }}
                    />
                    <Bar dataKey="coefficient" radius={[2, 2, 2, 2]}>
                      {featChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              Recency (+0.5453) is the single strongest positive predictor of customer dormancy.
            </div>
          </div>

          {/* Detailed Directional Interpretation Table */}
          <div className="bg-white rounded-lg border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Attribution & Association Interpretation
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Business meaning of statistical features in the observation period
                </p>
              </div>
            </div>

            <div className="overflow-x-auto flex-1 max-h-[320px]">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[10px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Feature</th>
                    <th className="px-4 py-2.5 text-right font-mono">Weight (β)</th>
                    <th className="px-4 py-2.5">Behavioral Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedByMagnitude.map((f) => {
                    const isRisk = f.coefficient > 0;
                    return (
                      <tr key={f.feature} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-2.5 font-mono font-medium text-slate-900">
                          {f.feature}
                        </td>
                        <td
                          className={`px-4 py-2.5 text-right font-mono font-semibold ${
                            isRisk ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {f.coefficient > 0 ? `+${f.coefficient.toFixed(4)}` : f.coefficient.toFixed(4)}
                        </td>
                        <td className="px-4 py-2.5 text-[11px] leading-relaxed">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium mr-1.5 ${
                              isRisk ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {isRisk ? 'Risk Indicator' : 'Protective'}
                          </span>
                          <span className="text-slate-600">
                            {f.direction}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-2.5 bg-slate-50/50 border-t border-slate-100 text-[11px] text-slate-500">
              <strong className="text-slate-700">Epistemic Note:</strong> Standardized weights reflect covariance in historical data; changing a metric does not guarantee churn prevention.
            </div>
          </div>
        </div>
      </div>

      {/* 5. Consulting Guide: How to Read This Model */}
      <div className="bg-slate-900 text-slate-100 rounded-lg p-6 shadow-xs border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Consulting Guide: How to Read & Apply This Churn Model
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-md bg-slate-800/80 border border-slate-700/60">
            <h4 className="font-semibold text-blue-300 mb-1">
              What the Model Predicts
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              It produces a probabilistic ranking of whether a customer will place zero purchases during Q4 2024, given behavioral features observed prior to 2024-09-30.
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-slate-800/80 border border-slate-700/60">
            <h4 className="font-semibold text-indigo-300 mb-1">
              Why the Model is Useful
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              With 70.1% recall and ROC-AUC 0.705, the model effectively filters 5,000 accounts into a high-density target queue, concentrating intervention budgets on buyers at true risk.
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-slate-800/80 border border-slate-700/60">
            <h4 className="font-semibold text-rose-300 mb-1">
              Why Prediction != Causation
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              A high recency coefficient means dormancy correlates with churn. It does not prove that sending an email or discount will cause the customer to stay.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Decision Layer: Testable Interventions (Hypotheses) */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
              <span>Decision Layer: Experimental Hypotheses for Growth Teams</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Formulated actions must be treated as hypotheses to validate via randomized controlled A/B trials:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-md bg-slate-50 border border-slate-200/80">
            <div className="font-semibold text-slate-900 mb-1">
              Hypothesis A: Re-engagement Window
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Test automated trigger emails at Day 45 (prior to high-recency cliff) vs status quo control group to evaluate incremental lift on 90-day retention.
            </p>
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200/80">
            <div className="font-semibold text-slate-900 mb-1">
              Hypothesis B: Category Diversification
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Test cross-category bundle discounts for single-category buyers to test if broadening catalog exposure improves customer lifetime duration.
            </p>
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200/80">
            <div className="font-semibold text-slate-900 mb-1">
              Hypothesis C: High Value VIP Concierge
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Deploy priority service routing and dedicated outreach for High Value accounts entering Medium/High churn tiers, measuring protected revenue vs control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
