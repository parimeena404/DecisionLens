import React from 'react';
import { getCustomerMasterList, getRFMSummary } from '@/lib/data';
import CustomerIntelligenceView from '@/components/CustomerIntelligenceView';

export default function CustomersPage() {
  const customers = getCustomerMasterList(5000);
  const rfmSummary = getRFMSummary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Intelligence</h1>
        <p className="text-sm text-slate-500 mt-1">
          Behavioral RFM segmentation, customer revenue distribution, and multi-parameter account explorer.
        </p>
      </div>

      <CustomerIntelligenceView customers={customers} rfmSummary={rfmSummary} />
    </div>
  );
}
