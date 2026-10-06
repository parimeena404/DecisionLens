import React from 'react';
import { getChurnData, getCohortData } from '@/lib/data';
import RetentionChurnView from '@/components/RetentionChurnView';

export default function RetentionPage() {
  const { metrics, featureImportance, riskTierCounts } = getChurnData();
  const { matrix: cohortMatrix, decayCurve } = getCohortData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Retention & Churn Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">
          Longitudinal cohort retention tracking, balanced logistic regression churn prediction, and feature attribution.
        </p>
      </div>

      <RetentionChurnView
        metrics={metrics}
        featureImportance={featureImportance}
        riskTierCounts={riskTierCounts}
        cohortMatrix={cohortMatrix}
        decayCurve={decayCurve}
      />
    </div>
  );
}
