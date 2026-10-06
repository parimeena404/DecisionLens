import React, { Suspense } from 'react';
import { getEvidenceTable } from '@/lib/data';
import InsightInvestigationView from '@/components/InsightInvestigationView';

interface PageProps {
  params: {
    id: string;
  };
}

export default function InsightDetailPage({ params }: PageProps) {
  const evidenceList = getEvidenceTable();
  const recordId = parseInt(params.id, 10) || 1;

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-ink-600 font-mono">Loading Empirical Evidence Record #{recordId}...</div>}>
      <InsightInvestigationView
        evidenceList={evidenceList}
        initialRecordId={recordId}
      />
    </Suspense>
  );
}
