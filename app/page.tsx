import React from 'react';
import Link from 'next/link';
import { getOverviewMetrics, getRFMSummary } from '@/lib/data';
import HeroLens from '@/components/HeroLens';
import OverviewCharts from '@/components/OverviewCharts';
import DecisionSignals from '@/components/DecisionSignals';
import EpistemicFlow from '@/components/EpistemicFlow';
import CountUp from '@/components/ui/CountUp';
import {
  Coins,
  Users,
  Receipt,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function OverviewPage() {
  const metrics = getOverviewMetrics();
  const segments = getRFMSummary();

  return (
    <div className="space-y-12 pb-12">
      {/* 1. HERO SECTION WITH SIGNATURE LENS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2 sm:pt-4">
        {/* Left Column: Mission & Strategic Overview */}
        <div className="lg:col-span-7 space-y-6">
          {/* Status Verification Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium badge-verified">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Leakage Verified</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-ink-600">
              <Calendar className="w-3.5 h-3.5 text-accent-400" />
              <span>Observation Cutoff: 2024-09-30</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-ink-600">
              <span>Cohort: 5,000 Accounts</span>
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight leading-[1.15]">
              Customer Decision <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-accent-400 via-purple-300 to-teal-300 bg-clip-text text-transparent">
                Intelligence Platform
              </span>
            </h1>
            <p className="text-sm sm:text-base text-ink-600 max-w-2xl leading-relaxed">
              Synthesis of empirical customer behavior, cohort retention dynamics, predictive churn scoring, and epistemic evidence boundaries for decision support.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent-400 hover:bg-accent-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-accent-400/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Explore Evidence Board</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/customers"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] text-xs sm:text-sm font-medium transition-all"
            >
              <Users className="w-4 h-4 text-teal-400" />
              <span>Inspect 5,000 Accounts</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Signature Hero Lens Animation */}
        <div className="lg:col-span-5">
          <HeroLens />
        </div>
      </section>

      {/* 2. BUSINESS SNAPSHOT - 4 COUNT-UP KPI CARDS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest font-mono text-accent-400 font-semibold">
              Executive Telemetry
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-display">
              Business Snapshot (Observation Window)
            </h2>
          </div>
          <span className="text-xs text-ink-600 font-mono">
            Cutoff: 2024-09-30
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Net Revenue */}
          <div className="rounded-xl border border-white/10 p-5 bg-white/[0.03] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-ink-600 uppercase tracking-wider">
                  Total Net Revenue
                </span>
                <div className="w-8 h-8 rounded-lg bg-accent-400/10 text-accent-400 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white flex items-baseline gap-1">
                <CountUp value={8.89} prefix="₹" suffix="M" decimals={2} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-ink-600">
              <span>Gross evaluated receipts</span>
              <span className="font-mono text-ink-800">₹8,887,921</span>
            </div>
          </div>

          {/* KPI 2: Active Customer Base */}
          <div className="rounded-xl border border-white/10 p-5 bg-white/[0.03] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-ink-600 uppercase tracking-wider">
                  Active Customer Base
                </span>
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
                <CountUp value={metrics.totalCustomers} decimals={0} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-ink-600">
              <span>Unique buyer accounts</span>
              <span className="font-mono text-teal-400 font-medium">100% evaluated</span>
            </div>
          </div>

          {/* KPI 3: Completed Transactions */}
          <div className="rounded-xl border border-white/10 p-5 bg-white/[0.03] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-ink-600 uppercase tracking-wider">
                  Completed Transactions
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
                <CountUp value={metrics.totalOrders} decimals={0} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-ink-600">
              <span>Order distribution</span>
              <span className="font-mono text-ink-800">avg 3.8 orders/buyer</span>
            </div>
          </div>

          {/* KPI 4: Overall AOV */}
          <div className="rounded-xl border border-white/10 p-5 bg-white/[0.03] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-ink-600 uppercase tracking-wider">
                  Overall AOV
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
                <CountUp value={metrics.overallAOV} prefix="₹" decimals={2} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-ink-600">
              <span>Basket size per purchase</span>
              <span className="font-mono text-ink-800">19 SKUs portfolio</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CHARTS & RFM TABLE */}
      <section>
        <OverviewCharts segments={segments} />
      </section>

      {/* 4. DECISION SIGNALS (4 FLIP/EXPAND CARDS) */}
      <section>
        <DecisionSignals />
      </section>

      {/* 5. EPISTEMIC DISTINCTION (3-STEP FLOW) */}
      <section>
        <EpistemicFlow />
      </section>
    </div>
  );
}
