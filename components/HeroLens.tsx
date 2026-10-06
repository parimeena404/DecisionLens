'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme';
import { SEGMENT_COLORS } from '@/lib/utils';
import { Sparkles, Focus } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  startX: number;
  startY: number;
  color: string;
  size: number;
  segment: string;
}

const SEGMENTS = [
  { name: 'High Value', color: '#7C5CFF', count: 1053, cx: 0.68, cy: 0.32 },
  { name: 'Loyal', color: '#22C3A6', count: 940, cx: 0.72, cy: 0.65 },
  { name: 'Growing', color: '#4DA3FF', count: 653, cx: 0.35, cy: 0.28 },
  { name: 'Occasional', color: '#F5B83D', count: 778, cx: 0.30, cy: 0.58 },
  { name: 'At Risk', color: '#FF7A59', count: 579, cx: 0.48, cy: 0.78 },
  { name: 'Low Engagement', color: '#8A8FA8', count: 997, cx: 0.50, cy: 0.45 },
];

export default function HeroLens() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [focused, setFocused] = useState(false);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 420);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create 600 representative particles proportional to segment counts
    const particles: Particle[] = [];
    const totalWeight = 5000;
    const sampleSize = 650;

    SEGMENTS.forEach((seg) => {
      const segParticles = Math.round((seg.count / totalWeight) * sampleSize);
      for (let i = 0; i < segParticles; i++) {
        // Random start scatter (blurred)
        const startX = Math.random() * width;
        const startY = Math.random() * height;

        // Target cluster with gaussian-like jitter
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.pow(Math.random(), 0.5) * (Math.min(width, height) * 0.12);
        const targetX = seg.cx * width + Math.cos(angle) * radius;
        const targetY = seg.cy * height + Math.sin(angle) * radius;

        particles.push({
          x: startX,
          y: startY,
          startX,
          startY,
          targetX,
          targetY,
          color: seg.color,
          size: Math.random() * 1.5 + 1.2,
          segment: seg.name,
        });
      }
    });

    let startTime = performance.now();
    const duration = 2400; // 2.4s focus transition

    const render = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Cubic ease out
      const ease = 1 - Math.pow(1 - progress, 3);

      if (progress >= 1 && !focused) {
        setFocused(true);
      }

      ctx.clearRect(0, 0, width, height);

      // Draw background focus concentric rings
      const centerX = width * 0.52;
      const centerY = height * 0.48;
      const ringRadius = (Math.min(width, height) * 0.38) * (0.3 + 0.7 * ease);

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? 'rgba(124, 92, 255, 0.25)' : 'rgba(124, 92, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.stroke();

      // Outer faint ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius * 1.25, 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 8]);
      ctx.stroke();
      ctx.restore();

      // Crosshairs on focus ring
      ctx.save();
      ctx.strokeStyle = isDark ? 'rgba(124, 92, 255, 0.4)' : 'rgba(124, 92, 255, 0.3)';
      ctx.lineWidth = 1;
      // top tick
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - ringRadius - 8);
      ctx.lineTo(centerX, centerY - ringRadius + 8);
      ctx.stroke();
      // bottom tick
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + ringRadius - 8);
      ctx.lineTo(centerX, centerY + ringRadius + 8);
      ctx.stroke();
      // left tick
      ctx.beginPath();
      ctx.moveTo(centerX - ringRadius - 8, centerY);
      ctx.lineTo(centerX - ringRadius + 8, centerY);
      ctx.stroke();
      // right tick
      ctx.beginPath();
      ctx.moveTo(centerX + ringRadius - 8, centerY);
      ctx.lineTo(centerX + ringRadius + 8, centerY);
      ctx.stroke();
      ctx.restore();

      // Draw particles
      particles.forEach((p) => {
        // Interpolate position
        p.x = p.startX + (p.targetX - p.startX) * ease;
        p.y = p.startY + (p.targetY - p.startY) * ease;

        // Subtle floating noise after focused
        if (progress >= 1) {
          p.x += Math.sin(currentTime * 0.0015 + p.startY) * 0.3;
          p.y += Math.cos(currentTime * 0.0015 + p.startX) * 0.3;
        }

        const isHighlighted = activeSegment ? p.segment === activeSegment : true;
        const alpha = isHighlighted ? (0.4 + 0.6 * ease) : 0.15;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fill();

        // Extra glow for High Value and Loyal
        if (progress > 0.8 && (p.segment === 'High Value' || p.segment === 'Loyal')) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha * 0.2;
          ctx.fill();
        }
      });

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDark, activeSegment]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[380px] sm:h-[430px] rounded-2xl overflow-hidden border border-white/10 glass flex flex-col justify-between p-4 sm:p-6"
    >
      {/* Background canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Overlay header badges */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-400/10 border border-accent-400/20 text-[11px] font-mono text-accent-300">
          <Focus className="w-3.5 h-3.5 animate-pulse text-accent-400" />
          <span>Focal Aperture: 5,000 Accounts</span>
        </div>
        <div className="text-[11px] font-mono text-ink-600 hidden sm:block">
          Cluster Resolution: 6 Segments
        </div>
      </div>

      {/* Segment legend interactive chips */}
      <div className="relative z-10 pt-4">
        <div className="text-[11px] font-semibold text-ink-600 mb-2 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-accent-400" />
          <span>Resolved RFM Clusters (Click to Isolate)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {SEGMENTS.map((seg) => {
            const isActive = activeSegment === seg.name;
            return (
              <button
                key={seg.name}
                type="button"
                onClick={() => setActiveSegment(isActive ? null : seg.name)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-all border ${
                  isActive
                    ? 'border-white/40 bg-white/15 scale-[1.02] shadow-sm'
                    : 'border-white/5 bg-black/20 hover:bg-white/10 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="truncate font-medium text-[11px]">{seg.name}</span>
                </div>
                <span className="text-[10px] font-mono opacity-60 ml-1">
                  {seg.count.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
