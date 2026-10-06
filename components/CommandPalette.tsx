'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  LayoutDashboard,
  Users,
  TrendingDown,
  SearchCheck,
  Search,
  Sun,
  Moon,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  const navigate = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          'relative w-full max-w-xl rounded-xl shadow-2xl border overflow-hidden transition-all',
          isDark
            ? 'bg-[#121438] border-white/10 text-ink-900 shadow-purple-950/40'
            : 'bg-white border-black/10 text-ink-300 shadow-slate-400/30'
        )}
      >
        <Command
          className="w-full"
          filter={(value, search) => {
            if (value.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-inherit">
            <Search className="w-5 h-5 text-accent-400 shrink-0" />
            <Command.Input
              autoFocus
              placeholder="Type a command, page name, or account ID..."
              className={cn(
                'w-full bg-transparent text-sm focus:outline-none placeholder:text-ink-600',
                isDark ? 'text-white' : 'text-slate-900'
              )}
            />
            <kbd className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-white/10 text-ink-600">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 space-y-1 text-sm">
            <Command.Empty className="p-4 text-center text-xs text-ink-600">
              No matching pages, accounts, or actions found.
            </Command.Empty>

            {/* Quick Navigation */}
            <Command.Group
              heading="Pages & Dashboards"
              className="text-[11px] font-semibold text-ink-600 px-2 py-1 uppercase tracking-wider"
            >
              <Command.Item
                onSelect={() => navigate('/')}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors',
                  isDark ? 'hover:bg-white/5 hover:text-white' : 'hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 text-accent-400" />
                  <span>Overview Dashboard</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-40" />
              </Command.Item>

              <Command.Item
                onSelect={() => navigate('/customers')}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors',
                  isDark ? 'hover:bg-white/5 hover:text-white' : 'hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-[#22C3A6]" />
                  <span>Customer Intelligence (5,000 Accounts Explorer)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-40" />
              </Command.Item>

              <Command.Item
                onSelect={() => navigate('/retention')}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors',
                  isDark ? 'hover:bg-white/5 hover:text-white' : 'hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingDown className="w-4 h-4 text-[#FF7A59]" />
                  <span>Retention & Churn Dynamics (Cohort Decay & Model)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-40" />
              </Command.Item>

              <Command.Item
                onSelect={() => navigate('/insights')}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors',
                  isDark ? 'hover:bg-white/5 hover:text-white' : 'hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <SearchCheck className="w-4 h-4 text-[#4DA3FF]" />
                  <span>Insight Investigation (7 Empirical Records)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-40" />
              </Command.Item>
            </Command.Group>

            {/* Empirical Records Jump */}
            <Command.Group
              heading="Evidence Records"
              className="text-[11px] font-semibold text-ink-600 px-2 py-1 uppercase tracking-wider pt-2"
            >
              <Command.Item
                onSelect={() => navigate('/insights?record=1')}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors',
                  isDark ? 'hover:bg-white/5 hover:text-white' : 'hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] text-accent-400">#01</span>
                  <span>Revenue Concentration Risk (50.55% from High Value)</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Strong</span>
              </Command.Item>

              <Command.Item
                onSelect={() => navigate('/insights?record=2')}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors',
                  isDark ? 'hover:bg-white/5 hover:text-white' : 'hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] text-accent-400">#02</span>
                  <span>Behaviors Linked to Inactivity (Recency |coef| 0.545)</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">Moderate</span>
              </Command.Item>

              <Command.Item
                onSelect={() => navigate('/insights?record=5')}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors',
                  isDark ? 'hover:bg-white/5 hover:text-white' : 'hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] text-accent-400">#05</span>
                  <span>Retention Decay Curve (First-Month Cliff M0→M1)</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Strong</span>
              </Command.Item>
            </Command.Group>

            {/* Quick Actions */}
            <Command.Group
              heading="Quick Actions"
              className="text-[11px] font-semibold text-ink-600 px-2 py-1 uppercase tracking-wider pt-2"
            >
              <Command.Item
                onSelect={() => {
                  toggle();
                  onOpenChange(false);
                }}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors',
                  isDark ? 'hover:bg-white/5 hover:text-white' : 'hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <div className="flex items-center gap-2.5">
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
                  <span>Switch to {isDark ? 'Light' : 'Dark'} Theme</span>
                </div>
                <kbd className="text-[10px] font-mono opacity-50">Theme</kbd>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div
            className={cn(
              'px-4 py-2 border-t text-[11px] flex items-center justify-between',
              isDark ? 'border-white/5 text-ink-600' : 'border-black/5 text-ink-500'
            )}
          >
            <span>Navigate with ↑↓ • Select with ↵</span>
            <span>ESC to close</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
