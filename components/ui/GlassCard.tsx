'use client';

import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  glow?: boolean;
}

export default function GlassCard({
  children,
  className = '',
  delay = 0,
  hover = true,
  glow = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'rounded-xl transition-all duration-200',
        isDark
          ? 'bg-white/[0.04] border border-white/[0.06]'
          : 'bg-white border border-black/[0.06] shadow-card',
        hover && isDark && 'hover:bg-white/[0.07] hover:border-white/[0.10]',
        hover && !isDark && 'hover:shadow-card-hover hover:border-black/[0.10]',
        glow && 'shadow-glow',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
