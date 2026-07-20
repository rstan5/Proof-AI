"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/utils/cn";

/** Score profiles the polygon morphs between — each expands/contracts differently. */
const PROFILES = [
  [91, 78, 86, 84],
  [72, 94, 70, 88],
  [88, 68, 95, 76],
  [65, 82, 74, 92],
  [94, 86, 68, 80],
] as const;

/** Label sets that rotate onto the axes over time. */
const LABEL_SETS = [
  ["Communication", "Problem solving", "Domain", "Overall"],
  ["Clarity", "Judgment", "Craft", "Fit"],
  ["Writing", "Analysis", "Expertise", "Impact"],
  ["Tone", "Priorities", "Knowledge", "Signal"],
] as const;

function polar(
  cx: number,
  cy: number,
  radius: number,
  index: number,
  total: number,
  rotation = 0,
) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2 + rotation;
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
  rotation = 0,
) {
  return Array.from({ length: count }, (_, i) => {
    const { x, y } = polar(cx, cy, radius, i, count, rotation);
    return `${x},${y}`;
  }).join(" ");
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/**
 * Slightly smaller translucent hero radar —
 * polygon keeps morphing; labels rotate and cycle.
 */
export function HeroRadar({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [scores, setScores] = useState<number[]>([...PROFILES[0]]);
  const [rotation, setRotation] = useState(0);
  const [labels, setLabels] = useState<string[]>([...LABEL_SETS[0]]);
  const [labelOpacity, setLabelOpacity] = useState(1);
  const [intro, setIntro] = useState(0);

  const size = 460;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.3;
  const labelR = size * 0.39;
  const axisCount = 4;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setIntro(1);
      setScores([...PROFILES[0]]);
      setLabels([...LABEL_SETS[0]]);
      setRotation(0);
      setLabelOpacity(1);
      return;
    }

    let frame: number;
    const start = performance.now();
    // One full profile morph ~5.5s; label swap every ~4s; slow spin
    const MORPH_MS = 5500;
    const LABEL_MS = 4000;
    const SPIN_RAD_PER_MS = (Math.PI * 2) / 28000; // full turn ~28s

    const tick = (now: number) => {
      const elapsed = now - start;

      // Intro expand
      const introT = smoothstep(Math.min(1, elapsed / 1200));
      setIntro(introT);

      // Morph between profiles with unequal breathing per axis
      const morphPos = (elapsed / MORPH_MS) % PROFILES.length;
      const fromIdx = Math.floor(morphPos) % PROFILES.length;
      const toIdx = (fromIdx + 1) % PROFILES.length;
      const localT = smoothstep(morphPos - fromIdx);
      const from = PROFILES[fromIdx];
      const to = PROFILES[toIdx];

      // Extra independent pulse so axes expand/contract "in different ways"
      const nextScores = from.map((v, i) => {
        const base = lerp(v, to[i], localT);
        const pulse =
          Math.sin(elapsed / 900 + i * 1.7) * 4 +
          Math.sin(elapsed / 1400 + i * 0.9) * 3;
        return Math.min(98, Math.max(55, base + pulse));
      });
      setScores(nextScores);

      // Continuous slow rotation of the whole figure + labels
      setRotation(elapsed * SPIN_RAD_PER_MS);

      // Cycle label sets with a brief fade
      const labelCycle = elapsed / LABEL_MS;
      const labelIdx = Math.floor(labelCycle) % LABEL_SETS.length;
      const labelFrac = labelCycle - Math.floor(labelCycle);
      // Fade out near end of cycle, fade in at start
      let opacity = 1;
      if (labelFrac > 0.82) opacity = 1 - (labelFrac - 0.82) / 0.18;
      else if (labelFrac < 0.12) opacity = labelFrac / 0.12;
      setLabelOpacity(Math.max(0, Math.min(1, opacity)));
      setLabels([...LABEL_SETS[labelIdx]]);

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion]);

  const polygon = scores
    .map((score, i) => {
      const r = (score / 100) * maxR * intro;
      const { x, y } = polar(cx, cy, r, i, axisCount, rotation);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-[28rem] items-center justify-center",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-[14%] rounded-full bg-accent/10 blur-3xl"
        aria-hidden
      />

      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="relative h-auto w-full"
        role="img"
        aria-label="Animated competency radar showing shifting scores and labels"
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

        {[0.28, 0.5, 0.72, 1].map((ring) => (
          <polygon
            key={ring}
            points={ringPoints(cx, cy, maxR * ring, axisCount, rotation)}
            fill="none"
            stroke="rgba(62,52,42,0.12)"
            strokeWidth="1.25"
          />
        ))}

        {Array.from({ length: axisCount }, (_, i) => {
          const { x, y } = polar(cx, cy, maxR, i, axisCount, rotation);
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

        <line
          x1={cx}
          y1={cy - maxR}
          x2={cx}
          y2={cy + maxR}
          stroke="rgba(62,52,42,0.05)"
          strokeWidth="1"
          transform={`rotate(${(rotation * 180) / Math.PI} ${cx} ${cy})`}
        />
        <line
          x1={cx - maxR}
          y1={cy}
          x2={cx + maxR}
          y2={cy}
          stroke="rgba(62,52,42,0.05)"
          strokeWidth="1"
          transform={`rotate(${(rotation * 180) / Math.PI} ${cx} ${cy})`}
        />

        <polygon
          points={polygon}
          fill={`url(#hero-radar-fill-${uid})`}
          stroke="#3d4f5c"
          strokeOpacity="0.55"
          strokeWidth="2.5"
          strokeLinejoin="round"
          style={{ opacity: intro > 0.05 ? 1 : 0 }}
        />

        {scores.map((score, i) => {
          const r = (score / 100) * maxR * intro;
          const { x, y } = polar(cx, cy, r, i, axisCount, rotation);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4.5"
              fill="#3d4f5c"
              fillOpacity="0.75"
              style={{ opacity: intro > 0.05 ? 1 : 0 }}
            />
          );
        })}

        {labels.map((label, i) => {
          const { x, y, angle } = polar(
            cx,
            cy,
            labelR,
            i,
            axisCount,
            rotation,
          );
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const anchor =
            Math.abs(cos) < 0.25 ? "middle" : cos > 0 ? "start" : "end";
          const dy = Math.abs(cos) < 0.25 ? (sin > 0 ? 14 : -6) : 5;
          return (
            <text
              key={`${i}-${label}`}
              x={x}
              y={y}
              dy={dy}
              textAnchor={anchor}
              className="fill-ink-muted text-[12px] font-semibold uppercase tracking-[0.12em]"
              style={{
                fontFamily: "var(--font-sans), Nunito, sans-serif",
                opacity: labelOpacity,
              }}
            >
              {label}
            </text>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-2 text-[11px] text-ink-faint sm:bottom-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-sm bg-accent/25 ring-1 ring-accent/35"
          aria-hidden
        />
        Candidate score
      </div>
    </div>
  );
}
