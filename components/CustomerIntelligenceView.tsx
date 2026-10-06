'use client';

import React, { useState, useMemo } from 'react';
import { CustomerRow, RFMSegmentSummary } from '@/lib/data';
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
import { Search, Filter, Download, ArrowUpDown } from 'lucide-react';

interface Props {
  customers: CustomerRow[];
  rfmSummary: RFMSegmentSummary[];
}

const SEGMENT_COLORS: Record<string, string> = {
  'High Value': '#2563eb',
  'Loyal': '#0d9488',
  'Growing': '#10b981',
  'Occasional': '#f59e0b',
  'At Risk': '#ef4444',
  'Low Engagement': '#64748b',
};

const RISK_BADGES: Record<string, string> = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function CustomerIntelligenceView({ customers, rfmSummary }: Props) {
  // Filters
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');
  const [selectedRiskTier, setSelectedRiskTier] = useState<string>('ALL');
  const [searchId, setSearchId] = useState<string>('');
  const [minSpend, setMinSpend] = useState<number>(0);
  const [maxSpend, setMaxSpend] = useState<number>(10000);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 50;

  // Filtered dataset
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSegment = selectedSegment === 'ALL' || c.segment === selectedSegment;
      const matchRisk = selectedRiskTier === 'ALL' || c.risk_tier === selectedRiskTier;
      const matchSpend = c.monetary_value >= minSpend && c.monetary_value <= maxSpend;
      const matchSearch =
        searchId.trim() === '' ||
        c.customer_id.toLowerCase().includes(searchId.trim().toLowerCase());
      return matchSegment && matchRisk && matchSpend && matchSearch;
    });
  }, [customers, selectedSegment, selectedRiskTier, minSpend, maxSpend, searchId]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  // CSV Export
  const downloadCsv = () => {
    const headers = [
      'Customer ID',
      'Segment',
      'Risk Tier',
      'Churn Prob',
      'Spend (INR)',
      'Frequency',
      'Recency (Days)',
      'AOV (INR)',
      'Discount Usage',
      'Categories',
      'Tenure (Days)',
    ];
    const rows = filteredCustomers.map((c) => [
      c.customer_id,
      c.segment,
      c.risk_tier,
      c.churn_probability.toFixed(3),
      c.monetary_value.toFixed(2),
      c.frequency,
      c.recency,
      c.average_order_value.toFixed(2),
      (c.discount_usage * 100).toFixed(1) + '%',
      c.category_count,
      c.tenure_days,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `decisionlens_customers_${selectedSegment}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const segmentChartData = rfmSummary.map((s) => ({
    segment: s.segment,
    customers: s.customer_count,
    color: SEGMENT_COLORS[s.segment] || '#3b82f6',
  }));

  const revenueChartData = [...rfmSummary]
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .map((s) => ({
      segment: s.segment,
      revenue: Math.round(s.total_revenue),
      color: SEGMENT_COLORS[s.segment] || '#3b82f6',
    }));

  return (
    <div className="space-y-6">
      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            RFM Segment Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Count of accounts categorized by behavioral recency, frequency & monetary scores
          </p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentChartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="segment" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toLocaleString()} accounts`, 'Customers']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="customers" radius={[4, 4, 0, 0]}>
                  {segmentChartData.map((entry, idx) => (
                    <Cell key={`bar-${idx}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            Revenue by Segment (₹)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Cumulative financial contribution per customer archetype
          </p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="segment" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `₹${(val / 1000000).toFixed(1)}M`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Total Revenue']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {revenueChartData.map((entry, idx) => (
                    <Cell key={`bar-rev-${idx}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Interactive Filters & Controls</span>
          </div>
          <button
            onClick={downloadCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Segment Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">RFM Segment</label>
            <select
              value={selectedSegment}
              onChange={(e) => {
                setSelectedSegment(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            >
              <option value="ALL">All Segments ({customers.length})</option>
              {rfmSummary.map((s) => (
                <option key={s.segment} value={s.segment}>
                  {s.segment} ({s.customer_count})
                </option>
              ))}
            </select>
          </div>

          {/* Churn Risk Tier */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Churn Risk Tier</label>
            <select
              value={selectedRiskTier}
              onChange={(e) => {
                setSelectedRiskTier(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>

          {/* Spend Slider */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
              <span>Min Spend (₹)</span>
              <span>₹{minSpend} - ₹{maxSpend}</span>
            </div>
            <input
              type="range"
              min="0"
              max="8000"
              step="200"
              value={minSpend}
              onChange={(e) => {
                setMinSpend(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Search ID */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Search Customer ID</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. CUST00001"
                value={searchId}
                onChange={(e) => {
                  setSearchId(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs rounded-lg border border-slate-200 pl-8 pr-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Customer Master Records</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredCustomers.length.toLocaleString()} matching customer accounts (Page {currentPage} of {totalPages})
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Customer ID</th>
                <th className="px-4 py-3">Segment</th>
                <th className="px-4 py-3">Risk Tier</th>
                <th className="px-4 py-3 text-right">Churn Prob</th>
                <th className="px-4 py-3 text-right">Total Spend</th>
                <th className="px-4 py-3 text-right">Frequency</th>
                <th className="px-4 py-3 text-right">Recency (Days)</th>
                <th className="px-4 py-3 text-right">AOV (₹)</th>
                <th className="px-4 py-3 text-right">Discount Rate</th>
                <th className="px-4 py-3 text-right">Categories</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRows.map((c) => {
                const badge = RISK_BADGES[c.risk_tier] || 'bg-slate-50 text-slate-600 border-slate-200';
                return (
                  <tr key={c.customer_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">{c.customer_id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{c.segment}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full border ${badge}`}>
                        {c.risk_tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                      {(c.churn_probability * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      ₹{c.monetary_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">{c.frequency}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{c.recency}</td>
                    <td className="px-4 py-3 text-right text-slate-700">₹{c.average_order_value.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{(c.discount_usage * 100).toFixed(0)}%</td>
                    <td className="px-4 py-3 text-right text-slate-700">{c.category_count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredCustomers.length)} of {filteredCustomers.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-700 font-medium"
            >
              Previous
            </button>
            <span>{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-700 font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
