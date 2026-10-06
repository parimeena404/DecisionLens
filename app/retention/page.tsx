import React from 'react';
import { getChurnData, getCohortData } from '@/lib/data';
import RetentionChurnView from '@/components/RetentionChurnView';

export default function RetentionPage() {
  const { metrics, featureImportance, riskTierCounts } = getChurnData();
  const { matrix: cohortMatrix, decayCurve } = getCohortData();

  return (
    <div className="space-y-6">
      <div className="border-b border-white/5 pb-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight">
          Retention & Churn Dynamics
        </h1>
        <p className="text-xs sm:text-sm text-ink-600 mt-1">
          Longitudinal cohort retention tracking, balanced logistic regression churn prediction, and empirical feature attribution.
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
