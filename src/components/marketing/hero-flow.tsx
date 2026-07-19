"use client";

import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

const STEPS = [
  {
    label: "Job description in",
    detail: "Paste the role, competencies, and context.",
  },
  {
    label: "Candidate does real work",
    detail: "Multi-phase simulation with on-screen materials.",
  },
  {
    label: "Competency report out",
    detail: "Scores, strengths, gaps, and a recommendation.",
  },
] as const;

const STEP_MS = 2200;

/** Simple looping step animation for the hero — lighter than the full report specimen. */
export function HeroFlow({ className }: { className?: string }) {
  const [active, setActive] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % STEPS.length);
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion]);

  return (
    <div
      className={cn("relative mx-auto w-full max-w-md", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="pointer-events-none absolute -inset-4 rounded-3xl bg-accent/5 blur-2xl"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-white p-5 shadow-[0_20px_50px_-20px_rgba(44,40,37,0.22)] ring-1 ring-black/[0.04] sm:p-6">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink-faint">
          How Proof AI works
        </p>

        <ol className="mt-4 space-y-3">
          {STEPS.map((step, i) => {
            const isActive = reduceMotion || i === active;
            const isDone = !reduceMotion && i < active;
            return (
              <li
                key={step.label}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-3.5 py-3 transition-all duration-500",
                  isActive
                    ? "border-accent/30 bg-accent/[0.04] shadow-sm"
                    : "border-border-subtle bg-white opacity-70",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors duration-500",
                    isActive
                      ? "bg-accent text-surface"
                      : isDone
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-surface-overlay text-ink-muted",
                  )}
                >
                  {isDone ? "✓" : i + 1}
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-semibold transition-colors duration-500",
                      isActive ? "text-ink" : "text-ink-muted",
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                    {step.detail}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-4 h-1 overflow-hidden rounded-full bg-surface-overlay">
          <div
            className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
            style={{
              width: reduceMotion
                ? "100%"
                : `${((active + 1) / STEPS.length) * 100}%`,
            }}
          />
        </div>

        <p className="mt-3 text-center text-[11px] text-ink-faint">
          One link to the candidate · one report back to you
        </p>
      </div>
    </div>
  );
}
