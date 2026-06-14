"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SimulationRecord } from "@/types/database";

type SimProps = Pick<SimulationRecord, "id" | "company_name" | "role_title" | "generated_prompt">;

type Phase = "intro" | "active" | "submitted";

export function SimulationClient({ simulation }: { simulation: SimProps }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [candidateName, setCandidateName] = useState("");
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningText, setWarningText] = useState("");
  const violationsRef = useRef(0);

  const requestFullscreen = useCallback(async () => {
    if (!document.documentElement.requestFullscreen) return;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // User denied; proceed without fullscreen
    }
  }, []);

  useEffect(() => {
    if (phase !== "active") return;

    const addViolation = (reason: string) => {
      violationsRef.current += 1;
      setViolations(violationsRef.current);
      setWarningText(reason);
      setShowWarning(true);
      requestFullscreen();
    };

    const handleVisibility = () => {
      if (document.hidden) {
        addViolation(
          `Tab switch detected. This incident has been recorded (violation ${violationsRef.current + 1}).`,
        );
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        addViolation(
          `Fullscreen exited. Please remain in the assessment window (violation ${violationsRef.current + 1}).`,
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
  }, [phase, requestFullscreen]);

  async function beginAssessment() {
    await requestFullscreen();
    setPhase("active");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!response.trim()) return;
    setSubmitting(true);
    setSubmitError("");

    const supabase = createClient();
    const { error } = await supabase.from("submissions").insert({
      simulation_id: simulation.id,
      candidate_name: candidateName.trim(),
      response: response.trim(),
      violation_count: violationsRef.current,
    });

    if (error) {
      setSubmitError("Failed to submit. Please try again.");
      setSubmitting(false);
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
    }
    setPhase("submitted");
  }

  if (phase === "submitted") {
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

  if (phase === "intro") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
        <div className="w-full max-w-lg rounded-2xl border border-border-subtle bg-surface-overlay/50 p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
            Secure assessment
          </p>
          <h1 className="mt-2 text-xl font-semibold text-ink">
            {simulation.role_title}
            <span className="block text-base font-normal text-ink-muted mt-0.5">
              {simulation.company_name}
            </span>
          </h1>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-semibold text-amber-800">Before you begin</p>
            <ul className="mt-2 space-y-1 text-xs text-amber-700">
              <li>• This assessment runs in a dedicated fullscreen window</li>
              <li>• Switching tabs or minimising the window will be recorded as a violation</li>
              <li>• Right-clicking is disabled during the assessment</li>
              <li>• Complete the assessment in a single uninterrupted session</li>
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

          <button
            onClick={beginAssessment}
            disabled={!candidateName.trim()}
            className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent text-sm font-semibold text-surface transition hover:bg-accent-muted disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Begin secure assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Violation warning overlay */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-amber-300 bg-amber-50 p-6 text-center shadow-lg">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-amber-900">Violation recorded</p>
            <p className="mt-1.5 text-sm text-amber-800">{warningText}</p>
            {violations >= 3 && (
              <p className="mt-2 text-xs font-semibold text-red-700">
                Multiple violations detected. The recruiter will be notified.
              </p>
            )}
            <button
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

      {/* Assessment header */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border-subtle bg-surface/95 px-4 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-ink">
            {simulation.company_name} · {simulation.role_title}
          </span>
        </div>
        {violations > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {violations} violation{violations !== 1 ? "s" : ""}
          </span>
        )}
      </header>

      {/* Scenario + response */}
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6 lg:flex-row lg:gap-6">
          {/* Scenario */}
          <div className="lg:w-1/2 lg:shrink-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Your scenario
            </p>
            <div
              className="rounded-xl border border-border-subtle bg-surface-overlay/40 p-5 text-sm leading-relaxed text-ink select-none"
              onCopy={(e) => e.preventDefault()}
            >
              {simulation.generated_prompt.split("\n\n").map((para, i) => (
                <p key={i} className={i > 0 ? "mt-3" : ""}>
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Response */}
          <div className="flex flex-1 flex-col lg:min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Your response
            </p>
            <textarea
              required
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Write your response here…"
              className="flex-1 resize-none rounded-xl border border-border-subtle bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />

            {submitError && (
              <p className="mt-2 text-xs text-red-600">{submitError}</p>
            )}

            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-ink-faint">
                {response.trim().split(/\s+/).filter(Boolean).length} words
              </p>
              <button
                type="submit"
                disabled={submitting || !response.trim()}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-surface transition hover:bg-accent-muted disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit response"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
