"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { SimulationRecord } from "@/types/database";
import { parseSimulationContent } from "@/lib/simulation-structure";
import { MaterialsPanel } from "@/components/sim/materials-panel";

type SimProps = Pick<
  SimulationRecord,
  "id" | "company_name" | "role_title" | "generated_prompt"
>;

type Screen = "intro" | "active" | "submitted" | "voided";

function formatBody(text: unknown) {
  const value = typeof text === "string" ? text : text == null ? "" : String(text);
  return value.split(/\n\n+/).filter(Boolean);
}

export function SimulationClient({ simulation }: { simulation: SimProps }) {
  const structured = useMemo(
    () => parseSimulationContent(simulation.generated_prompt),
    [simulation.generated_prompt],
  );
  const phases = structured.phases;

  const [screen, setScreen] = useState<Screen>("intro");
  const [candidateName, setCandidateName] = useState("");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() =>
    phases.map(() => ""),
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningText, setWarningText] = useState("");
  const [beginError, setBeginError] = useState("");
  const violationsRef = useRef(0);
  const allowFullscreenExitRef = useRef(false);
  const voidingRef = useRef(false);

  const current = phases[phaseIndex];
  const isLast = phaseIndex >= phases.length - 1;
  const currentAnswer = answers[phaseIndex] ?? "";

  const requestFullscreen = useCallback(async () => {
    if (!document.documentElement.requestFullscreen) {
      throw new Error("Fullscreen is required for this assessment.");
    }
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    }
  }, []);

  const voidAssessment = useCallback(
    async (reason: string) => {
      if (voidingRef.current || allowFullscreenExitRef.current) return;
      voidingRef.current = true;
      allowFullscreenExitRef.current = true;

      violationsRef.current += 1;
      setViolations(violationsRef.current);
      setScreen("voided");
      setShowWarning(false);

      const partial = phases
        .map((p, i) => {
          const body = (answers[i] ?? "").trim();
          if (!body) return null;
          return [
            `PHASE ${p.number}: ${p.title}`,
            `Competency: ${p.competency}`,
            "",
            body,
          ].join("\n");
        })
        .filter(Boolean)
        .join("\n\n---\n\n");

      try {
        await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            simulation_id: simulation.id,
            candidate_name: candidateName.trim() || "Unknown candidate",
            response: [
              "[ASSESSMENT VOIDED]",
              `Reason: ${reason}`,
              "",
              partial || "(No phase responses completed before void.)",
            ].join("\n"),
            violation_count: Math.max(1, violationsRef.current),
            voided: true,
          }),
        });
      } catch (err) {
        console.error("Failed to record voided assessment:", err);
      }
    },
    [answers, candidateName, phases, simulation.id],
  );

  useEffect(() => {
    if (screen !== "active") return;

    const addTabViolation = (reason: string) => {
      violationsRef.current += 1;
      setViolations(violationsRef.current);
      setWarningText(reason);
      setShowWarning(true);
      void requestFullscreen().catch(() => {
        void voidAssessment(
          "Fullscreen required — candidate left or refused fullscreen after a tab switch.",
        );
      });
    };

    const handleVisibility = () => {
      if (document.hidden) {
        addTabViolation(
          `Tab switch detected. This incident has been recorded (violation ${violationsRef.current + 1}). Leaving fullscreen will void the assessment.`,
        );
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !allowFullscreenExitRef.current) {
        void voidAssessment(
          "Candidate exited fullscreen during the secure assessment.",
        );
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [screen, requestFullscreen, voidAssessment]);

  function setCurrentAnswer(value: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[phaseIndex] = value;
      return next;
    });
  }

  async function beginAssessment() {
    setBeginError("");
    try {
      await requestFullscreen();
    } catch {
      setBeginError(
        "Fullscreen is required. Allow fullscreen and try again — exiting it during the assessment will void your attempt.",
      );
      return;
    }
    if (!document.fullscreenElement) {
      setBeginError(
        "Fullscreen is required to begin. Exiting fullscreen during the assessment voids your attempt.",
      );
      return;
    }
    allowFullscreenExitRef.current = false;
    voidingRef.current = false;
    setScreen("active");
    setPhaseIndex(0);
  }

  function goNext() {
    if (!currentAnswer.trim()) return;
    if (isLast) {
      const incomplete = answers.findIndex((a, i) => !a.trim() && i !== phaseIndex);
      if (incomplete >= 0 || !currentAnswer.trim()) {
        setSubmitError(
          `Phase ${incomplete >= 0 ? incomplete + 1 : phaseIndex + 1} still needs a response before you can submit.`,
        );
        if (incomplete >= 0) setPhaseIndex(incomplete);
        return;
      }
      void submitAll();
      return;
    }
    setSubmitError("");
    setPhaseIndex((i) => i + 1);
  }

  function goBack() {
    if (phaseIndex > 0) {
      setSubmitError("");
      setPhaseIndex((i) => i - 1);
    }
  }

  async function submitAll() {
    setSubmitting(true);
    setSubmitError("");

    const missing = answers.findIndex((a) => !a.trim());
    if (missing >= 0) {
      setSubmitError(`Phase ${missing + 1} still needs a response.`);
      setPhaseIndex(missing);
      setSubmitting(false);
      return;
    }

    const combined = phases
      .map((p, i) => {
        const body = (answers[i] ?? "").trim();
        return [
          `PHASE ${p.number}: ${p.title}`,
          `Competency: ${p.competency}`,
          `Deliverable: ${p.deliverable}`,
          "",
          body,
        ].join("\n");
      })
      .join("\n\n---\n\n");

    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        simulation_id: simulation.id,
        candidate_name: candidateName.trim(),
        response: combined,
        violation_count: violationsRef.current,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      evaluated?: boolean;
    };

    if (!res.ok) {
      setSubmitError(data.error ?? "Failed to submit. Please try again.");
      setSubmitting(false);
      return;
    }

    allowFullscreenExitRef.current = true;
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
    }
    setScreen("submitted");
  }

  if (screen === "voided") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
        <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-rose-50/80 p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
            <svg
              className="h-5 w-5 text-rose-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <p className="text-base font-semibold text-rose-950">
            Assessment voided
          </p>
          <p className="mt-2 text-sm text-rose-900/80">
            You left fullscreen during the secure session. This attempt has been
            voided and reported to the recruiting team. You cannot continue from
            here.
          </p>
          <p className="mt-4 text-xs text-rose-800/70">
            Contact the recruiter if you need a new invite link.
          </p>
        </div>
      </div>
    );
  }

  if (screen === "submitted") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
        <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-overlay/50 p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-5 w-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-base font-semibold text-ink">Assessment submitted</p>
          <p className="mt-2 text-sm text-ink-muted">
            Thank you, {candidateName}. Your response has been received and will be reviewed by the recruiting team.
          </p>
          <p className="mt-4 text-xs text-ink-faint">You may now close this window.</p>
        </div>
      </div>
    );
  }

  if (screen === "intro") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-10">
        <div className="w-full max-w-lg rounded-2xl border border-border-subtle bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
            Secure assessment
          </p>
          <h1 className="mt-2 font-serif text-xl font-semibold text-ink">
            {simulation.role_title}
            <span className="mt-0.5 block text-base font-sans font-normal text-ink-muted">
              {simulation.company_name}
            </span>
          </h1>

          {structured.overview && (
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              {structured.overview}
            </p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border-subtle bg-surface/60 px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                Session limit
              </p>
              <p className="mt-1 font-serif text-lg font-semibold text-ink">
                Up to {structured.total_minutes} min
              </p>
            </div>
            <div className="rounded-xl border border-border-subtle bg-surface/60 px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                Phases
              </p>
              <p className="mt-1 font-serif text-lg font-semibold text-ink">
                {phases.length}
              </p>
            </div>
          </div>

          <ol className="mt-5 space-y-2">
            {phases.map((p) => (
              <li
                key={p.number}
                className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface/40 px-3 py-2 text-sm"
              >
                <span className="font-medium text-ink">
                  {p.number}. {p.title}
                </span>
                <span className="text-xs text-ink-faint">~{p.minutes} min</span>
              </li>
            ))}
          </ol>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-semibold text-amber-800">Before you begin</p>
            <ul className="mt-2 space-y-1 text-xs text-amber-700">
              <li>• Complete phases in order — one phase at a time</li>
              <li>
                • Suggested phase times are pacing guides — finish at your own
                speed within the session limit
              </li>
              <li>• Fullscreen is required for the entire assessment</li>
              <li>
                • Exiting fullscreen voids your attempt immediately and notifies
                the recruiter
              </li>
              <li>• Switching tabs is recorded as a violation</li>
              <li>• Right-clicking is disabled during the assessment</li>
            </ul>
          </div>

          <div className="mt-6">
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">
              Your full name
            </label>
            <input
              type="text"
              required
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {beginError && (
            <p className="mt-3 text-xs text-red-600">{beginError}</p>
          )}

          <button
            type="button"
            onClick={() => void beginAssessment()}
            disabled={!candidateName.trim()}
            className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent text-sm font-semibold text-surface transition hover:bg-accent-muted disabled:opacity-50"
          >
            Enter fullscreen & begin phase 1
          </button>
        </div>
      </div>
    );
  }

  const progress = ((phaseIndex + 1) / phases.length) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-amber-300 bg-amber-50 p-6 text-center shadow-lg">
            <p className="text-sm font-semibold text-amber-900">Violation recorded</p>
            <p className="mt-1.5 text-sm text-amber-800">{warningText}</p>
            {violations >= 3 && (
              <p className="mt-2 text-xs font-semibold text-red-700">
                Multiple violations detected. The recruiter will be notified.
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                setShowWarning(false);
                requestFullscreen();
              }}
              className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-lg bg-accent text-sm font-semibold text-surface transition hover:bg-accent-muted"
            >
              Return to assessment
            </button>
          </div>
        </div>
      )}

      <header className="shrink-0 border-b border-border-subtle bg-surface/95 backdrop-blur-sm">
        <div className="flex h-12 items-center justify-between px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span className="truncate text-xs font-semibold text-ink">
              {simulation.company_name} · {simulation.role_title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-ink-muted">
              Phase {phaseIndex + 1} of {phases.length}
            </span>
            {violations > 0 && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                {violations} violation{violations !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <div className="h-1 w-full bg-surface-overlay">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6 lg:flex-row lg:gap-6">
        {/* Phase brief */}
        <div className="lg:w-[48%] lg:shrink-0">
          <div className="overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-sm">
            <div className="border-b border-border-subtle bg-surface-overlay/50 px-5 py-4">
              <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                Phase {current.number} · ~{current.minutes} min suggested
              </p>
              <h2 className="mt-1 font-serif text-xl font-semibold text-ink">
                {current.title}
              </h2>
              {current.competency && (
                <p className="mt-2 inline-flex rounded-full border border-border-subtle bg-white px-2.5 py-0.5 text-[11px] font-semibold text-ink-muted">
                  Focus: {current.competency}
                </p>
              )}
            </div>

            <div className="space-y-5 px-5 py-5 text-sm leading-relaxed text-ink select-none" onCopy={(e) => e.preventDefault()}>
              {phaseIndex === 0 && structured.materials_provided && (
                <Section label="Background">
                  {formatBody(structured.materials_provided).map((p, i) => (
                    <p key={i} className={i > 0 ? "mt-2 text-ink-muted" : "text-ink-muted"}>
                      {p}
                    </p>
                  ))}
                </Section>
              )}

              <Section label="Situation">
                {formatBody(current.situation).map((p, i) => (
                  <p key={i} className={i > 0 ? "mt-2 text-ink-muted" : "text-ink-muted"}>
                    {p}
                  </p>
                ))}
              </Section>

              <Section label="Source materials (use these)">
                <p className="mb-3 text-xs text-ink-muted">
                  Everything you need is on this screen. Read the emails, reports, chats, and tables below — there are no downloads.
                </p>
                <MaterialsPanel artifacts={current.artifacts} />
              </Section>

              <Section label="Your task">
                <p className="font-medium text-ink">{current.task}</p>
              </Section>

              <Section label="Deliverable">
                <p className="text-ink-muted">{current.deliverable}</p>
              </Section>

              <Section label="Success criteria">
                <p className="text-ink-muted">{current.success_criteria}</p>
              </Section>
            </div>
          </div>
        </div>

        {/* Response */}
        <div className="flex min-h-[320px] flex-1 flex-col lg:min-w-0">
          <div className="flex flex-1 flex-col rounded-2xl border border-border-subtle bg-white p-4 shadow-sm sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Your response for this phase
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              Type your full answer here — email reply, short memo, pitch text, notes, etc. Use only the materials on the left. You can go back before the final submit.
            </p>
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder={`Write your ${current.deliverable || "response"} here…`}
              className="mt-3 min-h-[220px] flex-1 resize-none rounded-xl border border-border-subtle bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />

            {submitError && (
              <p className="mt-2 text-xs text-red-600">{submitError}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-ink-faint">
                {currentAnswer.trim().split(/\s+/).filter(Boolean).length} words
              </p>
              <div className="flex items-center gap-2">
                {phaseIndex > 0 && (
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={submitting}
                    className="inline-flex h-9 items-center rounded-lg border border-border-subtle px-4 text-sm font-medium text-ink-muted transition hover:bg-surface-overlay hover:text-ink disabled:opacity-50"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={goNext}
                  disabled={submitting || !currentAnswer.trim()}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-surface transition hover:bg-accent-muted disabled:opacity-50"
                >
                  {submitting
                    ? "Submitting…"
                    : isLast
                      ? "Submit assessment"
                      : "Continue to next phase"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
        {label}
      </p>
      {children}
    </div>
  );
}
