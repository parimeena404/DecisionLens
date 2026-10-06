import React from 'react';
import { getOverviewMetrics, getRFMSummary } from '@/lib/data';
import OverviewCharts from '@/components/OverviewCharts';
import Link from 'next/link';
import {
  Users,
  Coins,
  Receipt,
  ShoppingCart,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  Layers,
  HelpCircle,
} from 'lucide-react';

export default function OverviewPage() {
  const metrics = getOverviewMetrics();
  const segments = getRFMSummary();

  return (
    <div className="space-y-8">
      {/* 1. Executive Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Customer Decision Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Synthesis of empirical customer behavior, cohort retention dynamics, predictive churn scoring, and epistemic evidence boundaries for decision support.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <Link
              href="/insights"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <span>Explore Evidence Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Business Snapshot - 4 Refined KPI Modules */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Business Snapshot (Observation Window)
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">Cutoff: 2024-09-30</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1 */}
          <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Net Revenue
              </span>
              <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              ₹{(metrics.totalRevenue / 1000000).toFixed(2)}M
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Gross transaction total</span>
              <span className="font-mono text-slate-700">₹{metrics.totalRevenue.toLocaleString()}</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Active Customer Base
              </span>
              <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {metrics.totalCustomers.toLocaleString()}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Unique buyer accounts</span>
              <span className="font-mono text-slate-700">100% evaluated</span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Completed Transactions
              </span>
              <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {metrics.totalOrders.toLocaleString()}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Avg 3.8 orders / buyer</span>
              <span className="font-mono text-slate-700">19 SKUs</span>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Overall AOV
              </span>
              <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              ₹{metrics.overallAOV.toFixed(2)}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Mean basket value</span>
              <span className="font-mono text-slate-700">₹654.40 mean</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Customer Economy - RFM Concentration & Breakdown */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Customer Economy & Value Distribution
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Behavioral segmentation reveals heavy revenue concentration within the top quartile of customer accounts.
          </p>
        </div>

        {/* Dual Chart Visualization */}
        <OverviewCharts segments={segments} />

        {/* Dense Analytical Segment Breakdown Table */}
        <div className="bg-white rounded-lg border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              RFM Segment Structure & Revenue Capture
            </h3>
            <span className="text-[11px] text-slate-500">
              6 Mutually Exclusive Behavioral Segments
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Segment Name</th>
                  <th className="px-5 py-3 text-right">Customer Count</th>
                  <th className="px-5 py-3 text-right">Customer Share</th>
                  <th className="px-5 py-3 text-right">Revenue Share</th>
                  <th className="px-5 py-3 text-right">Total Net Revenue (₹)</th>
                  <th className="px-5 py-3 text-right">Average AOV (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {segments.map((s) => (
                  <tr key={s.segment} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3 font-sans font-medium text-slate-900">
                      {s.segment}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-700">
                      {s.customer_count.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-600">
                      {s.customer_share_pct.toFixed(2)}%
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-blue-700">
                      {s.revenue_share_pct.toFixed(2)}%
                    </td>
                    <td className="px-5 py-3 text-right text-slate-800">
                      ₹{s.total_revenue.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-700">
                      ₹{s.avg_aov.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Decision Signals - 4 High-Value Analytical Signals */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Decision Signals from the Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Key empirical patterns identified in historical records to prioritize team interventions:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Signal 1 */}
          <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Strong Evidence
                </span>
                <span className="text-[11px] font-mono text-slate-400">#01</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                Revenue Concentration Risk
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The <strong>High Value</strong> segment produces <strong>50.55%</strong> of all revenue from just <strong>21.06%</strong> of customer accounts (1,053 buyers).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <strong className="text-slate-700">Implication:</strong> Churn mitigation must prioritize high-tier accounts where unit loss impact is severe.
            </div>
          </div>

          {/* Signal 2 */}
          <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  Model Driver
                </span>
                <span className="text-[11px] font-mono text-slate-400">#02</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                Recency Dominates Churn Risk
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Elapsed days since last purchase is the strongest positive predictor of churn (<strong className="font-mono text-slate-800">+0.89</strong> standardized coefficient).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <strong className="text-slate-700">Implication:</strong> Inactivity velocity is the earliest operational trigger for automated engagement.
            </div>
          </div>

          {/* Signal 3 */}
          <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Cohort Decay
                </span>
                <span className="text-[11px] font-mono text-slate-400">#03</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                First-Month Retention Cliff
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cohorts experience their sharpest attrition between Month 0 and Month 1, before stabilizing into a steady repeat purchase decay curve.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <strong className="text-slate-700">Implication:</strong> Onboarding experience and immediate second-order incentives dictate long-term LTV.
            </div>
          </div>

          {/* Signal 4 */}
          <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                  Intervention Pool
                </span>
                <span className="text-[11px] font-mono text-slate-400">#04</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                High Risk Segment Size
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>12.9%</strong> of evaluated accounts (645 customers) exceed the high-risk churn probability threshold (<strong className="font-mono text-slate-800">&gt;0.70</strong>).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <strong className="text-slate-700">Implication:</strong> A targeted, size-constrained cohort is immediately actionable for marketing winback.
            </div>
          </div>
        </div>
      </div>

      {/* 5. Executive Takeaway: Epistemic Boundary Layer */}
      <div className="bg-slate-900 text-slate-100 rounded-lg p-6 shadow-xs border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Epistemic Distinction: What the Data Actually Tells Us
          </h2>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
          DecisionLens enforces strict epistemic distinctions to prevent strategic errors caused by confusing statistical association with operational causality:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-800">
          <div className="p-3.5 rounded-md bg-slate-800/80 border border-slate-700/60">
            <div className="text-xs font-semibold text-blue-300 mb-1">
              1. Association (Observed)
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Higher discount usage coincides with lower average AOV and higher churn probability. This is an observed statistical covariance in past transaction logs.
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-slate-800/80 border border-slate-700/60">
            <div className="text-xs font-semibold text-indigo-300 mb-1">
              2. Prediction (Forecasted)
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              A regularized Logistic Regression classifies 1,000 holdout accounts with ROC-AUC 0.705. It provides a risk-ordered queue, not an explanation of intent.
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-slate-800/80 border border-slate-700/60">
            <div className="text-xs font-semibold text-rose-300 mb-1">
              3. Causation (Requires Experiment)
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              We do <em>not</em> claim eliminating discounts will increase retention. Causal claims require randomized controlled holdouts (A/B testing) before policy changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
