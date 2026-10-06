'use client';

import React, { useState, useMemo } from 'react';
import { CustomerRow, RFMSegmentSummary } from '@/lib/data';
import {
  Search,
  Filter,
  Download,
  X,
  ChevronRight,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ShoppingBag,
  CreditCard,
  Percent,
  Sparkles,
} from 'lucide-react';

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

const RISK_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  Low: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  High: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export default function CustomerIntelligenceView({ customers }: Props) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');
  const [selectedRiskTier, setSelectedRiskTier] = useState<string>('ALL');
  const [minSpend, setMinSpend] = useState<number>(0);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 25;

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

  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  // Export Filtered View to CSV
  const handleExportCsv = () => {
    const headers = [
      'Customer ID',
      'Segment',
      'Risk Tier',
      'Churn Probability',
      'Monetary Value (INR)',
      'Order Count',
      'Recency (Days)',
      'AOV (INR)',
      'Discount Usage',
      'Category Count',
      'Tenure Days',
    ];

    const rows = filteredCustomers.map((c) => [
      c.customer_id,
      c.segment,
      c.risk_tier,
      c.churn_probability.toFixed(4),
      c.monetary_value.toFixed(2),
      c.frequency,
      c.recency,
      c.average_order_value.toFixed(2),
      c.discount_usage.toFixed(4),
      c.category_count,
      c.tenure_days,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `decisionlens_customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSegment('ALL');
    setSelectedRiskTier('ALL');
    setMinSpend(0);
    setCurrentPage(1);
  };

  // Behavioral observation builder
  const getBehavioralNotes = (c: CustomerRow) => {
    const observations: string[] = [];

    if (c.recency > 90) {
      observations.push(`High inactivity latency (${c.recency} days since last purchase).`);
    } else if (c.recency < 30) {
      observations.push(`Active recency cadence (${c.recency} days since last transaction).`);
    }

    if (c.discount_usage > 0.5) {
      observations.push(`Elevated price sensitivity (${(c.discount_usage * 100).toFixed(0)}% of orders used discounts).`);
    }

    if (c.category_count >= 4) {
      observations.push(`High catalog engagement across ${c.category_count} distinct merchandise categories.`);
    } else if (c.category_count === 1) {
      observations.push(`Narrow single-category purchasing pattern.`);
    }

    if (c.risk_tier === 'High') {
      observations.push(`High churn risk (${(c.churn_probability * 100).toFixed(1)}% model estimate); prioritized for proactive outreach.`);
    } else if (c.risk_tier === 'Low') {
      observations.push(`Low churn risk (${(c.churn_probability * 100).toFixed(1)}%); steady baseline retention profile.`);
    }

    return observations;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Filter Workspace */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Customer Account Filter & Explorer
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Query 5,000 accounts across RFM cohorts, churn probability tiers, and spend levels
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            {(searchQuery || selectedSegment !== 'ALL' || selectedRiskTier !== 'ALL' || minSpend > 0) && (
              <button
                onClick={resetFilters}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors px-2 py-1"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Field */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
              Search Account ID
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. CUST_00042"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 font-mono"
              />
            </div>
          </div>

          {/* RFM Segment Dropdown */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
              RFM Segment
            </label>
            <select
              value={selectedSegment}
              onChange={(e) => {
                setSelectedSegment(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            >
              <option value="ALL">All Segments (6 Cohorts)</option>
              <option value="High Value">High Value</option>
              <option value="Loyal">Loyal</option>
              <option value="Growing">Growing</option>
              <option value="Occasional">Occasional</option>
              <option value="At Risk">At Risk</option>
              <option value="Low Engagement">Low Engagement</option>
            </select>
          </div>

          {/* Churn Risk Tier */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
              Predicted Churn Risk
            </label>
            <select
              value={selectedRiskTier}
              onChange={(e) => {
                setSelectedRiskTier(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            >
              <option value="ALL">All Risk Tiers (Low/Med/High)</option>
              <option value="Low">Low Risk (&lt; 0.40)</option>
              <option value="Medium">Medium Risk (0.40 - 0.70)</option>
              <option value="High">High Risk (&gt; 0.70)</option>
            </select>
          </div>

          {/* Minimum Spend Slider/Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Min Net Spend
              </label>
              <span className="text-[11px] font-mono text-slate-700">₹{minSpend.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="250"
              value={minSpend}
              onChange={(e) => {
                setMinSpend(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* Filtered Cohort Quick Metrics */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900">{filteredCustomers.length.toLocaleString()}</span>
            <span>of 5,000 accounts matching criteria</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
            <span>
              Cohort Spend: <strong className="text-slate-800">₹{(cohortStats.totalSpend / 1000000).toFixed(2)}M</strong>
            </span>
            <span>
              Mean AOV: <strong className="text-slate-800">₹{cohortStats.avgAOV.toFixed(1)}</strong>
            </span>
            <span>
              High Risk Accounts: <strong className="text-rose-600">{cohortStats.highRiskCount}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Customer Table */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-500 border-b border-slate-200 sticky top-0">
              <tr>
                <th className="px-5 py-3">Customer ID</th>
                <th className="px-5 py-3">RFM Segment</th>
                <th className="px-5 py-3 text-right">Net Spend (₹)</th>
                <th className="px-5 py-3 text-right">Orders</th>
                <th className="px-5 py-3 text-right">Recency</th>
                <th className="px-5 py-3 text-right">AOV (₹)</th>
                <th className="px-5 py-3 text-right">Churn Prob</th>
                <th className="px-5 py-3 text-center">Risk Tier</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-400 font-sans">
                    No customer accounts match the selected filter configuration.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((cust) => {
                  const riskStyle = RISK_BADGES[cust.risk_tier] || RISK_BADGES.Medium;
                  const isSelected = selectedCustomer?.customer_id === cust.customer_id;

                  return (
                    <tr
                      key={cust.customer_id}
                      onClick={() => setSelectedCustomer(cust)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/60 font-medium'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="px-5 py-3 font-semibold text-slate-900">
                        {cust.customer_id}
                      </td>
                      <td className="px-5 py-3 font-sans">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium"
                          style={{
                            color: SEGMENT_COLORS[cust.segment] || '#475569',
                            backgroundColor: `${SEGMENT_COLORS[cust.segment]}10`,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: SEGMENT_COLORS[cust.segment] || '#475569' }}
                          />
                          {cust.segment}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-slate-800">
                        ₹{cust.monetary_value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-700">
                        {cust.frequency}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-700">
                        {cust.recency}d
                      </td>
                      <td className="px-5 py-3 text-right text-slate-700">
                        ₹{cust.average_order_value.toFixed(1)}
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-slate-900">
                        {(cust.churn_probability * 100).toFixed(1)}%
                      </td>
                      <td className="px-5 py-3 text-center font-sans">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${riskStyle.bg} ${riskStyle.text} ${riskStyle.border}`}
                        >
                          {cust.risk_tier}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-sans">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(cust);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing <strong className="text-slate-900">{filteredCustomers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-slate-900">{Math.min(currentPage * pageSize, filteredCustomers.length)}</strong> of{' '}
            <strong className="text-slate-900">{filteredCustomers.length.toLocaleString()}</strong> accounts
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium"
            >
              Previous
            </button>
            <span className="font-mono text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 3. Customer Profile Inspector Panel / Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-mono text-slate-900">
                  {selectedCustomer.customer_id}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    RISK_BADGES[selectedCustomer.risk_tier]?.bg
                  } ${RISK_BADGES[selectedCustomer.risk_tier]?.text} ${
                    RISK_BADGES[selectedCustomer.risk_tier]?.border
                  }`}
                >
                  {selectedCustomer.risk_tier} Risk
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Segment: <strong className="text-slate-800">{selectedCustomer.segment}</strong>
              </p>
            </div>
            <button
              onClick={() => setSelectedCustomer(null)}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Churn Prediction Banner */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                  Predicted Inactivity Risk
                </span>
                <span className="font-mono text-sm font-bold text-slate-900">
                  {(selectedCustomer.churn_probability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    selectedCustomer.risk_tier === 'High'
                      ? 'bg-rose-500'
                      : selectedCustomer.risk_tier === 'Medium'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${selectedCustomer.churn_probability * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                Model estimate derived from temporal observation cutoff (2024-09-30). Forecasts probability of zero transactions during Q4 2024.
              </p>
            </div>

            {/* Behavioral Feature Grid */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Historical Behavioral Metrics
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-md bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-500">Cumulative Spend</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                    ₹{selectedCustomer.monetary_value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                </div>

                <div className="p-3 rounded-md bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-500">Order Frequency</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                    {selectedCustomer.frequency} Orders
                  </div>
                </div>

                <div className="p-3 rounded-md bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-500">Recency Latency</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                    {selectedCustomer.recency} Days
                  </div>
                </div>

                <div className="p-3 rounded-md bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-500">Average Order Value</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                    ₹{selectedCustomer.average_order_value.toFixed(1)}
                  </div>
                </div>

                <div className="p-3 rounded-md bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-500">Discount Ratio</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                    {(selectedCustomer.discount_usage * 100).toFixed(0)}% Orders
                  </div>
                </div>

                <div className="p-3 rounded-md bg-slate-50 border border-slate-100">
                  <div className="text-[11px] text-slate-500">Category Breadth</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                    {selectedCustomer.category_count} / 19 SKUs
                  </div>
                </div>
              </div>
            </div>

            {/* Empirical Behavioral Observations */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Behavioral Assessment</span>
              </div>
              <div className="space-y-2">
                {getBehavioralNotes(selectedCustomer).map((note, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-md bg-blue-50/50 border border-blue-100 text-xs text-slate-700 leading-relaxed flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Implication Note */}
            <div className="p-3.5 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Analyst Guidance:</strong> High-risk classification indicates eligibility for intervention queues. Test proposed retention offers against a randomized 10% holdout group before broad deployment.
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="px-4 py-1.5 rounded-md text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
