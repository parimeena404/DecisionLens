'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Database,
  Calendar,
  Menu,
  X,
  LayoutDashboard,
  Users,
  TrendingDown,
  SearchCheck,
  Activity,
} from 'lucide-react';

const ROUTE_NAMES: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Executive Overview',
    subtitle: 'Macro indicators & customer economy',
  },
  '/customers': {
    title: 'Customer Intelligence',
    subtitle: 'RFM segmentation & account explorer',
  },
  '/retention': {
    title: 'Retention & Churn',
    subtitle: 'Temporal cohorts & risk scoring model',
  },
  '/insights': {
    title: 'Insight Investigation',
    subtitle: 'Epistemic evidence synthesis & causal boundaries',
  },
};

const NAV_ITEMS = [
  { name: 'Executive Overview', href: '/', icon: LayoutDashboard },
  { name: 'Customer Intelligence', href: '/customers', icon: Users },
  { name: 'Retention & Churn', href: '/retention', icon: TrendingDown },
  { name: 'Insight Investigation', href: '/insights', icon: SearchCheck },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentRoute = ROUTE_NAMES[pathname] || {
    title: 'Decision Intelligence',
    subtitle: 'Customer analytics workspace',
  };

  return (
    <>
      <header className="h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-all">
        {/* Left: Mobile Toggle + Route Context */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div>
            <h2 className="text-sm font-semibold text-slate-900 leading-tight truncate">
              {currentRoute.title}
            </h2>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {currentRoute.subtitle}
            </p>
          </div>
        </div>

        {/* Right: System Status Badges with Pulse Effects */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Cutoff: <strong className="text-slate-800">2024-09-30</strong></span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>Cohort: <strong className="text-slate-800">5,000 Accounts</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium badge-pulse">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="hidden xs:inline">Zero-Leakage Verified</span>
            <span className="xs:hidden">Verified</span>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 max-w-[80vw] bg-white h-full shadow-2xl p-5 flex flex-col justify-between animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Brand Header */}
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-xs">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">DecisionLens</div>
                  <div className="text-[11px] text-slate-500">Decision Intelligence</div>
                </div>
              </div>

              {/* Nav Links */}
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer Meta */}
            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span>Cutoff</span>
                <span className="text-slate-800">2024-09-30</span>
              </div>
              <div className="flex justify-between">
                <span>Accounts</span>
                <span className="text-slate-800">5,000</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-sans font-medium">
                <span>Status</span>
                <span>Zero-Leakage Verified</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
