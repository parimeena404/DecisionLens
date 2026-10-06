'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomerRow, RFMSegmentSummary } from '@/lib/data';
import { SEGMENT_COLORS, RISK_COLORS, cn, formatCurrency } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import {
  Search,
  Filter,
  Download,
  X,
  ChevronRight,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowUpDown,
  Coins,
  ShoppingCart,
  Clock,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  customers: CustomerRow[];
  rfmSummary: RFMSegmentSummary[];
}

export default function CustomerIntelligenceView({ customers }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const searchParams = useSearchParams();

  // Search & Filter State
  const initialSegment = searchParams.get('segment') || 'ALL';
  const initialSearch = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [selectedSegment, setSelectedSegment] = useState<string>(initialSegment);
  const [selectedRiskTier, setSelectedRiskTier] = useState<string>('ALL');
  const [minSpend, setMinSpend] = useState<number>(0);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<keyof CustomerRow>('customer_id');
  const [sortAsc, setSortAsc] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 25;

  useEffect(() => {
    const s = searchParams.get('segment');
    if (s) setSelectedSegment(s);
    const q = searchParams.get('search');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Handle Sort Toggle
  const handleSort = (field: keyof CustomerRow) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'customer_id');
    }
    setCurrentPage(1);
  };

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        c.customer_id.toLowerCase().includes(searchQuery.trim().toLowerCase());
      const matchSegment = selectedSegment === 'ALL' || c.segment === selectedSegment;
      const matchRisk = selectedRiskTier === 'ALL' || c.risk_tier === selectedRiskTier;
      const matchSpend = c.monetary_value >= minSpend;

      return matchSearch && matchSegment && matchRisk && matchSpend;
    });
  }, [customers, searchQuery, selectedSegment, selectedRiskTier, minSpend]);

  // Sorted list
  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [filteredCustomers, sortField, sortAsc]);

  // Aggregate stats for filtered cohort
  const cohortStats = useMemo(() => {
    if (filteredCustomers.length === 0) {
      return { totalSpend: 0, avgAOV: 0, highRiskCount: 0 };
    }
    const totalSpend = filteredCustomers.reduce((acc, c) => acc + c.monetary_value, 0);
    const totalAOV = filteredCustomers.reduce((acc, c) => acc + c.average_order_value, 0);
    const highRiskCount = filteredCustomers.filter((c) => c.risk_tier === 'High').length;
    return {
      totalSpend,
      avgAOV: totalAOV / filteredCustomers.length,
      highRiskCount,
    };
  }, [filteredCustomers]);

  const totalPages = Math.ceil(sortedCustomers.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCustomers.slice(start, start + pageSize);
  }, [sortedCustomers, currentPage, pageSize]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSegment('ALL');
    setSelectedRiskTier('ALL');
    setMinSpend(0);
    setCurrentPage(1);
  };

  // Export Filtered View to CSV
  const handleExportCsv = () => {
    const headers = [
      'Customer ID',
      'Segment',
      'Net Spend (INR)',
      'Orders',
      'Recency (Days)',
      'AOV (INR)',
      'Churn Prob %',
      'Risk Tier',
    ];
    const rows = sortedCustomers.map((c) => [
      c.customer_id,
      c.segment,
      c.monetary_value.toFixed(2),
      c.frequency,
      c.recency,
      c.average_order_value.toFixed(2),
      (c.churn_probability * 100).toFixed(1) + '%',
      c.risk_tier,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `decisionlens_accounts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Verification Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight">
              Customer Intelligence
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium badge-verified">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Strict Zero-Leakage</span>
            </span>
          </div>
          <p className={cn('text-xs sm:text-sm', isDark ? 'text-ink-600' : 'text-slate-600')}>
            Behavioral RFM segmentation, customer revenue distribution, and multi-parameter account explorer across 5,000 evaluated accounts.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleExportCsv}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all',
              isDark
                ? 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white'
                : 'border-slate-300 hover:border-slate-400 bg-white text-slate-800 shadow-sm'
            )}
          >
            <Download className="w-3.5 h-3.5 text-accent-400" />
            <span>Export Filtered CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Live Dynamic Summary Telemetry Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          className={cn(
            'p-3.5 rounded-xl border flex items-center justify-between',
            isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200'
          )}
        >
          <div className="space-y-0.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-600">
              Cohort Net Spend
            </span>
            <div className="text-xl font-bold font-mono text-accent-300">
              ₹{(cohortStats.totalSpend / 1000000).toFixed(2)}M
            </div>
          </div>
          <Coins className="w-5 h-5 text-accent-400/60" />
        </div>

        <div
          className={cn(
            'p-3.5 rounded-xl border flex items-center justify-between',
            isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200'
          )}
        >
          <div className="space-y-0.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-600">
              Cohort Mean AOV
            </span>
            <div className="text-xl font-bold font-mono">
              ₹{cohortStats.avgAOV.toFixed(2)}
            </div>
          </div>
          <ShoppingCart className="w-5 h-5 text-teal-400/60" />
        </div>

        <div
          className={cn(
            'p-3.5 rounded-xl border flex items-center justify-between',
            isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200'
          )}
        >
          <div className="space-y-0.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-ink-600">
              High Risk Accounts
            </span>
            <div className="text-xl font-bold font-mono text-[#FF7A59]">
              {cohortStats.highRiskCount.toLocaleString()}
            </div>
          </div>
          <AlertTriangle className="w-5 h-5 text-[#FF7A59]/60" />
        </div>
      </div>

      {/* 3. Filter Controls Bar */}
      <div
        className={cn(
          'p-4 rounded-xl border space-y-4',
          isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200'
        )}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Account ID */}
          <div className="relative">
            <Search className="w-4 h-4 text-ink-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Customer ID (e.g. CUST00001)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className={cn(
                'w-full pl-9 pr-3 py-2 rounded-lg text-xs font-mono border focus:outline-none focus:border-accent-400',
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder:text-ink-600'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
              )}
            />
          </div>

          {/* Segment Filter */}
          <div>
            <select
              value={selectedSegment}
              onChange={(e) => {
                setSelectedSegment(e.target.value);
                setCurrentPage(1);
              }}
              className={cn(
                'w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:border-accent-400',
                isDark
                  ? 'bg-[#121438] border-white/10 text-white'
                  : 'bg-white border-slate-200 text-slate-900'
              )}
            >
              <option value="ALL">All RFM Segments (6)</option>
              <option value="High Value">High Value (1,053)</option>
              <option value="Loyal">Loyal (940)</option>
              <option value="Growing">Growing (653)</option>
              <option value="Occasional">Occasional (778)</option>
              <option value="At Risk">At Risk (579)</option>
              <option value="Low Engagement">Low Engagement (997)</option>
            </select>
          </div>

          {/* Risk Tier Filter */}
          <div>
            <select
              value={selectedRiskTier}
              onChange={(e) => {
                setSelectedRiskTier(e.target.value);
                setCurrentPage(1);
              }}
              className={cn(
                'w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:border-accent-400',
                isDark
                  ? 'bg-[#121438] border-white/10 text-white'
                  : 'bg-white border-slate-200 text-slate-900'
              )}
            >
              <option value="ALL">All Risk Tiers (3)</option>
              <option value="Low">Low Risk (&lt;0.40)</option>
              <option value="Medium">Medium Risk (0.40 – 0.70)</option>
              <option value="High">High Risk (&gt;0.70)</option>
            </select>
          </div>

          {/* Min Spend Slider */}
          <div className="flex flex-col justify-center px-1">
            <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
              <span className="text-ink-600">Min Net Spend:</span>
              <span className="font-semibold text-accent-300">₹{minSpend}</span>
            </div>
            <input
              type="range"
              min={0}
              max={5000}
              step={100}
              value={minSpend}
              onChange={(e) => {
                setMinSpend(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="accent-accent-400 cursor-pointer h-1.5 w-full bg-white/10 rounded-lg"
            />
          </div>
        </div>

        {/* Counter and Active Filters */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
          <div className="text-ink-600 font-mono">
            Showing <strong className={isDark ? 'text-white' : 'text-slate-900'}>{filteredCustomers.length.toLocaleString()}</strong> of 5,000 accounts matching
          </div>

          {(searchQuery || selectedSegment !== 'ALL' || selectedRiskTier !== 'ALL' || minSpend > 0) && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[11px] text-accent-400 hover:text-accent-300 underline font-mono"
            >
              <RotateCcw className="w-3 h-3" />
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Accounts Table */}
      <div
        className={cn(
          'rounded-xl border overflow-hidden transition-colors',
          isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200 shadow-sm'
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr
                className={cn(
                  'border-b text-[11px] uppercase tracking-wider',
                  isDark ? 'border-white/10 text-ink-600 bg-white/[0.02]' : 'border-slate-200 text-slate-500 bg-slate-50'
                )}
              >
                <th
                  onClick={() => handleSort('customer_id')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Customer ID</span>
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('segment')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>RFM Segment</span>
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('monetary_value')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Net Spend (₹)</span>
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('frequency')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Orders</span>
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('recency')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Recency</span>
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('average_order_value')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>AOV (₹)</span>
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('churn_probability')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Churn Prob %</span>
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Risk Tier</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <p className="text-sm font-medium text-ink-600 mb-2">
                      No accounts matched the selected filter criteria.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-1.5 rounded-lg bg-accent-400 text-white text-xs font-semibold"
                    >
                      Clear Filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => {
                  const segColor = SEGMENT_COLORS[row.segment] || '#8A8FA8';
                  const riskColor = RISK_COLORS[row.risk_tier] || '#F5B83D';

                  return (
                    <motion.tr
                      key={row.customer_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        'transition-colors group',
                        isDark ? 'hover:bg-white/5 border-white/5' : 'hover:bg-slate-50 border-slate-100'
                      )}
                    >
                      <td className="py-3 px-3 font-mono font-medium">
                        {row.customer_id}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium"
                          style={{
                            backgroundColor: `${segColor}18`,
                            color: segColor,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: segColor }}
                          />
                          {row.segment}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold">
                        ₹{row.monetary_value.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {row.frequency}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-ink-600">
                        {row.recency}d
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        ₹{row.average_order_value.toFixed(1)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold" style={{ color: riskColor }}>
                        {(row.churn_probability * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold"
                          style={{
                            backgroundColor: `${riskColor}18`,
                            color: riskColor,
                          }}
                        >
                          {row.risk_tier}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setSelectedCustomer(row)}
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors border',
                            isDark
                              ? 'border-white/10 hover:border-accent-400 hover:text-accent-300 bg-white/5'
                              : 'border-slate-200 hover:border-accent-400 hover:text-accent-600 bg-slate-50'
                          )}
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div
          className={cn(
            'p-3 border-t flex items-center justify-between text-xs',
            isDark ? 'border-white/5 text-ink-600' : 'border-slate-200 text-slate-500'
          )}
        >
          <div className="font-mono">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={cn(
                'px-2.5 py-1 rounded border text-xs font-medium disabled:opacity-30 disabled:pointer-events-none transition-colors',
                isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-100'
              )}
            >
              Previous
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className={cn(
                'px-2.5 py-1 rounded border text-xs font-medium disabled:opacity-30 disabled:pointer-events-none transition-colors',
                isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-100'
              )}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 5. Animated Right-Side Customer Profile Drawer */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setSelectedCustomer(null)}
            />

            {/* Slide-in Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                'relative w-full max-w-md h-full overflow-y-auto p-6 border-l z-10 shadow-2xl flex flex-col justify-between',
                isDark
                  ? 'bg-[#101235] border-white/10 text-white'
                  : 'bg-white border-slate-200 text-slate-900'
              )}
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-accent-400 block mb-0.5">
                      Account Profile Inspection
                    </span>
                    <h2 className="text-xl font-bold font-mono">
                      {selectedCustomer.customer_id}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-ink-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Churn Probability Radial Gauge */}
                <div
                  className={cn(
                    'p-5 rounded-2xl border text-center space-y-2',
                    isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'
                  )}
                >
                  <span className="text-xs uppercase tracking-widest font-mono text-ink-600 block">
                    Forecasted Churn Probability
                  </span>
                  <div className="text-4xl font-extrabold font-mono" style={{ color: RISK_COLORS[selectedCustomer.risk_tier] }}>
                    {(selectedCustomer.churn_probability * 100).toFixed(1)}%
                  </div>
                  <div className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold font-mono" style={{
                    backgroundColor: `${RISK_COLORS[selectedCustomer.risk_tier]}20`,
                    color: RISK_COLORS[selectedCustomer.risk_tier],
                  }}>
                    {selectedCustomer.risk_tier} Risk Tier
                  </div>
                </div>

                {/* RFM Mini Metrics */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-600">
                    RFM Behavioral Metrics
                  </h3>

                  <div className="space-y-2.5">
                    {/* Monetary */}
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-mono">
                        <span className="text-ink-600">Net Spend (M)</span>
                        <span className="font-bold">₹{selectedCustomer.monetary_value.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div
                          className="bg-accent-400 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, (selectedCustomer.monetary_value / 5000) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Frequency */}
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-mono">
                        <span className="text-ink-600">Orders (F)</span>
                        <span className="font-bold">{selectedCustomer.frequency} orders</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div
                          className="bg-teal-400 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, (selectedCustomer.frequency / 25) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Recency */}
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-mono">
                        <span className="text-ink-600">Dormancy Recency (R)</span>
                        <span className="font-bold">{selectedCustomer.recency} days</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div
                          className="bg-[#FF7A59] h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, (selectedCustomer.recency / 365) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Detail Grid */}
                <div
                  className={cn(
                    'p-4 rounded-xl border grid grid-cols-2 gap-3 text-xs',
                    isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'
                  )}
                >
                  <div>
                    <span className="text-[10px] text-ink-600 uppercase tracking-wider block">
                      RFM Segment
                    </span>
                    <span
                      className="font-bold font-display"
                      style={{ color: SEGMENT_COLORS[selectedCustomer.segment] }}
                    >
                      {selectedCustomer.segment}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-600 uppercase tracking-wider block">
                      Average Order Value
                    </span>
                    <span className="font-bold font-mono">
                      ₹{selectedCustomer.average_order_value.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-600 uppercase tracking-wider block">
                      Account Tenure
                    </span>
                    <span className="font-bold font-mono">
                      {selectedCustomer.tenure_days} days
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-600 uppercase tracking-wider block">
                      Categories Bought
                    </span>
                    <span className="font-bold font-mono">
                      {selectedCustomer.category_count} categories
                    </span>
                  </div>
                </div>

                {/* Suggested Action (as a hypothesis, not a causal claim) */}
                <div
                  className={cn(
                    'p-4 rounded-xl border space-y-1.5',
                    isDark ? 'bg-accent-400/10 border-accent-400/20' : 'bg-purple-50 border-purple-200'
                  )}
                >
                  <div className="flex items-center gap-1.5 text-accent-300 text-xs font-semibold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Hypothesized Operational Action</span>
                  </div>
                  <p className={cn('text-xs leading-relaxed', isDark ? 'text-ink-800' : 'text-slate-700')}>
                    {selectedCustomer.risk_tier === 'High'
                      ? 'Hypothesis: Timely targeted reminder with catalog recommendations may reduce dormancy probability. Subject to randomized A/B validation.'
                      : selectedCustomer.segment === 'High Value'
                      ? 'Hypothesis: Assign account to priority VIP engagement track to preserve high revenue yield.'
                      : 'Hypothesis: Standard retention cadence; monitor recency threshold at day 45.'}
                  </p>
                </div>
              </div>

              {/* Drawer footer */}
              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
