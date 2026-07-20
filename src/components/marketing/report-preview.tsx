"use client";

import { useEffect, useState } from "react";
import { CompetencyRadarChart } from "@/components/marketing/competency-radar-chart";
import { cn } from "@/utils/cn";

const scoreRows = [
  { label: "Overall", value: 84, letter: "B+" },
  { label: "Communication", value: 91, letter: "A−" },
  { label: "Problem solving", value: 78, letter: "B" },
  { label: "Domain knowledge", value: 86, letter: "A−" },
] as const;

const radarAxes = [
  { label: "Communication", score: 91 },
  { label: "Problem solving", score: 78 },
  { label: "Domain", score: 86 },
  { label: "Overall", score: 84 },
];

const strengths = [
  "Clear structure under time pressure",
  "Uses source materials, not gut feel",
  "Grounds recommendation in the memo numbers",
];

const weaknesses = [
  "Soft on tradeoffs / prioritization",
  "Close / next-step urgency uneven",
  "Could push harder on risk assumptions",
];

const phases = [
  { n: 1, title: "Sector brief", score: 88 },
  { n: 2, title: "Memo analysis", score: 82 },
  { n: 3, title: "Recommendation", score: 85 },
  { n: 4, title: "Stakeholder reply", score: 79 },
] as const;

/**
 * Landing specimen — mirrors the real dashboard CandidateReportCard
 * with extra phase context so visitors see what a full report looks like.
 */
export function ReportPreview({ className }: { className?: string }) {
  const [cycle, setCycle] = useState(0);
  const [barsOn, setBarsOn] = useState(false);
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
    if (reduceMotion) {
      setBarsOn(true);
      return;
    }
    setBarsOn(false);
    const t = window.setTimeout(() => setBarsOn(true), 120);
    return () => window.clearTimeout(t);
  }, [cycle, reduceMotion]);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setInterval(() => {
      setCycle((c) => c + 1);
    }, 9000);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion]);

  return (
    <div
      className={cn("relative mx-auto w-full max-w-3xl", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="pointer-events-none absolute -inset-4 rounded-3xl bg-accent/5 blur-2xl"
        aria-hidden
      />
      <article className="relative overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-[0_20px_50px_-20px_rgba(44,40,37,0.22)] ring-1 ring-black/[0.04]">
        <header className="flex flex-col gap-4 border-b border-border-subtle bg-surface-overlay/80 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-5">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink-faint">
              Competency report — specimen
            </p>
            <p className="mt-1.5 font-serif text-lg font-semibold text-ink sm:text-xl">
              A. Okonkwo
            </p>
            <p className="mt-0.5 text-sm text-ink-muted">
              Financial Analyst · Northline Capital
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] text-ink-faint">
              <span className="rounded-md border border-border-subtle bg-white px-2 py-0.5">
                4 phases · self-paced (time limit)
              </span>
              <span className="rounded-md border border-border-subtle bg-white px-2 py-0.5">
                Submitted Mar 12
              </span>
              <span className="rounded-md border border-border-subtle bg-white px-2 py-0.5">
                0 violations
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            <div className="rounded-xl border border-border-subtle bg-white px-3 py-2 text-center shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                Score
              </p>
              <p
                key={`grade-${cycle}`}
                className="animate-fadeSlide font-serif text-2xl font-semibold text-ink"
              >
                B+
              </p>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
              Strong Interview Candidate
            </span>
            <button
              type="button"
              onClick={() => setCycle((c) => c + 1)}
              className="hidden text-xs font-semibold text-ink-muted transition hover:text-accent sm:inline"
            >
              Replay
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-[1.05fr_1fr]">
          <div className="border-b border-border-subtle px-4 py-5 sm:px-5 lg:border-b-0 lg:border-r">
            <CompetencyRadarChart
              key={`radar-${cycle}`}
              axes={radarAxes}
              size={260}
              title="Competency profile"
              subtitle="Rubric scores from the simulation"
              eager
              durationMs={1600}
              className="[&_svg]:max-w-[240px]"
            />
          </div>

          <div className="flex flex-col">
            <div className="grid grid-cols-2 gap-px bg-border-subtle sm:grid-cols-1">
              {scoreRows.map((row, i) => (
                <div key={row.label} className="bg-white px-4 py-3 sm:px-5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                      {row.label}
                    </span>
                    <span className="font-serif text-lg font-semibold tabular-nums text-ink sm:text-xl">
                      {row.value}
                      <span className="ml-1.5 text-[11px] font-sans font-semibold text-ink-faint">
                        {row.letter}
                      </span>
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-overlay">
                    <div
                      className={cn(
                        "h-full rounded-full transition-[width] duration-[1600ms] ease-out",
                        row.value >= 85
                          ? "bg-emerald-600"
                          : row.value >= 70
                            ? "bg-accent"
                            : "bg-rose-500",
                      )}
                      style={{
                        width: barsOn ? `${row.value}%` : "0%",
                        transitionDelay: reduceMotion
                          ? "0ms"
                          : `${180 + i * 140}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Phase breakdown — mirrors what recruiters scan after scores */}
        <div className="border-t border-border-subtle px-5 py-4 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            Phase breakdown
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            {phases.map((p, i) => (
              <div
                key={p.n}
                className="rounded-xl border border-border-subtle bg-surface/60 px-3 py-2.5"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                  Phase {p.n}
                </p>
                <p className="mt-0.5 truncate text-xs font-semibold text-ink">
                  {p.title}
                </p>
                <p
                  key={`phase-${cycle}-${p.n}`}
                  className="mt-1 font-serif text-base font-semibold tabular-nums text-ink"
                  style={{
                    opacity: barsOn ? 1 : 0,
                    transition: reduceMotion
                      ? undefined
                      : `opacity 0.4s ease ${220 + i * 100}ms`,
                  }}
                >
                  {p.score}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-px border-t border-border-subtle bg-border-subtle sm:grid-cols-2">
          <div className="bg-white px-5 py-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
              Strengths
            </p>
            <ul className="mt-2 space-y-1.5">
              {strengths.map((s) => (
                <li key={s} className="text-sm leading-snug text-ink-muted">
                  + {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white px-5 py-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
              Weaknesses
            </p>
            <ul className="mt-2 space-y-1.5">
              {weaknesses.map((w) => (
                <li key={w} className="text-sm leading-snug text-ink-muted">
                  − {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <blockquote className="border-t border-border-subtle px-5 py-4 sm:px-6 sm:py-5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            Hiring note
          </p>
          <p className="mt-2 border-l-2 border-accent pl-4 text-sm leading-relaxed text-ink">
            Uses the memo and table correctly, communicates clearly, and lands a
            usable recommendation. Interview — coach judgment under ambiguity
            before putting them on live deals.
          </p>
        </blockquote>

        <footer className="flex items-center justify-between gap-2 border-t border-border-subtle bg-surface/50 px-5 py-2.5 text-[11px] text-ink-muted sm:px-6">
          <span>
            <span className="font-semibold text-accent">Recommend</span>
            <span className="text-ink-faint"> · </span>
            Strong Interview Candidate
          </span>
          <span className="text-ink-faint">
            {paused ? "Paused" : "Animating"} · mirrors dashboard report
          </span>
        </footer>
      </article>
      <p className="mt-3 text-center text-xs text-ink-faint">
        Sample output — same structure as the live candidate report in your
        dashboard
      </p>
    </div>
  );
}
