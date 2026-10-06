'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  TrendingDown, 
  SearchCheck, 
  Database,
  Layers
} from 'lucide-react';

const navItems = [
  {
    name: 'Overview',
    href: '/',
    icon: LayoutDashboard,
    description: 'Executive KPIs & Segment Health',
  },
  {
    name: 'Customer Intelligence',
    href: '/customers',
    icon: Users,
    description: 'RFM Behaviors & Directory',
  },
  {
    name: 'Retention & Churn',
    href: '/retention',
    icon: TrendingDown,
    description: 'Cohort Decay & Risk Scoring',
  },
  {
    name: 'Insight Investigation',
    href: '/insights',
    icon: SearchCheck,
    description: 'Evidence Table & Causality',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-white tracking-tight">
              DecisionLens
            </h1>
            <p className="text-xs text-slate-400 font-medium">Customer Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1.5">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Core Analytics
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-start gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <div className="leading-snug">
                <div>{item.name}</div>
                <div className={`text-[11px] font-normal ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                  {item.description}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Metadata Card in Footer */}
      <div className="p-4 m-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
        <div className="flex items-center gap-1.5 text-blue-400 font-medium mb-1.5">
          <Database className="w-3.5 h-3.5" />
          <span>Pipeline Status</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Cutoff Date: <span className="text-slate-200 font-mono">2024-09-30</span><br />
          Target Window: <span className="text-slate-200 font-mono">Q4 2024</span><br />
          Data Leakage: <span className="text-emerald-400 font-medium">Zero (Verified)</span>
        </p>
      </div>

      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
        Vercel-Ready · DecisionLens v2.0
      </div>
    </aside>
  );
}
