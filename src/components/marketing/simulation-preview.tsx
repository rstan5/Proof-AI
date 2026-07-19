"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";

type PhaseId = 0 | 1 | 2;

const PHASES: {
  id: PhaseId;
  label: string;
  title: string;
  materials: {
    kind: string;
    title: string;
    meta?: string;
    body: ReactNode;
  }[];
  deliverableLabel: string;
  typedAnswer: string;
}[] = [
  {
    id: 0,
    label: "Research",
    title: "Prioritize accounts from the sector report",
    materials: [
      {
        kind: "Inbox · Email",
        title: "Re: Q3 Sector Report — prioritize accounts",
        meta: "From: jordan.lee@northline.io",
        body: (
          <p>
            Use the sector report on-screen. Rank five mid-market accounts and
            flag who to call first this week.
          </p>
        ),
      },
      {
        kind: "Internal memo",
        title: "Q3 Sector Report · Healthcare SaaS",
        body: (
          <ul className="list-disc space-y-0.5 pl-4">
            <li>Win rate 32% in healthcare vs 21% overall</li>
            <li>Best ACV in 50–200 seat accounts ($48k)</li>
            <li>Top objection: budget freeze until October</li>
          </ul>
        ),
      },
    ],
    deliverableLabel: "Ranked account list + first call",
    typedAnswer:
      "1) HelioHealth — 32% win rate, $48k ACV\n2) BrightClaim — mid-market fit\nCall first: HelioHealth VP Ops Tue AM",
  },
  {
    id: 1,
    label: "Outreach",
    title: "Draft personalized cold email",
    materials: [
      {
        kind: "CRM record",
        title: "Account: HelioHealth",
        meta: "120 seats · Epic + custom billing",
        body: (
          <p>
            Champion: Maya Chen, VP Ops. Last touch: none. Trigger: rising denial
            rates in Q2 claims ops.
          </p>
        ),
      },
      {
        kind: "Slack",
        title: "#sales-tips",
        body: (
          <div className="space-y-1.5">
            <p className="rounded-md bg-surface px-2 py-1">
              [9:01] Jordan: HelioHealth hates generic decks.
            </p>
            <p className="rounded-md bg-surface px-2 py-1">
              [9:02] Jordan: Lead with claims denial savings.
            </p>
          </div>
        ),
      },
    ],
    deliverableLabel: "Subject + email body",
    typedAnswer:
      "Subject: Cutting HelioHealth denial costs?\nMaya — noticed Q2 denial spike. Mid-market teams recover cost in ~90 days. Open to 20 min next Tue?",
  },
  {
    id: 2,
    label: "Objections",
    title: "Handle the budget freeze",
    materials: [
      {
        kind: "Call notes",
        title: "Discovery with Maya Chen",
        meta: "Yesterday · 14 min",
        body: (
          <p>
            “Interesting product, but budget is frozen until October. Send
            something only if there’s a clear ROI path.”
          </p>
        ),
      },
      {
        kind: "Internal memo",
        title: "Objection playbook snippet",
        body: (
          <ul className="list-disc space-y-0.5 pl-4">
            <li>Reframe freeze as timing, not fit</li>
            <li>Anchor on 90-day payback + exec briefing</li>
            <li>Ask for soft commit, not purchase order</li>
          </ul>
        ),
      },
    ],
    deliverableLabel: "Objection reply + next step",
    typedAnswer:
      "Budget freeze is fair — customers like yours see payback inside 90 days via denial reduction. Could we hold a 20-min exec briefing the first week of Oct?",
  },
];

function useTypewriter(text: string, active: boolean, cps = 28) {
  const [out, setOut] = useState("");

  useEffect(() => {
    if (!active) {
      setOut("");
      return;
    }
    setOut("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, Math.max(12, 1000 / cps));
    return () => window.clearInterval(id);
  }, [text, active, cps]);

  return out;
}

/** Interactive multi-phase simulation specimen for marketing. */
export function SimulationPreview({ className }: { className?: string }) {
  const [phase, setPhase] = useState<PhaseId>(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const current = PHASES[phase];
  const typed = useTypewriter(current.typedAnswer, !reduceMotion, 85);
  const displayAnswer = reduceMotion ? current.typedAnswer : typed;
  const typingDone =
    reduceMotion || displayAnswer.length >= current.typedAnswer.length;

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
      setPhase((p) => ((p + 1) % PHASES.length) as PhaseId);
    }, 2000);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion, phase]);

  function goTo(next: PhaseId) {
    setPaused(true);
    setPhase(next);
  }

  return (
    <div
      className={cn("relative mx-auto w-full max-w-lg lg:max-w-3xl", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-accent/5 blur-2xl"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-[#f7f5f1] shadow-[0_24px_60px_-28px_rgba(44,40,37,0.35)] ring-1 ring-black/[0.04]">
        <header className="flex items-center justify-between gap-3 border-b border-border-subtle bg-[#2c2825] px-4 py-2.5 text-white">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium tracking-wide text-white/70">
              Proof AI · Secure assessment
            </p>
            <p className="truncate text-sm font-semibold">
              Example role · Sales
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-[10px] text-white/50">
              Phase {phase + 1}/{PHASES.length}
            </p>
            <p className="text-[11px] font-medium text-emerald-300/90">
              {current.label}
            </p>
          </div>
        </header>

        <div className="border-b border-border-subtle bg-white px-3 py-2">
          <div className="mb-2 flex gap-1.5">
            {PHASES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => goTo(p.id)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-semibold transition",
                  phase === p.id
                    ? "bg-accent text-surface"
                    : "bg-surface text-ink-muted hover:bg-surface-overlay hover:text-ink",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-overlay">
            <div
              className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
              style={{ width: `${((phase + 1) / PHASES.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="min-h-[22rem] p-3 sm:min-h-[23.5rem] sm:p-4">
          <p className="mb-3 text-xs font-semibold text-ink">{current.title}</p>

          <div key={`mats-${phase}`} className="grid gap-2.5">
            {current.materials.map((m) => (
              <article
                key={`${phase}-${m.title}`}
                className="animate-fadeSlide overflow-hidden rounded-xl border border-border-subtle bg-white shadow-sm"
              >
                <div className="border-b border-border-subtle bg-[#f3f1ec] px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                    {m.kind}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-ink">{m.title}</p>
                  {m.meta && (
                    <p className="mt-0.5 text-[10px] text-ink-muted">{m.meta}</p>
                  )}
                </div>
                <div className="px-3 py-2 text-[11px] leading-relaxed text-ink">
                  {m.body}
                </div>
              </article>
            ))}

            <article className="animate-fadeSlide overflow-hidden rounded-xl border border-accent/25 bg-white shadow-sm ring-1 ring-accent/10">
              <div className="flex items-center justify-between gap-2 border-b border-border-subtle px-3 py-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                    Your deliverable
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-ink">
                    {current.deliverableLabel}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    typingDone
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-amber-50 text-amber-800",
                  )}
                >
                  {typingDone ? "Submitted" : "Typing…"}
                </span>
              </div>
              <div className="min-h-[5.25rem] whitespace-pre-wrap px-3 py-2 font-mono text-[11px] leading-relaxed text-ink">
                {displayAnswer}
                {!typingDone && (
                  <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-accent align-middle" />
                )}
              </div>
            </article>
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-border-subtle bg-white px-4 py-2.5 text-[11px] text-ink-muted">
          <span>
            {paused ? "Paused — click a phase" : "Live preview · auto-plays"}
          </span>
          <span className="font-medium text-ink">
            Fullscreen · on-screen materials
          </span>
        </footer>
      </div>
    </div>
  );
}
