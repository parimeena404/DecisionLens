// Segment color map used globally for charts, badges, tables
export const SEGMENT_COLORS: Record<string, string> = {
  'High Value': '#7C5CFF',
  Loyal: '#22C3A6',
  Growing: '#4DA3FF',
  Occasional: '#F5B83D',
  'At Risk': '#FF7A59',
  'Low Engagement': '#8A8FA8',
};

export const SEGMENT_ORDER = [
  'High Value',
  'Loyal',
  'Growing',
  'Occasional',
  'At Risk',
  'Low Engagement',
];

export const RISK_COLORS: Record<string, string> = {
  Low: '#22C3A6',
  Medium: '#F5B83D',
  High: '#FF7A59',
};

export function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1_000_000)
    return `₹${(value / 1_000_000).toFixed(2)}M`;
  if (compact && Math.abs(value) >= 1_000)
    return `₹${(value / 1_000).toFixed(1)}K`;
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function formatPct(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
