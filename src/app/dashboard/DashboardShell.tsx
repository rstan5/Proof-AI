"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/branding/logo";
import type { SimulationRecord } from "@/types/database";

type SimRow = Pick<SimulationRecord, "id" | "company_name" | "role_title" | "created_at">;

interface Props {
  userEmail: string;
  simulations: SimRow[];
}

const nav = [
  { label: "Simulations", href: "/dashboard", active: true },
  { label: "Results", href: "/dashboard/results", active: false },
];

export function DashboardShell({ userEmail, simulations }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  function copyLink(id: string) {
    const link = `${window.location.origin}/sim/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
        <nav className="mt-10 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                item.active
                  ? "block rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm font-semibold text-ink shadow-sm"
                  : "block rounded-lg px-3 py-2 text-sm text-ink-muted transition hover:bg-surface-overlay hover:text-ink"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border-subtle bg-surface/80 px-4 backdrop-blur-sm sm:px-6">
          <h1 className="text-sm font-semibold text-ink">Recruiter dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-ink-faint sm:block">{userEmail}</span>
            <button
              onClick={signOut}
              className="text-xs text-ink-muted transition hover:text-ink"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-ink">Simulations</h2>
                <p className="mt-0.5 text-sm text-ink-muted">
                  Generate an assessment and send the link to a candidate.
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-semibold text-surface transition hover:bg-accent-muted"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Simulation
              </button>
            </div>

            <div className="mt-6">
              {simulations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-surface-overlay/40 p-10 text-center">
                  <p className="text-sm font-semibold text-ink">No simulations yet</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    Click &ldquo;New Simulation&rdquo; to generate your first assessment.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {simulations.map((sim) => (
                    <li
                      key={sim.id}
                      className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface px-4 py-3 shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">
                          {sim.role_title}
                          <span className="ml-1.5 font-normal text-ink-muted">at {sim.company_name}</span>
                        </p>
                        <p className="mt-0.5 text-xs text-ink-faint">
                          {new Date(sim.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => copyLink(sim.id)}
                        className="ml-4 shrink-0 inline-flex h-8 items-center gap-1.5 rounded-lg border border-border-subtle px-3 text-xs font-medium text-ink-muted transition hover:bg-surface-overlay hover:text-ink"
                      >
                        {copiedId === sim.id ? (
                          <>
                            <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Copied
                          </>
                        ) : (
                          <>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                            </svg>
                            Copy link
                          </>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <SimulationModal
          onClose={() => setShowModal(false)}
          onCreated={() => router.refresh()}
        />
      )}
    </div>
  );
}

function SimulationModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    company_name: "",
    role_title: "",
    job_description: "",
    looking_for: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const simLink = generatedId ? `${window.location.origin}/sim/${generatedId}` : "";

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const res = await fetch("/api/simulations/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrorMsg((data as { error?: string }).error ?? "Generation failed. Please try again.");
      setStatus("error");
      return;
    }

    const data = await res.json();
    setGeneratedId((data as { id: string }).id);
    setStatus("success");
    onCreated();
  }

  function copyLink() {
    navigator.clipboard.writeText(simLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={status !== "loading" ? onClose : undefined}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-border-subtle bg-surface shadow-lg">
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <p className="text-sm font-semibold text-ink">
            {status === "success" ? "Simulation ready" : "New simulation"}
          </p>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-ink-faint transition hover:bg-surface-overlay hover:text-ink"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {status === "success" ? (
          <div className="p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-4 w-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Simulation generated</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Share this link with the candidate. The assessment runs in a secure
                  lockdown window — tab switching is detected and logged.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-overlay/50 px-3 py-2">
              <p className="min-w-0 flex-1 truncate font-mono text-xs text-ink">{simLink}</p>
              <button
                onClick={copyLink}
                className="shrink-0 inline-flex h-7 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-semibold text-surface transition hover:bg-accent-muted"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setStatus("idle");
                  setGeneratedId(null);
                  setForm({ company_name: "", role_title: "", job_description: "", looking_for: "" });
                  setCopied(false);
                }}
                className="h-9 rounded-lg border border-border-subtle px-4 text-sm text-ink-muted transition hover:bg-surface-overlay hover:text-ink"
              >
                New simulation
              </button>
              <button
                onClick={onClose}
                className="h-9 rounded-lg bg-accent px-4 text-sm font-semibold text-surface transition hover:bg-accent-muted"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <Field
              label="Company name"
              placeholder="Acme Corp"
              value={form.company_name}
              onChange={(v) => update("company_name", v)}
            />
            <Field
              label="Role you're hiring for"
              placeholder="Senior Account Executive"
              value={form.role_title}
              onChange={(v) => update("role_title", v)}
            />
            <Field
              label="Job description"
              placeholder="Briefly describe the role responsibilities…"
              value={form.job_description}
              onChange={(v) => update("job_description", v)}
              multiline
              rows={4}
            />
            <Field
              label="What are you looking for?"
              placeholder="e.g. discovery skills, objection handling, prioritisation under pressure…"
              value={form.looking_for}
              onChange={(v) => update("looking_for", v)}
              multiline
              rows={3}
            />

            {status === "error" && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{errorMsg}</p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="h-9 rounded-lg border border-border-subtle px-4 text-sm text-ink-muted transition hover:bg-surface-overlay hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-surface transition hover:bg-accent-muted disabled:opacity-60"
              >
                {status === "loading" && (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                {status === "loading" ? "Generating…" : "Generate simulation"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  multiline = false,
  rows = 1,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
}) {
  const baseClass =
    "w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</label>
      {multiline ? (
        <textarea
          required
          placeholder={placeholder}
          value={value}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseClass} resize-none`}
        />
      ) : (
        <input
          type="text"
          required
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      )}
    </div>
  );
}
