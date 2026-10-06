import React from 'react';
import { getEvidenceTable } from '@/lib/data';
import InsightInvestigationView from '@/components/InsightInvestigationView';

export default function InsightsPage() {
  const evidenceList = getEvidenceTable();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Insight Investigation</h1>
        <p className="text-sm text-slate-500 mt-1">
          Evidence register and hypothesis examination separating correlation, prediction, and experimental causality.
        </p>
      </div>

      <InsightInvestigationView evidenceList={evidenceList} />
    </div>
  );
}
