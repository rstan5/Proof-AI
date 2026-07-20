"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/utils/cn";

const AXES = [
  { label: "Communication", score: 91 },
  { label: "Problem solving", score: 78 },
  { label: "Domain", score: 86 },
  { label: "Overall", score: 84 },
] as const;

function polar(
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

function ringPoints(
  cx: number,
  cy: number,
  radius: number,
  count: number,
) {
  return Array.from({ length: count }, (_, i) => {
    const { x, y } = polar(cx, cy, radius, i, count);
    return `${x},${y}`;
  }).join(" ");
}

function dataPoints(
  cx: number,
  cy: number,
  maxR: number,
  scale: number,
) {
  return AXES.map((axis, i) => {
    const r = (axis.score / 100) * maxR * scale;
    const { x, y } = polar(cx, cy, r, i, AXES.length);
    return `${x},${y}`;
  }).join(" ");
}

/**
 * Large, translucent competency radar for the hero —
 * simple, animated, and see-through so the page still breathes.
 */
export function HeroRadar({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const [scale, setScale] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const size = 520;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.32;
  const labelR = size * 0.4;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setScale(1);
      return;
    }
    setScale(0);
    const start = performance.now();
    const duration = 1400;
    let frame: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setScale(eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion]);

  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-[34rem] items-center justify-center",
        className,
      )}
      aria-hidden={false}
    >
      {/* Soft glow behind the chart */}
      <div
        className="pointer-events-none absolute inset-[12%] rounded-full bg-accent/10 blur-3xl"
        aria-hidden
      />

      <svg
        viewBox={`0 0 ${size} ${size}`}
        className={cn(
          "relative h-auto w-full",
          !reduceMotion && "animate-radar-breathe",
        )}
        role="img"
        aria-label="Competency radar: communication, problem solving, domain knowledge, and overall score"
      >
        <defs>
          <linearGradient
            id={`hero-radar-fill-${uid}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#3d4f5c" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#3d4f5c" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Concentric diamond rings */}
        {[0.28, 0.5, 0.72, 1].map((ring) => (
          <polygon
            key={ring}
            points={ringPoints(cx, cy, maxR * ring, AXES.length)}
            fill="none"
            stroke="rgba(62,52,42,0.12)"
            strokeWidth="1.25"
          />
        ))}

        {/* Axis lines */}
        {AXES.map((_, i) => {
          const { x, y } = polar(cx, cy, maxR, i, AXES.length);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="rgba(62,52,42,0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* Crosshair */}
        <line
          x1={cx}
          y1={cy - maxR}
          x2={cx}
          y2={cy + maxR}
          stroke="rgba(62,52,42,0.05)"
          strokeWidth="1"
        />
        <line
          x1={cx - maxR}
          y1={cy}
          x2={cx + maxR}
          y2={cy}
          stroke="rgba(62,52,42,0.05)"
          strokeWidth="1"
        />

        {/* Score polygon — translucent */}
        <polygon
          points={dataPoints(cx, cy, maxR, scale)}
          fill={`url(#hero-radar-fill-${uid})`}
          stroke="#3d4f5c"
          strokeOpacity="0.55"
          strokeWidth="2.5"
          strokeLinejoin="round"
          style={{ opacity: scale > 0.05 ? 1 : 0 }}
        />

        {/* Vertices */}
        {AXES.map((axis, i) => {
          const r = (axis.score / 100) * maxR * scale;
          const { x, y } = polar(cx, cy, r, i, AXES.length);
          return (
            <circle
              key={axis.label}
              cx={x}
              cy={y}
              r="5"
              fill="#3d4f5c"
              fillOpacity="0.75"
              style={{ opacity: scale > 0.05 ? 1 : 0 }}
            />
          );
        })}

        {/* Axis labels */}
        {AXES.map((axis, i) => {
          const { x, y, angle } = polar(cx, cy, labelR, i, AXES.length);
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const anchor =
            Math.abs(cos) < 0.25 ? "middle" : cos > 0 ? "start" : "end";
          const dy = Math.abs(cos) < 0.25 ? (sin > 0 ? 14 : -6) : 5;
          return (
            <text
              key={`label-${axis.label}`}
              x={x}
              y={y}
              dy={dy}
              textAnchor={anchor}
              className="fill-ink-muted text-[13px] font-semibold uppercase tracking-[0.14em]"
              style={{ fontFamily: "var(--font-sans), Nunito, sans-serif" }}
            >
              {axis.label}
            </text>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 text-xs text-ink-faint sm:bottom-4">
        <span
          className="inline-block h-3 w-3 rounded-sm bg-accent/25 ring-1 ring-accent/35"
          aria-hidden
        />
        Candidate score
      </div>
    </div>
  );
}
