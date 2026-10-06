import React from 'react';
import { getOverviewMetrics, getRFMSummary } from '@/lib/data';
import OverviewCharts from '@/components/OverviewCharts';
import { Users, DollarSign, ShoppingBag, CreditCard, ArrowUpRight, AlertTriangle, Clock } from 'lucide-react';

export default function OverviewPage() {
  const metrics = getOverviewMetrics();
  const segments = getRFMSummary();

  return (
    <div className="space-y-8">
      {/* Page Title & Intro */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          Macro indicators of customer base volume, revenue contribution, and core empirical observations.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Customers</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{metrics.totalCustomers.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Synthetic FMCG Base</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Net Revenue</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">₹{(metrics.totalRevenue / 1000000).toFixed(2)}M</p>
            <p className="text-[11px] text-slate-400 mt-0.5">₹{metrics.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Overall AOV</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">₹{metrics.overallAOV.toFixed(2)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Per Transaction Average</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Completed Orders</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{metrics.totalOrders.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Across 19 Product SKUs</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <OverviewCharts segments={segments} />

      {/* Segment Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">RFM Segment Breakdown Table</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Key distribution and spend metrics per behavioral segment
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Segment</th>
                <th className="px-6 py-3 text-right">Customers</th>
                <th className="px-6 py-3 text-right">Customer Share</th>
                <th className="px-6 py-3 text-right">Revenue Share</th>
                <th className="px-6 py-3 text-right">Total Revenue (₹)</th>
                <th className="px-6 py-3 text-right">Avg AOV (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {segments.map((s) => (
                <tr key={s.segment} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-slate-900">{s.segment}</td>
                  <td className="px-6 py-3.5 text-right">{s.customer_count.toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-right">{s.customer_share_pct.toFixed(2)}%</td>
                  <td className="px-6 py-3.5 text-right font-semibold text-blue-600">
                    {s.revenue_share_pct.toFixed(2)}%
                  </td>
                  <td className="px-6 py-3.5 text-right">₹{s.total_revenue.toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-right">₹{s.avg_aov.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3 Important Business Insights */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-1">
          3 Important Business Insights
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Core evidence-based findings derived strictly from the analytical pipeline (associations, not causal claims):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Insight 1 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Strong Evidence
                </span>
                <span className="text-xs font-medium text-slate-400">Insight #1</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Revenue Concentration Risk
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The <b>High Value</b> segment accounts for <b>50.55%</b> of all observed revenue, despite comprising just <b>21.06%</b> of customer accounts (1,053 buyers).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Analytical Note:</span> Extreme dependence on top quartile spenders indicates high exposure to high-value churn.
            </div>
          </div>

          {/* Insight 2 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                  Moderate Evidence
                </span>
                <span className="text-xs font-medium text-slate-400">Insight #2</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Recency Signals Inactivity
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Purchase <b>recency</b> is the single strongest predictor of future inactivity with a standardized logistic coefficient of <b>+0.5453</b>, far exceeding monetary volume.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Analytical Note:</span> Re-engagement interventions should trigger upon early idle days (60-90 days) rather than waiting for dormancy.
            </div>
          </div>

          {/* Insight 3 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Strong Evidence
                </span>
                <span className="text-xs font-medium text-slate-400">Insight #5</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Cohort Retention Decay
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                6-month cohort retention drops to an average of <b>26.2%</b> across all cohorts, with the earliest cohort (2023-01) demonstrating the strongest stickiness at <b>36.7%</b>.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Analytical Note:</span> Retention drops steepest in Months 1-3 post-acquisition, pointing to the critical onboarding window.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
