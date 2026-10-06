'use client';

import React from 'react';
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
  LineChart,
  Line,
} from 'recharts';
import { ShieldCheck, HelpCircle, Activity, Award, Target, GitCompare } from 'lucide-react';

interface Props {
  metrics: ChurnMetrics;
  featureImportance: FeatureImportance[];
  riskTierCounts: { name: string; value: number }[];
  cohortMatrix: CohortRow[];
  decayCurve: { monthOffset: number; retention: number }[];
}

const TIER_COLORS: Record<string, string> = {
  'Low Risk': '#10b981',
  'Medium Risk': '#f59e0b',
  'High Risk': '#ef4444',
};

export default function RetentionChurnView({
  metrics,
  featureImportance,
  riskTierCounts,
  cohortMatrix,
  decayCurve,
}: Props) {
  // Sort features by absolute coefficient
  const sortedFeatures = [...featureImportance].sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient));

  // Prepare horizontal bar chart data
  const featChartData = [...featureImportance]
    .sort((a, b) => a.coefficient - b.coefficient)
    .map((f) => ({
      feature: f.feature,
      coefficient: f.coefficient,
      fill: f.coefficient > 0 ? '#ef4444' : '#10b981',
    }));

  const cm = metrics.confusion_matrix;

  // Selected cohort columns (M0 to M12)
  const displayMonths = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  return (
    <div className="space-y-8">
      {/* Temporal Zero Leakage Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <span className="font-semibold text-blue-950">Strict Zero-Leakage Temporal Design: </span>
          Historical features are calculated exclusively using transactions prior to the <b>2024-09-30</b> cutoff date.
          The churn target evaluates activity strictly in <b>Q4 2024 (Oct 1 – Dec 31, 2024)</b>. No future information leaked into model training.
        </div>
      </div>

      {/* 1. Cohort Retention Analytics */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            1. Monthly Cohort Retention Analysis
          </h2>
          <p className="text-xs text-slate-500">
            Tracking repeat transaction persistence across monthly acquisition cohorts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Average Decay Curve */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Average Cohort Retention Decay Curve
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Mean % of customers retaining by months since acquisition
              </p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={decayCurve} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="monthOffset" tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Months Offset', position: 'insideBottom', offset: -10, fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Mean Retention']}
                      labelFormatter={(lbl) => `Month +${lbl}`}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="retention"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#2563eb' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
              <b>Key Takeaway:</b> Retention drops sharply after Month 0, stabilizing around <b>26.2%</b> by Month 6.
            </div>
          </div>

          {/* Cohort Matrix Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">
                Cohort Retention Matrix (%)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Proportion of cohort active in month offset M+0 to M+12
              </p>
            </div>
            <div className="overflow-x-auto flex-1 max-h-[320px]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">Cohort</th>
                    {displayMonths.map((m) => (
                      <th key={m} className="px-2 py-2 text-center">+{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cohortMatrix.slice(0, 12).map((row) => (
                    <tr key={row.cohort_month} className="hover:bg-slate-50/70">
                      <td className="px-3 py-2 font-medium text-slate-900 whitespace-nowrap">
                        {row.cohort_month}
                      </td>
                      {displayMonths.map((m) => {
                        const valStr = row[m];
                        const val = valStr !== '' && valStr !== undefined ? parseFloat(String(valStr)) : null;
                        let bgStyle = 'bg-transparent text-slate-400';
                        if (val !== null) {
                          if (val >= 80) bgStyle = 'bg-blue-600 text-white font-semibold';
                          else if (val >= 35) bgStyle = 'bg-blue-100 text-blue-900 font-medium';
                          else if (val >= 25) bgStyle = 'bg-blue-50 text-blue-800';
                          else bgStyle = 'text-slate-600';
                        }
                        return (
                          <td key={m} className={`px-2 py-2 text-center rounded-sm ${bgStyle}`}>
                            {val !== null ? `${val.toFixed(0)}%` : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* 2. Churn Risk Distribution & Predictive Metrics */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            2. Churn Risk Distribution & Model Metrics
          </h2>
          <p className="text-xs text-slate-500">
            Calibrated Logistic Regression risk tiers and holdout test set performance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Tier Donut */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Customer Risk Tier Proportions
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Tier breakdown based on predicted inactivity probability
            </p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskTierCounts}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {riskTierCounts.map((entry) => (
                      <Cell key={entry.name} fill={TIER_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toLocaleString()} accounts`, 'Count']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Low Risk (p &lt; 0.40)
                </span>
                <span className="font-semibold text-slate-800">{riskTierCounts[0]?.value.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Medium Risk (0.40 - 0.65)
                </span>
                <span className="font-semibold text-slate-800">{riskTierCounts[1]?.value.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  High Risk (p &gt; 0.65)
                </span>
                <span className="font-semibold text-slate-800">{riskTierCounts[2]?.value.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Model Metrics & Confusion Matrix */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Holdout Test Set Performance (N = {metrics.test_size})
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Trained on 3,955 historical profiles; evaluated on 989 held-out test accounts
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                  <div className="text-[11px] font-medium text-slate-500 uppercase">ROC-AUC</div>
                  <div className="text-xl font-bold text-blue-600 mt-1">{metrics.roc_auc.toFixed(3)}</div>
                  <div className="text-[10px] text-slate-400">Discriminatory Power</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                  <div className="text-[11px] font-medium text-slate-500 uppercase">Recall</div>
                  <div className="text-xl font-bold text-emerald-600 mt-1">{(metrics.recall * 100).toFixed(1)}%</div>
                  <div className="text-[10px] text-slate-400">Churners Caught</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                  <div className="text-[11px] font-medium text-slate-500 uppercase">Precision</div>
                  <div className="text-xl font-bold text-indigo-600 mt-1">{(metrics.precision * 100).toFixed(1)}%</div>
                  <div className="text-[10px] text-slate-400">Accuracy of Alert</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                  <div className="text-[11px] font-medium text-slate-500 uppercase">F1-Score</div>
                  <div className="text-xl font-bold text-slate-800 mt-1">{metrics.f1.toFixed(3)}</div>
                  <div className="text-[10px] text-slate-400">Harmonic Balance</div>
                </div>
              </div>
            </div>

            {/* Confusion Matrix Visual */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Confusion Matrix Quadrants
              </h4>
              <div className="grid grid-cols-2 gap-3 max-w-md text-xs">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                  <div className="font-semibold text-emerald-800">True Active (TN)</div>
                  <div className="text-lg font-bold text-emerald-900 mt-0.5">{cm[0][0]}</div>
                  <div className="text-[10px] text-emerald-700">Correctly labeled active</div>
                </div>
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                  <div className="font-semibold text-amber-800">False Inactive (FP)</div>
                  <div className="text-lg font-bold text-amber-900 mt-0.5">{cm[0][1]}</div>
                  <div className="text-[10px] text-amber-700">Active flagged as inactive</div>
                </div>
                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg">
                  <div className="font-semibold text-rose-800">False Active (FN)</div>
                  <div className="text-lg font-bold text-rose-900 mt-0.5">{cm[1][0]}</div>
                  <div className="text-[10px] text-rose-700">Inactive missed by model</div>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                  <div className="font-semibold text-emerald-800">True Inactive (TP)</div>
                  <div className="text-lg font-bold text-emerald-900 mt-0.5">{cm[1][1]}</div>
                  <div className="text-[10px] text-emerald-700">Inactive correctly flagged</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* 3. Feature Importance & Direction */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            3. Model Feature Importance & Statistical Direction
          </h2>
          <p className="text-xs text-slate-500">
            Standardized Logistic Regression coefficients and empirical directional effects
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Standardized Coefficients
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Red bars increase inactivity risk; green bars decrease it
            </p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featChartData} layout="vertical" margin={{ top: 10, right: 20, left: 60, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} domain={[-0.6, 0.6]} />
                  <YAxis type="category" dataKey="feature" tick={{ fontSize: 11, fill: '#334155' }} />
                  <Tooltip
                    formatter={(val: any) => [Number(val).toFixed(4), 'Std Coefficient']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="coefficient">
                    {featChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Directional Explanation Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">
                Directional Interpretation
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Plain-English explanation of feature relationships with future inactivity
              </p>
            </div>
            <div className="overflow-x-auto flex-1 max-h-[340px]">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Feature</th>
                    <th className="px-4 py-3 text-right">Coefficient</th>
                    <th className="px-4 py-3">Statistical Direction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedFeatures.map((f) => {
                    const isRisk = f.coefficient > 0;
                    return (
                      <tr key={f.feature} className="hover:bg-slate-50/80">
                        <td className="px-4 py-2.5 font-mono font-medium text-slate-900">{f.feature}</td>
                        <td className={`px-4 py-2.5 text-right font-mono font-semibold ${isRisk ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {f.coefficient > 0 ? `+${f.coefficient.toFixed(4)}` : f.coefficient.toFixed(4)}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${isRisk ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {f.direction}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
