import fs from 'fs';
import path from 'path';

export interface OverviewMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  overallAOV: number;
}

export interface RFMSegmentSummary {
  segment: string;
  customer_count: number;
  avg_recency: number;
  avg_frequency: number;
  avg_monetary: number;
  total_revenue: number;
  avg_aov: number;
  avg_discount_usage: number;
  avg_categories: number;
  revenue_share_pct: number;
  customer_share_pct: number;
}

export interface CustomerRow {
  customer_id: string;
  segment: string;
  risk_tier: string;
  churn_probability: number;
  monetary_value: number;
  frequency: number;
  recency: number;
  average_order_value: number;
  discount_usage: number;
  category_count: number;
  tenure_days: number;
}

export interface ChurnMetrics {
  roc_auc: number;
  precision: number;
  recall: number;
  f1: number;
  confusion_matrix: number[][];
  test_size: number;
  train_size: number;
  churn_rate_train: number;
  churn_rate_test: number;
}

export interface FeatureImportance {
  feature: string;
  coefficient: number;
  abs_coefficient: number;
  direction: string;
}

export interface EvidenceItem {
  id: number;
  business_question: string;
  finding: string;
  supporting_metric: string;
  evidence_strength: 'Strong' | 'Moderate' | 'Preliminary' | string;
  limitation: string;
  association_causal: string;
  next_investigation: string;
}

export interface CohortRow {
  cohort_month: string;
  [monthOffset: string]: string | number;
}

// Simple robust CSV parser for our structured tabular outputs
function parseCsv(content: string): Record<string, string>[] {
  const lines = content.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h.trim()] = values[idx].trim();
      });
      rows.push(row);
    }
  }
  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let inQuotes = false;
  let current = '';

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

const outputsDir = path.join(process.cwd(), 'outputs');

export function getOverviewMetrics(): OverviewMetrics {
  const revCsv = fs.readFileSync(path.join(outputsDir, 'sql_total_revenue.csv'), 'utf-8');
  const aovCsv = fs.readFileSync(path.join(outputsDir, 'sql_average_order_value.csv'), 'utf-8');

  const revRows = parseCsv(revCsv);
  const aovRows = parseCsv(aovCsv);

  return {
    totalRevenue: parseFloat(revRows[0]?.total_revenue || '0'),
    totalOrders: parseInt(revRows[0]?.total_orders || '0', 10),
    totalCustomers: parseInt(revRows[0]?.total_customers || '0', 10),
    overallAOV: parseFloat(aovRows[0]?.overall_aov || '0'),
  };
}

export function getRFMSummary(): RFMSegmentSummary[] {
  const csv = fs.readFileSync(path.join(outputsDir, 'rfm_segment_summary.csv'), 'utf-8');
  const rows = parseCsv(csv);

  return rows.map(r => ({
    segment: r.segment,
    customer_count: parseInt(r.customer_count, 10),
    avg_recency: parseFloat(r.avg_recency),
    avg_frequency: parseFloat(r.avg_frequency),
    avg_monetary: parseFloat(r.avg_monetary),
    total_revenue: parseFloat(r.total_revenue),
    avg_aov: parseFloat(r.avg_aov),
    avg_discount_usage: parseFloat(r.avg_discount_usage),
    avg_categories: parseFloat(r.avg_categories),
    revenue_share_pct: parseFloat(r.revenue_share_pct),
    customer_share_pct: parseFloat(r.customer_share_pct),
  }));
}

