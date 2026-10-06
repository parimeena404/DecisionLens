import React, { Suspense } from 'react';
import { getEvidenceTable } from '@/lib/data';
import InsightInvestigationView from '@/components/InsightInvestigationView';

export default function InsightsPage() {
  const evidenceList = getEvidenceTable();

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-ink-600 font-mono">Loading Empirical Evidence Register...</div>}>
      <InsightInvestigationView evidenceList={evidenceList} />
    </Suspense>
  );
}
