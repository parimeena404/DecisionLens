'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { RFMSegmentSummary } from '@/lib/data';

interface Props {
  segments: RFMSegmentSummary[];
}

const SEGMENT_COLORS: Record<string, string> = {
  'High Value': '#2563eb',     // Blue-600
  'Loyal': '#0d9488',          // Teal-600
  'Growing': '#10b981',        // Emerald-500
  'Occasional': '#f59e0b',     // Amber-500
  'At Risk': '#ef4444',        // Rose-500
  'Low Engagement': '#64748b', // Slate-500
};

export default function OverviewCharts({ segments }: Props) {
  // Ordered by revenue share descending
  const sortedByRevenue = [...segments].sort(
    (a, b) => b.revenue_share_pct - a.revenue_share_pct
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Customer Volume vs Revenue Concentration */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Customer Share vs Revenue Share
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison of customer population volume against net revenue generation
            </p>
          </div>
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            RFM Breakdown
          </span>
        </div>

        <div className="space-y-4 pt-1">
          {sortedByRevenue.map((seg) => {
            const color = SEGMENT_COLORS[seg.segment] || '#64748b';
            return (
              <div key={seg.segment} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium text-slate-800">{seg.segment}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-slate-600 font-mono">
                    <span>
                      Cust: <strong className="text-slate-800">{seg.customer_share_pct.toFixed(1)}%</strong>
                    </span>
                    <span>
                      Rev: <strong className="text-blue-700">{seg.revenue_share_pct.toFixed(1)}%</strong>
                    </span>
                  </div>
                </div>

                {/* Dual horizontal progress bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-100 rounded-xs h-1.5 overflow-hidden flex" title={`Customer Share: ${seg.customer_share_pct.toFixed(1)}%`}>
                    <div
                      className="bg-slate-400 h-full rounded-xs transition-all duration-300"
                      style={{ width: `${Math.min(seg.customer_share_pct, 100)}%` }}
                    />
                  </div>
                  <div className="w-full bg-slate-100 rounded-xs h-2 overflow-hidden flex" title={`Revenue Share: ${seg.revenue_share_pct.toFixed(1)}%`}>
                    <div
                      className="h-full rounded-xs transition-all duration-300"
                      style={{
                        width: `${Math.min(seg.revenue_share_pct, 100)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-1.5 bg-slate-400 rounded-xs inline-block" />
            <span>Customer Share (%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-2 bg-blue-600 rounded-xs inline-block" />
            <span>Revenue Share (%)</span>
          </div>
        </div>
      </div>

      {/* 2. Absolute Revenue Contribution by Segment */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                Net Revenue Contribution by Segment (₹)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total monetary value delivered per behavioral cohort
              </p>
            </div>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              ₹12.43M Total
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedByRevenue}
                margin={{ top: 10, right: 10, left: 15, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="segment"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `₹${(val / 1000000).toFixed(1)}M`}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Net Spend']}
                  contentStyle={{
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                />
                <Bar dataKey="total_revenue" radius={[3, 3, 0, 0]}>
                  {sortedByRevenue.map((entry) => (
                    <Cell
                      key={entry.segment}
                      fill={SEGMENT_COLORS[entry.segment] || '#2563eb'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>High Value segment yields 50.55% of all top-line receipts</span>
          <span className="font-mono text-slate-700 font-medium">1,053 Accounts</span>
        </div>
      </div>
    </div>
  );
}