export function getCustomerMasterList(limit: number = 1000): CustomerRow[] {
  const featCsv = fs.readFileSync(path.join(outputsDir, 'customer_features.csv'), 'utf-8');
  const rfmCsv = fs.readFileSync(path.join(outputsDir, 'rfm_scores.csv'), 'utf-8');
  const churnCsv = fs.readFileSync(path.join(outputsDir, 'churn_risk_scores.csv'), 'utf-8');

  const featRows = parseCsv(featCsv);
  const rfmRows = parseCsv(rfmCsv);
  const churnRows = parseCsv(churnCsv);

  const rfmMap = new Map<string, string>();
  rfmRows.forEach(r => rfmMap.set(r.customer_id, r.segment));

  const churnMap = new Map<string, { prob: number; tier: string }>();
  churnRows.forEach(r =>
    churnMap.set(r.customer_id, {
      prob: parseFloat(r.churn_probability),
      tier: r.risk_tier,
    })
  );

  const result: CustomerRow[] = [];
  const max = Math.min(featRows.length, limit);

  for (let i = 0; i < max; i++) {
    const f = featRows[i];
    const cInfo = churnMap.get(f.customer_id) || { prob: 0, tier: 'N/A' };
    result.push({
      customer_id: f.customer_id,
      segment: rfmMap.get(f.customer_id) || 'Unknown',
      risk_tier: cInfo.tier,
      churn_probability: cInfo.prob,
      monetary_value: parseFloat(f.monetary_value || '0'),
      frequency: parseInt(f.frequency || '0', 10),
      recency: parseInt(f.recency || '0', 10),
      average_order_value: parseFloat(f.average_order_value || '0'),
      discount_usage: parseFloat(f.discount_usage || '0'),
      category_count: parseInt(f.category_count || '0', 10),
      tenure_days: parseInt(f.tenure_days || '0', 10),
    });
  }

  return result;
}

export function getChurnData(): {
  metrics: ChurnMetrics;
  featureImportance: FeatureImportance[];
  riskTierCounts: { name: string; value: number }[];
} {
  const metricsRaw = fs.readFileSync(path.join(outputsDir, 'churn_model_metrics.json'), 'utf-8');
  const metrics: ChurnMetrics = JSON.parse(metricsRaw);

  const featCsv = fs.readFileSync(path.join(outputsDir, 'churn_feature_importance.csv'), 'utf-8');
  const featRows = parseCsv(featCsv);
  const featureImportance: FeatureImportance[] = featRows.map(r => ({
    feature: r.feature,
    coefficient: parseFloat(r.coefficient),
    abs_coefficient: parseFloat(r.abs_coefficient),
    direction: r.direction,
  }));

  const churnCsv = fs.readFileSync(path.join(outputsDir, 'churn_risk_scores.csv'), 'utf-8');
  const churnRows = parseCsv(churnCsv);
  const tierMap: Record<string, number> = { Low: 0, Medium: 0, High: 0 };
  churnRows.forEach(r => {
    if (tierMap[r.risk_tier] !== undefined) {
      tierMap[r.risk_tier]++;
    }
  });

  const riskTierCounts = [
    { name: 'Low Risk', value: tierMap.Low },
    { name: 'Medium Risk', value: tierMap.Medium },
    { name: 'High Risk', value: tierMap.High },
  ];

  return { metrics, featureImportance, riskTierCounts };
}

export function getCohortData(): {
  matrix: CohortRow[];
  decayCurve: { monthOffset: number; retention: number }[];
} {
  const csv = fs.readFileSync(path.join(outputsDir, 'cohort_retention_matrix.csv'), 'utf-8');
  const rows = parseCsv(csv);

  // Compute average decay curve across all cohorts
  const offsetSums: Record<number, { sum: number; count: number }> = {};

  rows.forEach(r => {
    Object.keys(r).forEach(k => {
      if (k !== 'cohort_month' && r[k] !== '') {
        const offset = parseInt(k, 10);
        const val = parseFloat(r[k]);
        if (!isNaN(offset) && !isNaN(val)) {
          if (!offsetSums[offset]) offsetSums[offset] = { sum: 0, count: 0 };
          offsetSums[offset].sum += val;
          offsetSums[offset].count += 1;
        }
      }
    });
  });

  const decayCurve = Object.keys(offsetSums)
    .map(k => {
      const offset = parseInt(k, 10);
      const avg = offsetSums[offset].sum / offsetSums[offset].count;
      return { monthOffset: offset, retention: Math.round(avg * 10) / 10 };
    })
    .sort((a, b) => a.monthOffset - b.monthOffset);

  return { matrix: rows as CohortRow[], decayCurve };
}

export function getEvidenceTable(): EvidenceItem[] {
  const csv = fs.readFileSync(path.join(outputsDir, 'evidence_table.csv'), 'utf-8');
  const rows = parseCsv(csv);

  return rows.map(r => ({
    id: parseInt(r.id, 10),
    business_question: r.business_question,
    finding: r.finding,
    supporting_metric: r.supporting_metric,
    evidence_strength: r.evidence_strength,
    limitation: r.limitation,
    association_causal: r.association_causal,
    next_investigation: r.next_investigation,
  }));
}
