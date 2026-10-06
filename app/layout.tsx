import type { Metadata } from 'next';
import './globals.css';
import LayoutShell from '@/components/LayoutShell';

export const metadata: Metadata = {
  title: 'DecisionLens | Customer Decision Intelligence & Evidence Platform',
  description:
    'Synthesis of empirical customer behavior, cohort retention dynamics, predictive churn scoring, and epistemic evidence boundaries for decision support.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased selection:bg-accent-400/30 selection:text-white">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
