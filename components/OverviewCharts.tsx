'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { RFMSegmentSummary } from '@/lib/data';

const SEGMENT_COLORS: Record<string, string> = {
  'High Value': '#2563eb',
  'Loyal': '#0d9488',
  'Growing': '#10b981',
  'Occasional': '#f59e0b',
  'At Risk': '#ef4444',
  'Low Engagement': '#64748b',
};

export default function OverviewCharts({ segments }: { segments: RFMSegmentSummary[] }) {
  const pieData = segments.map(s => ({
    name: s.segment,
    value: s.customer_count,
    color: SEGMENT_COLORS[s.segment] || '#3b82f6',
  }));

  const revenueData = [...segments]
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .map(s => ({
      segment: s.segment,
      revenue: Math.round(s.total_revenue),
      color: SEGMENT_COLORS[s.segment] || '#3b82f6',
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Customer Count Share Donut */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          Customer Share by Segment
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Proportional split of the 5,000 synthetic FMCG customer accounts
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [`${Number(value).toLocaleString()} customers`, 'Base']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs text-slate-600">
          {pieData.map(item => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by Segment Bar */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          Total Net Revenue by Segment (₹)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Cumulative spend contribution across behavioral RFM cohorts
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} margin={{ top: 10, right: 20, left: 20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="segment" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `₹${(val / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Net Spend']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {revenueData.map((entry, idx) => (
                  <Cell key={`bar-${idx}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
