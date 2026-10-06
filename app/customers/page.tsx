import React, { Suspense } from 'react';
import { getCustomerMasterList, getRFMSummary } from '@/lib/data';
import CustomerIntelligenceView from '@/components/CustomerIntelligenceView';

export default function CustomersPage() {
  const customers = getCustomerMasterList(5000);
  const rfmSummary = getRFMSummary();

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-ink-600 font-mono">Loading Customer Accounts Telemetry...</div>}>
      <CustomerIntelligenceView customers={customers} rfmSummary={rfmSummary} />
    </Suspense>
  );
}
