"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/branding/logo";
import { cn } from "@/utils/cn";
import type {
  CandidateRow,
  CompanyProfile,
  DashboardAnalytics,
  SimulationRecord,
} from "@/types/database";
import {
  FREE_SAMPLE_LIMIT,
  MONTHLY_LIMIT_CODE,
  SAMPLE_LIMIT_CODE,
} from "@/lib/free-tier";

type SimRow = Pick<
  SimulationRecord,
  "id" | "company_name" | "role_title" | "created_at"
>;

type Tab = "candidates" | "simulate" | "analytics";

interface Props {
  userEmail: string;
  profile: CompanyProfile | null;
  candidates: CandidateRow[];
  simulations: SimRow[];
  analytics: DashboardAnalytics;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "candidates", label: "Candidates" },
  { id: "simulate", label: "Free sample" },
  { id: "analytics", label: "Analytics" },
];

export function DashboardShell({
  userEmail,
  profile,
  candidates,
  simulations,
  analytics,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const tab: Tab =
    rawTab === "simulate" || rawTab === "analytics" || rawTab === "candidates"
      ? rawTab
      : "candidates";

  function setTab(next: Tab) {
    router.push(`/dashboard?tab=${next}`);
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="hidden w-56 shrink-0 border-r border-border-subtle bg-surface px-4 py-6 md:block">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-2 font-semibold text-ink transition hover:text-accent"
        >
          <LogoMark size={32} decorative />
          <span className="font-serif">Proof AI</span>
        </Link>
        {profile && (
          <p className="mt-6 px-2 text-xs text-ink-muted">
            <span className="font-semibold text-ink">{profile.company_name}</span>
            <br />
            {profile.role_at_company}
          </p>
        )}
        <nav className="mt-8 space-y-1">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={
                tab === item.id
                  ? "block w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-left text-sm font-semibold text-ink shadow-sm"
                  : "block w-full rounded-lg px-3 py-2 text-left text-sm text-ink-muted transition hover:bg-surface-overlay hover:text-ink"
              }
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border-subtle bg-surface/80 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-3 md:hidden">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "text-xs font-semibold",
                  tab === item.id ? "text-ink" : "text-ink-muted",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <h1 className="hidden text-sm font-semibold text-ink md:block">
            Company dashboard
          </h1>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-ink-faint sm:block">{userEmail}</span>
            <button
              type="button"
              onClick={signOut}
              className="text-xs text-ink-muted transition hover:text-ink"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-5xl">
            {tab === "candidates" && (
              <CandidatesTab candidates={candidates} />
            )}
            {tab === "simulate" && (
              <SimulateTab
                profile={profile}
                simulations={simulations}
                onCreated={() => router.refresh()}
              />
            )}
            {tab === "analytics" && (
              <AnalyticsTab analytics={analytics} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function CandidatesTab({ candidates }: { candidates: CandidateRow[] }) {
  if (candidates.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface-overlay/40 p-12 text-center">
        <p className="text-sm font-semibold text-ink">No candidate reports yet</p>
        <p className="mt-2 text-sm text-ink-muted">
          Generate a simulation and share the link. When candidates complete it,
          their competency reports will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h2 className="text-base font-semibold text-ink">Candidates</h2>
        <p className="mt-0.5 text-sm text-ink-muted">
          Everyone who completed a simulation and received a competency report.
        </p>
      </div>
      <ul className="mt-6 space-y-3">
        {candidates.map((c) => {
          const evalJson = c.evaluation_json;
          const roleTitle = c.simulation?.role_title ?? "Role";
          const companyName = c.simulation?.company_name ?? "Company";
          return (
            <li
              key={c.id}
              className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-ink">{c.candidate_name}</p>
                <p className="text-sm text-ink-muted">
                  {roleTitle} · {companyName}
                </p>
                <p className="mt-1 text-xs text-ink-faint">
                  {new Date(c.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {evalJson
                    ? evalJson.recommendation.startsWith("Voided")
                      ? " · Voided"
                      : ` · Score ${evalJson.overall_score}/100`
                    : " · Evaluating…"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {evalJson && (
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                      evalJson.recommendation === "Strong Interview Candidate"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : evalJson.recommendation === "Interview with Reservations"
                          ? "border-amber-200 bg-amber-50 text-amber-800"
                          : evalJson.recommendation.startsWith("Voided")
                            ? "border-rose-300 bg-rose-50 text-rose-900"
                            : "border-rose-200 bg-rose-50 text-rose-800",
                    )}
                  >
                    {evalJson.recommendation}
                  </span>
                )}
                <Link
                  href={`/dashboard/candidates/${c.id}`}
                  className="inline-flex h-8 items-center rounded-lg border border-border-subtle px-3 text-xs font-medium text-ink transition hover:bg-surface-overlay"
                >
                  View report
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SimulateTab({
  profile,
  simulations,
  onCreated,
}: {
  profile: CompanyProfile | null;
  simulations: SimRow[];
  onCreated: () => void;
}) {
  const sampleUsed = simulations.length >= FREE_SAMPLE_LIMIT;
  const [form, setForm] = useState({
    company_name: profile?.company_name ?? "",
    role_title: "",
    job_description: "",
    looking_for: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [generatedId, setGeneratedId] = useState<string | null>(
    simulations[0]?.id ?? null,
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sampleUsed) {
      setShowLimitModal(true);
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 280_000);

    let res: Response;
    try {
      res = await fetch("/api/simulations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      const aborted =
        err instanceof DOMException && err.name === "AbortError";
      setErrorMsg(
        aborted
          ? "Generation timed out. Please try again — it can take a couple of minutes."
          : "Network error while generating. Please try again.",
      );
      setStatus("error");
      return;
    }
    clearTimeout(timeout);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        code?: string;
        details?: string[];
      };
      if (
        data.code === SAMPLE_LIMIT_CODE ||
        data.code === MONTHLY_LIMIT_CODE ||
        res.status === 403
      ) {
        setShowLimitModal(true);
        setStatus("idle");
        return;
      }
      const detail =
        Array.isArray(data.details) && data.details.length
          ? ` (${data.details.slice(0, 2).join("; ")})`
          : "";
      setErrorMsg(`${data.error ?? "Generation failed."}${detail}`);
      setStatus("error");
      return;
    }

    const data = await res.json();
    setGeneratedId((data as { id: string }).id);
    setStatus("success");
    onCreated();
  }

  function copyLink(id: string) {
    const link = `${window.location.origin}/sim/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const sampleLinkId = generatedId ?? simulations[0]?.id ?? null;
  const sampleLinkHref = sampleLinkId ? `/sim/${sampleLinkId}` : "";

  return (
    <div>
      <div>
        <h2 className="text-base font-semibold text-ink">New simulation</h2>
        <p className="mt-0.5 text-sm text-ink-muted">
          Describe the role and required competencies. Proof AI generates a
          rigorous, multi-phase assessment mapped to the skills you need.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-2xl border border-border-subtle bg-white p-6 shadow-sm"
      >
        <SimField
          label="Company name"
          value={form.company_name}
          onChange={(v) => update("company_name", v)}
          placeholder="Acme Corp"
        />
        <SimField
          label="Job title"
          value={form.role_title}
          onChange={(v) => update("role_title", v)}
          placeholder="Senior Account Executive"
        />
        <SimField
          label="Job description"
          value={form.job_description}
          onChange={(v) => update("job_description", v)}
          placeholder="Responsibilities, team context, day-to-day work…"
          multiline
          rows={4}
        />
        <SimField
          label="What you're looking for in a candidate"
          value={form.looking_for}
          onChange={(v) => update("looking_for", v)}
          placeholder="Competencies, skills, traits to validate in the simulation…"
          multiline
          rows={3}
        />

        {status === "error" && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            {errorMsg}
          </p>
        )}

        {status === "success" && generatedId && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3">
            <p className="text-sm font-semibold text-emerald-900">
              Simulation ready
            </p>
            <p className="mt-1 text-xs text-emerald-800">
              Share this link with your candidate (or open it yourself to try the
              full flow):
            </p>
            <div className="mt-2 flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate font-mono text-xs text-ink">
                {sampleLinkHref}
              </p>
              <button
                type="button"
                onClick={() => copyLink(generatedId)}
                className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-surface"
              >
                {copiedId === generatedId ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-surface transition hover:bg-accent-muted disabled:opacity-60"
        >
          {status === "loading"
            ? "Generating… (1–2 min)"
            : "Generate free sample"}
        </button>
      </form>

      {sampleLinkId ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-900">
            Your sample link
          </p>
          <div className="mt-2 flex items-center gap-2">
            <p className="min-w-0 flex-1 truncate font-mono text-xs text-ink">
              {sampleLinkHref}
            </p>
            <button
              type="button"
              onClick={() => copyLink(sampleLinkId)}
              className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-surface"
            >
              {copiedId === sampleLinkId ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      ) : null}

      {simulations.length > 0 && (
        <div className="mt-10">
          <h3 className="text-sm font-semibold text-ink">Your simulations</h3>
          <ul className="mt-3 space-y-2">
            {simulations.slice(0, 5).map((sim) => (
              <li
                key={sim.id}
                className="flex items-center justify-between rounded-lg border border-border-subtle bg-white px-4 py-3 text-sm"
              >
                <span className="text-ink">
                  {sim.role_title}
                  <span className="text-ink-muted"> · {sim.company_name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => copyLink(sim.id)}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  {copiedId === sim.id ? "Copied" : "Copy link"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-white p-6 shadow-lg">
            <p className="text-base font-semibold text-ink">
              Upgrade to keep generating
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Your free sample is used up — or you&apos;ve hit this month&apos;s
              plan limit. Choose Small Business or Enterprise on the pricing
              page to continue.
            </p>
            <Link
              href="/pricing"
              className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-lg bg-accent text-sm font-semibold text-surface transition hover:bg-accent-muted"
            >
              View pricing
            </Link>
            <button
              type="button"
              onClick={() => setShowLimitModal(false)}
              className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg border border-border-subtle text-sm font-medium text-ink-muted transition hover:bg-surface-overlay hover:text-ink"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyticsTab({ analytics }: { analytics: DashboardAnalytics }) {
  const metrics = [
    { label: "Hire suggestion rate", value: `${analytics.hireSuggestionRate}%`, hint: "Strong interview candidate" },
    { label: "Avg overall score", value: `${analytics.avgOverallScore}`, hint: "Across evaluated candidates" },
    { label: "Total candidates", value: `${analytics.totalCandidates}`, hint: "Completed simulations" },
    { label: "Evaluated", value: `${analytics.evaluatedCandidates}`, hint: "Reports generated" },
  ];

  return (
    <div>
      <div>
        <h2 className="text-base font-semibold text-ink">Analytics</h2>
        <p className="mt-0.5 text-sm text-ink-muted">
          Hiring signal across your candidate pool — recommendation rates,
          competency averages, and applicant archetypes.
        </p>
      </div>

      {analytics.totalCandidates === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface-overlay/40 p-10 text-center">
          <p className="text-sm text-ink-muted">
            Analytics will populate once candidates complete simulations.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-border-subtle bg-white p-4 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  {m.label}
                </p>
                <p className="mt-1 font-serif text-3xl font-semibold text-accent">
                  {m.value}
                </p>
                <p className="mt-1 text-[11px] text-ink-faint">{m.hint}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-ink">
                Recommendation breakdown
              </h3>
              <ul className="mt-4 space-y-3">
                {[
                  { label: "Strong interview", pct: analytics.hireSuggestionRate },
                  { label: "With reservations", pct: analytics.reservationRate },
                  { label: "Not recommended", pct: analytics.notRecommendedRate },
                ].map((row) => (
                  <li key={row.label}>
                    <div className="flex justify-between text-xs text-ink-muted">
                      <span>{row.label}</span>
                      <span>{row.pct}%</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-overlay">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-ink">
                Avg competency scores
              </h3>
              <ul className="mt-4 space-y-3">
                {[
                  { label: "Communication", score: analytics.avgCommunication },
                  { label: "Problem solving", score: analytics.avgProblemSolving },
                  { label: "Domain knowledge", score: analytics.avgDomainKnowledge },
                ].map((row) => (
                  <li key={row.label}>
                    <div className="flex justify-between text-xs text-ink-muted">
                      <span>{row.label}</span>
                      <span>{row.score}/100</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-overlay">
                      <div
                        className="h-full rounded-full bg-emerald-600"
                        style={{ width: `${row.score}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-ink">
                Candidate archetypes
              </h3>
              <p className="mt-1 text-xs text-ink-muted">
                Dominant competency profile per evaluated applicant
              </p>
              {analytics.archetypes.length === 0 ? (
                <p className="mt-4 text-sm text-ink-faint">No data yet</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {analytics.archetypes.map((a) => (
                    <li
                      key={a.label}
                      className="flex items-center justify-between rounded-lg bg-surface/60 px-3 py-2 text-sm"
                    >
                      <span className="text-ink">{a.label}</span>
                      <span className="font-semibold tabular-nums text-ink-muted">
                        {a.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-ink">
                Applications by role
              </h3>
              <ul className="mt-4 space-y-2">
                {analytics.roleBreakdown.map((r) => (
                  <li
                    key={r.role}
                    className="flex items-center justify-between rounded-lg bg-surface/60 px-3 py-2 text-sm"
                  >
                    <span className="truncate text-ink">{r.role}</span>
                    <span className="ml-2 shrink-0 font-semibold tabular-nums text-ink-muted">
                      {r.count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SimField({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
  rows?: number;
}) {
  const cls =
    "w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-muted">
        {label}
      </label>
      {multiline ? (
        <textarea
          required
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${cls} resize-none`}
        />
      ) : (
        <input
          type="text"
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}
