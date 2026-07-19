"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/utils/cn";

export type RadarAxis = {
  label: string;
  score: number; // 0–100
};

type CompetencyRadarChartProps = {
  axes: RadarAxis[];
  size?: number;
  className?: string;
  title?: string;
  subtitle?: string;
  /** Start the expand animation on mount (hero / remount loops). */
  eager?: boolean;
  /** Expand animation length in ms. */
  durationMs?: number;
};

function polarPoint(
  cx: number,
  cy: number,
  radius: number,
  index: number,
  total: number,
) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
    angle,
  };
}

function polygonPoints(
  cx: number,
  cy: number,
  maxR: number,
  axes: RadarAxis[],
  scale: number,
) {
  return axes
    .map((axis, i) => {
      const r = (Math.min(100, Math.max(0, axis.score)) / 100) * maxR * scale;
      const { x, y } = polarPoint(cx, cy, r, i, axes.length);
      return `${x},${y}`;
    })
    .join(" ");
}

export function CompetencyRadarChart({
  axes,
  size = 280,
  className,
  title,
  subtitle,
  eager = false,
  durationMs = 900,
}: CompetencyRadarChartProps) {
  const uid = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState(0);
  const [visible, setVisible] = useState(eager);

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.28;
  const labelR = size * 0.42;
  const rings = [0.25, 0.5, 0.75, 1];

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (eager) {
      if (prefersReduced) {
        setScale(1);
        setVisible(true);
        return;
      }
      setVisible(true);
      setScale(0);
      return;
    }

    const el = ref.current;
    if (!el) return;

    if (prefersReduced) {
      setScale(1);
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [eager]);

  useEffect(() => {
    if (!visible) return;
    const start = performance.now();
    const duration = durationMs;
    let frame: number;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setScale(eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, durationMs]);

  const dataPoints = polygonPoints(cx, cy, maxR, axes, scale);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {(title || subtitle) && (
        <div className="mb-3 w-full text-center sm:text-left">
          {title && (
            <p className="font-serif text-sm font-semibold text-ink">{title}</p>
          )}
          {subtitle && (
            <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>
          )}
        </div>
      )}
      <svg
        ref={ref}
        viewBox={`0 0 ${size} ${size}`}
        className="h-auto w-full max-w-[280px]"
        role="img"
        aria-label={`Competency radar chart with ${axes.length} dimensions`}
      >
        <defs>
          <linearGradient id={`radar-fill-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3d4f5c" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#3d4f5c" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {rings.map((ring) => (
          <polygon
            key={ring}
            points={polygonPoints(cx, cy, maxR * ring, axes, 1)}
            fill="none"
            stroke="rgba(62,52,42,0.1)"
            strokeWidth="1"
          />
        ))}

        {axes.map((_, i) => {
          const { x, y } = polarPoint(cx, cy, maxR, i, axes.length);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="rgba(62,52,42,0.08)"
              strokeWidth="1"
            />
          );
        })}

        <polygon
          points={dataPoints}
          fill={`url(#radar-fill-${uid})`}
          stroke="#3d4f5c"
          strokeWidth="2"
          strokeLinejoin="round"
          className="transition-opacity duration-300"
          style={{ opacity: scale > 0.05 ? 1 : 0 }}
        />

        {axes.map((axis, i) => {
          const r = (axis.score / 100) * maxR * scale;
          const { x, y } = polarPoint(cx, cy, r, i, axes.length);
          return (
            <circle
              key={axis.label}
              cx={x}
              cy={y}
              r="3.5"
              fill="#3d4f5c"
              className="transition-opacity duration-300"
              style={{ opacity: scale > 0.05 ? 1 : 0 }}
            />
          );
        })}

        {axes.map((axis, i) => {
          const { x, y, angle } = polarPoint(cx, cy, labelR, i, axes.length);
          const cos = Math.cos(angle);
          const anchor =
            Math.abs(cos) < 0.25
              ? "middle"
              : cos > 0
                ? "start"
                : "end";
          const dy =
            Math.abs(cos) < 0.25 ? (Math.sin(angle) > 0 ? 10 : -2) : 4;

          return (
            <text
              key={`label-${axis.label}`}
              x={x}
              y={y}
              dy={dy}
              textAnchor={anchor}
              className="fill-ink-muted text-[9px] font-semibold uppercase tracking-wide"
              style={{ fontFamily: "var(--font-sans), Nunito, sans-serif" }}
            >
              {axis.label}
            </text>
          );
        })}
      </svg>

      <div className="mt-2 flex items-center gap-2 text-[11px] text-ink-faint">
        <span
          className="inline-block h-2.5 w-2.5 rounded-sm bg-accent/40 ring-1 ring-accent/30"
          aria-hidden
        />
        Candidate score
      </div>
    </div>
  );
}
