"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/utils/cn";

/** Candidates cycled every 2s — the polygon morphs to each one's profile. */
const CANDIDATES = [
  { name: "Maya Chen", scores: [91, 78, 86, 84] },
  { name: "Jordan Reese", scores: [72, 94, 70, 88] },
  { name: "Aisha Patel", scores: [88, 68, 95, 76] },
  { name: "Diego Alvarez", scores: [65, 82, 74, 92] },
  { name: "Sam Whitfield", scores: [94, 86, 68, 80] },
] as const;

/** Compact labels so side axes never clip. Order: top, right, bottom, left. */
const AXIS_LABELS = ["Communication", "Problem", "Domain", "Overall"] as const;

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

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/**
 * Hero radar — morphing scores, cycling labels, padded so text never clips.
 */
export function HeroRadar({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [scores, setScores] = useState<number[]>([...CANDIDATES[0].scores]);
  const [candidateIdx, setCandidateIdx] = useState(0);
  const [nameOpacity, setNameOpacity] = useState(1);
  const [intro, setIntro] = useState(0);

  // Wide canvas gives left/right labels room; diamond is a bit larger.
  const width = 580;
  const height = 500;
  const cx = width / 2;
  const cy = height / 2;
  const maxR = 168;
  const labelR = 198;
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
      setScores([...CANDIDATES[0].scores]);
      setCandidateIdx(0);
      setNameOpacity(1);
      return;
    }

    let frame: number;
    const start = performance.now();
    // Each candidate holds for 2s; the polygon morphs during the last 25%.
    const CANDIDATE_MS = 2000;
    const MORPH_FRACTION = 0.25;

    const tick = (now: number) => {
      const elapsed = now - start;

      const introT = smoothstep(Math.min(1, elapsed / 900));
      setIntro(introT);

      const cyclePos = elapsed / CANDIDATE_MS;
      const fromIdx = Math.floor(cyclePos) % CANDIDATES.length;
      const toIdx = (fromIdx + 1) % CANDIDATES.length;
      const frac = cyclePos - Math.floor(cyclePos);
      const morphT =
        frac < 1 - MORPH_FRACTION
          ? 0
          : smoothstep((frac - (1 - MORPH_FRACTION)) / MORPH_FRACTION);
      const from = CANDIDATES[fromIdx].scores;
      const to = CANDIDATES[toIdx].scores;

      const nextScores = from.map((v, i) => {
        const base = lerp(v, to[i], morphT);
        const pulse =
          Math.sin(elapsed / 520 + i * 1.7) * 2 +
          Math.sin(elapsed / 780 + i * 0.9) * 1.5;
        return Math.min(98, Math.max(55, base + pulse));
      });
      setScores(nextScores);

      // Show the incoming candidate's name once the morph is halfway there.
      setCandidateIdx(morphT > 0.5 ? toIdx : fromIdx);

      // Fade the name out/in around the switch.
      let opacity = 1;
      if (frac > 1 - MORPH_FRACTION) {
        const mid = 1 - MORPH_FRACTION / 2;
        opacity =
          frac < mid
            ? 1 - (frac - (1 - MORPH_FRACTION)) / (MORPH_FRACTION / 2)
            : (frac - mid) / (MORPH_FRACTION / 2);
      }
      setNameOpacity(Math.max(0, Math.min(1, opacity)));

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion]);

  const polygon = scores
    .map((score, i) => {
      const r = (score / 100) * maxR * intro;
      const { x, y } = polar(cx, cy, r, i, axisCount);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-[34rem] items-center justify-center overflow-visible",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-[10%] rounded-full bg-accent/10 blur-3xl"
        aria-hidden
      />

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="relative h-auto w-full overflow-visible"
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
            points={ringPoints(cx, cy, maxR * ring, axisCount)}
            fill="none"
            stroke="rgba(62,52,42,0.12)"
            strokeWidth="1.25"
          />
        ))}

        {Array.from({ length: axisCount }, (_, i) => {
          const { x, y } = polar(cx, cy, maxR, i, axisCount);
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
        />
        <line
          x1={cx - maxR}
          y1={cy}
          x2={cx + maxR}
          y2={cy}
          stroke="rgba(62,52,42,0.05)"
          strokeWidth="1"
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
          const { x, y } = polar(cx, cy, r, i, axisCount);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="5"
              fill="#3d4f5c"
              fillOpacity="0.75"
              style={{ opacity: intro > 0.05 ? 1 : 0 }}
            />
          );
        })}

        {AXIS_LABELS.map((label, i) => {
          const { x, y, angle } = polar(cx, cy, labelR, i, axisCount);
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const isSide = Math.abs(cos) >= 0.25;
          const anchor = !isSide ? "middle" : cos > 0 ? "start" : "end";
          const dy = !isSide ? (sin > 0 ? 16 : -8) : 5;
          // Nudge side labels inward a touch so they stay inside the viewBox
          const nx = isSide ? x - Math.sign(cos) * 4 : x;
          return (
            <text
              key={`${i}-${label}`}
              x={nx}
              y={y}
              dy={dy}
              textAnchor={anchor}
              className="fill-ink-muted text-[13px] font-semibold uppercase tracking-[0.1em]"
              style={{
                fontFamily: "var(--font-sans), Nunito, sans-serif",
              }}
            >
              {label}
            </text>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute bottom-0 left-1/2 flex -translate-x-1/2 flex-col items-center gap-0.5">
        <span
          className="font-serif text-base font-semibold text-ink"
          style={{ opacity: nameOpacity, transition: "opacity 120ms linear" }}
        >
          {CANDIDATES[candidateIdx].name}
        </span>
        <span className="flex items-center gap-2 text-[11px] text-ink-faint">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm bg-accent/25 ring-1 ring-accent/35"
            aria-hidden
          />
          Candidate competency profile
        </span>
      </div>
    </div>
  );
}
