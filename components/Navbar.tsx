'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  LayoutDashboard,
  Users,
  TrendingDown,
  SearchCheck,
  Menu,
  X,
  Sun,
  Moon,
  Command,
} from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Customer Intelligence', href: '/customers', icon: Users },
  { name: 'Retention & Churn', href: '/retention', icon: TrendingDown },
  { name: 'Insight Investigation', href: '/insights', icon: SearchCheck },
];

export default function Navbar({ onCmdK }: { onCmdK?: () => void }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 32);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? window.scrollY / total : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onCmdK?.();
      }
    },
    [onCmdK]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const isDark = theme === 'dark';

  return (
    <>
      {/* Scroll progress bar */}
      <div
        className="scroll-progress"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300 border-b',
          scrolled
            ? isDark
              ? 'bg-canvas-dark/80 backdrop-blur-xl border-white/[0.06]'
              : 'bg-canvas/80 backdrop-blur-xl border-black/[0.06]'
            : isDark
            ? 'bg-canvas-dark border-white/[0.04]'
            : 'bg-canvas border-black/[0.04]',
          scrolled ? 'py-2' : 'py-3'
        )}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-accent-400 flex items-center justify-center shadow-glow-sm">
              <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="hidden xs:block">
              <div className={cn('text-sm font-display font-bold tracking-tight', isDark ? 'text-white' : 'text-ink-50')}>
                DecisionLens
              </div>
              <div className={cn('text-[10px] leading-none', isDark ? 'text-ink-700' : 'text-ink-600')}>
                Customer decision intelligence
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 relative">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors',
                    isActive
                      ? isDark
                        ? 'text-white'
                        : 'text-ink-50'
                      : isDark
                      ? 'text-ink-700 hover:text-ink-900'
                      : 'text-ink-600 hover:text-ink-50'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className={cn(
                        'absolute inset-0 rounded-lg',
                        isDark
                          ? 'bg-white/[0.08] border border-white/[0.06]'
                          : 'bg-accent-50 border border-accent-100'
                      )}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" strokeWidth={1.75} />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Cmd+K */}
            <button
              onClick={onCmdK}
              className={cn(
                'hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors border',
                isDark
                  ? 'bg-white/[0.04] border-white/[0.08] text-ink-700 hover:text-ink-900 hover:bg-white/[0.08]'
                  : 'bg-black/[0.03] border-black/[0.06] text-ink-600 hover:text-ink-50 hover:bg-black/[0.06]'
              )}
            >
              <Command className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">⌘K</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggle}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isDark
                  ? 'text-ink-700 hover:text-ink-900 hover:bg-white/[0.06]'
                  : 'text-ink-600 hover:text-ink-50 hover:bg-black/[0.06]'
              )}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                'lg:hidden p-2 rounded-lg transition-colors',
                isDark
                  ? 'text-ink-700 hover:text-ink-900 hover:bg-white/[0.06]'
                  : 'text-ink-600 hover:text-ink-50 hover:bg-black/[0.06]'
              )}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={cn(
                'lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 p-5 flex flex-col justify-between shadow-2xl',
                isDark ? 'bg-canvas-dark' : 'bg-canvas'
              )}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-accent-400 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className={cn('text-sm font-display font-bold', isDark ? 'text-white' : 'text-ink-50')}>
                        DecisionLens
                      </div>
                      <div className={cn('text-[10px]', isDark ? 'text-ink-700' : 'text-ink-600')}>
                        Decision Intelligence
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className={cn('p-1.5 rounded-md', isDark ? 'text-ink-700 hover:bg-white/5' : 'text-ink-600 hover:bg-black/5')}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {NAV_ITEMS.map((item, i) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * i }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                            isActive
                              ? isDark
                                ? 'bg-accent-400/15 text-accent-300'
                                : 'bg-accent-50 text-accent-600'
                              : isDark
                              ? 'text-ink-700 hover:text-white hover:bg-white/[0.04]'
                              : 'text-ink-600 hover:text-ink-50 hover:bg-black/[0.04]'
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          {item.name}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className={cn('text-[11px] space-y-1.5 font-mono pt-4 border-t', isDark ? 'border-white/[0.06] text-ink-600' : 'border-black/[0.06] text-ink-500')}>
                <div className="flex justify-between">
                  <span>Cutoff</span>
                  <span className={isDark ? 'text-ink-800' : 'text-ink-400'}>2024-09-30</span>
                </div>
                <div className="flex justify-between">
                  <span>Accounts</span>
                  <span className={isDark ? 'text-ink-800' : 'text-ink-400'}>5,000</span>
                </div>
                <div className="flex justify-between text-risk-low font-body font-medium">
                  <span>Leakage</span>
                  <span>None verified</span>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
