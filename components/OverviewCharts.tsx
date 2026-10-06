'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RFMSegmentSummary } from '@/lib/data';
import { SEGMENT_COLORS, cn, formatCurrency } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { ArrowUpRight, ArrowUpDown } from 'lucide-react';

interface Props {
  segments: RFMSegmentSummary[];
}

export default function OverviewCharts({ segments }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [sortField, setSortField] = useState<keyof RFMSegmentSummary>('revenue_share_pct');
  const [sortAsc, setSortAsc] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const sortedSegments = [...segments].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return 0;
  });

  const handleSort = (field: keyof RFMSegmentSummary) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Prepare data for donut chart
  const donutData = segments.map((s) => ({
    name: s.segment,
    value: s.total_revenue,
    pct: s.revenue_share_pct,
    count: s.customer_count,
    color: SEGMENT_COLORS[s.segment] || '#8A8FA8',
  }));

  return (
    <div className="space-y-8">
      {/* Upper Charts Row: Paired Bars vs Net Revenue Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Customer Share vs Revenue Share */}
        <div
          className={cn(
            'p-6 rounded-2xl border flex flex-col justify-between transition-colors',
            isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200/80 shadow-sm'
          )}
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display font-bold text-base">
                Customer Share vs Revenue Share
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10 text-ink-600">
                RFM Distribution
              </span>
            </div>
            <p className={cn('text-xs mb-6', isDark ? 'text-ink-600' : 'text-slate-600')}>
              Disproportionate revenue concentration across the 6 empirical behavioral segments.
            </p>

            <div className="space-y-4">
              {segments.map((seg) => {
                const color = SEGMENT_COLORS[seg.segment] || '#8A8FA8';
                return (
                  <div key={seg.segment} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-medium">{seg.segment}</span>
                      </div>
                      <div className="flex items-center gap-4 font-mono text-[11px]">
                        <span className={isDark ? 'text-ink-600' : 'text-slate-500'}>
                          Accounts: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{seg.customer_share_pct.toFixed(1)}%</strong>
                        </span>
                        <span className={isDark ? 'text-ink-600' : 'text-slate-500'}>
                          Revenue:{' '}
                          <strong style={{ color }}>{seg.revenue_share_pct.toFixed(1)}%</strong>
                        </span>
                      </div>
                    </div>

                    {/* Dual horizontal progress bar */}
                    <div className="space-y-1">
                      {/* Customer Share bar */}
                      <div
                        className={cn(
                          'w-full h-1.5 rounded-full overflow-hidden',
                          isDark ? 'bg-white/5' : 'bg-slate-100'
                        )}
                        title={`Accounts: ${seg.customer_share_pct.toFixed(1)}%`}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.min(seg.customer_share_pct, 100)}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={cn('h-full rounded-full', isDark ? 'bg-white/20' : 'bg-slate-400')}
                        />
                      </div>
                      {/* Revenue Share bar */}
                      <div
                        className={cn(
                          'w-full h-2 rounded-full overflow-hidden',
                          isDark ? 'bg-white/5' : 'bg-slate-100'
                        )}
                        title={`Revenue: ${seg.revenue_share_pct.toFixed(1)}%`}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.min(seg.revenue_share_pct, 100)}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className={cn(
              'mt-6 pt-3 border-t flex items-center justify-between text-[11px]',
              isDark ? 'border-white/5 text-ink-600' : 'border-slate-100 text-slate-500'
            )}
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className={cn('w-2 h-2 rounded-full', isDark ? 'bg-white/20' : 'bg-slate-400')} />
                Accounts %
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent-400" />
                Revenue %
              </span>
            </div>
            <span className="font-mono">Top Segment: 50.55% Net Revenue</span>
          </div>
        </div>

        {/* Chart 2: Net Revenue by Segment Donut */}
        <div
          className={cn(
            'p-6 rounded-2xl border flex flex-col justify-between transition-colors',
            isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200/80 shadow-sm'
          )}
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display font-bold text-base">
                Net Revenue by Segment
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10 text-ink-600">
                ₹8,887,921 Total
              </span>
            </div>
            <p className={cn('text-xs mb-4', isDark ? 'text-ink-600' : 'text-slate-600')}>
              Interactive monetary contribution per behavioral cluster.
            </p>

            <div className="relative h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={(data) => setHoveredSegment(data.name)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  >
                    {donutData.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={entry.color}
                        stroke={isDark ? '#0E1030' : '#FFFFFF'}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div
                            className={cn(
                              'p-3 rounded-lg shadow-xl border text-xs',
                              isDark ? 'bg-[#151736] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: data.color }}
                              />
                              <strong className="font-semibold">{data.name}</strong>
                            </div>
                            <div className="font-mono text-accent-400 font-bold">
                              ₹{data.value.toLocaleString()}
                            </div>
                            <div className="text-[11px] text-ink-600 mt-0.5 font-mono">
                              {data.pct.toFixed(2)}% share • {data.count} accounts
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Central Donut Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-ink-600">
                  Key Dynamic
                </span>
                <span className="font-display font-bold text-sm text-accent-300 max-w-[150px] leading-tight mt-0.5">
                  High Value yields 50.55%
                </span>
                <span className="text-[10px] font-mono text-ink-600 mt-0.5">
                  1,053 accounts
                </span>
              </div>
            </div>
          </div>

          <div
            className={cn(
              'mt-4 pt-3 border-t grid grid-cols-3 gap-2 text-center text-[10px]',
              isDark ? 'border-white/5' : 'border-slate-100'
            )}
          >
            <div>
              <span className="text-ink-600 block">High Value</span>
              <span className="font-mono font-bold text-purple-400">₹4.49M (50.6%)</span>
            </div>
            <div>
              <span className="text-ink-600 block">Loyal</span>
              <span className="font-mono font-bold text-teal-400">₹2.14M (24.1%)</span>
            </div>
            <div>
              <span className="text-ink-600 block">Other 4 Segments</span>
              <span className="font-mono font-bold text-amber-400">₹2.25M (25.3%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* RFM Segment Summary Table */}
      <div
        className={cn(
          'p-6 rounded-2xl border transition-colors',
          isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200/80 shadow-sm'
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-display font-bold text-base">
              RFM Segmentation Baseline Table
            </h3>
            <p className={cn('text-xs mt-0.5', isDark ? 'text-ink-600' : 'text-slate-600')}>
              Click column headers to sort. Select any row to inspect segment cohort in Customer Intelligence.
            </p>
          </div>
          <span className="text-xs text-ink-600 font-mono">
            6 Segments • 5,000 Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr
                className={cn(
                  'border-b text-[11px] uppercase tracking-wider',
                  isDark ? 'border-white/10 text-ink-600' : 'border-slate-200 text-slate-500'
                )}
              >
                <th
                  onClick={() => handleSort('segment')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>RFM Segment</span>
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('customer_count')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Accounts</span>
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('customer_share_pct')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Account Share %</span>
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('revenue_share_pct')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Revenue Share %</span>
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('total_revenue')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Total Net Revenue (₹)</span>
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('avg_aov')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Mean AOV (₹)</span>
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {sortedSegments.map((row) => {
                const color = SEGMENT_COLORS[row.segment] || '#8A8FA8';
                return (
                  <tr
                    key={row.segment}
                    className={cn(
                      'group transition-colors',
                      isDark ? 'hover:bg-white/5 border-white/5' : 'hover:bg-slate-50 border-slate-100'
                    )}
                  >
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-semibold">{row.segment}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono">
                      {row.customer_count.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono">
                      {row.customer_share_pct.toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-semibold" style={{ color }}>
                      {row.revenue_share_pct.toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-medium">
                      ₹{row.total_revenue.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono">
                      ₹{row.avg_aov.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <Link
                        href={`/customers?segment=${encodeURIComponent(row.segment)}`}
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors border',
                          isDark
                            ? 'border-white/10 hover:border-accent-400 hover:text-accent-300 bg-white/[0.02]'
                            : 'border-slate-200 hover:border-accent-400 hover:text-accent-600 bg-slate-50'
                        )}
                      >
                        <span>Filter</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
