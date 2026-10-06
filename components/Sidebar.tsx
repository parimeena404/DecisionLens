'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  TrendingDown,
  SearchCheck,
  Activity,
  Database,
} from 'lucide-react';

const navItems = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Customer intelligence', href: '/customers', icon: Users },
  { name: 'Retention & churn', href: '/retention', icon: TrendingDown },
  { name: 'Insight investigation', href: '/insights', icon: SearchCheck },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-60 flex-col bg-surface-0 border-r border-ink-100 min-h-screen shrink-0 select-none">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-accent-600 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-sm font-semibold text-ink-900 tracking-tight leading-none">
              DecisionLens
            </div>
            <div className="text-2xs text-ink-400 mt-0.5">
              Customer decision intelligence
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        <div className="px-2 pb-1.5 text-2xs font-medium text-ink-300 uppercase tracking-widest">
          Analysis
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-2.5 px-2.5 py-2 rounded text-[13px] font-medium
                transition-colors duration-100
                ${isActive
                  ? 'bg-accent-50 text-accent-700'
                  : 'text-ink-500 hover:text-ink-800 hover:bg-surface-1'
                }
              `}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent-600' : 'text-ink-300'}`} strokeWidth={1.75} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Status Footer */}
      <div className="px-5 py-4 border-t border-ink-50">
        <div className="space-y-2 text-2xs text-ink-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-ink-300" />
              Pipeline
            </span>
            <span className="text-ink-600 font-medium">Complete</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Observation cutoff</span>
            <span className="font-mono text-ink-600">2024-09-30</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Target window</span>
            <span className="font-mono text-ink-600">Q4 2024</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Data leakage</span>
            <span className="text-risk-low font-medium">None verified</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
