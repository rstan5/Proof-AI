"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "mail.com",
  "ymail.com",
  "me.com",
  "msn.com",
]);

function isCompanyEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return !!domain && !FREE_EMAIL_DOMAINS.has(domain);
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!isCompanyEmail(email)) {
      setErrorMsg("Please use your company email address to sign in.");
      return;
    }

    setStatus("loading");

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border-subtle bg-surface-overlay/50 p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
            <svg
              className="h-5 w-5 text-emerald-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-ink">Check your email</p>
          <p className="mt-2 text-sm text-ink-muted">
            We sent a sign-in link to <span className="font-medium text-ink">{email}</span>.
            Click it to access the simulation dashboard.
          </p>
          <button
            onClick={() => {
              setStatus("idle");
              setEmail("");
            }}
            className="mt-6 text-xs text-ink-faint hover:text-ink"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border-subtle bg-surface-overlay/50 p-8 shadow-sm">
        <p className="text-sm font-semibold text-ink">Sign in to Proof AI</p>
        <p className="mt-1 text-sm text-ink-muted">
          Enter your company email and we&apos;ll send you a sign-in link.
        </p>

        {authError === "auth_failed" && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            The sign-in link was invalid or expired. Please try again.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-medium text-ink-muted"
            >
              Work email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMsg("");
              }}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {errorMsg && (
              <p className="mt-1.5 text-xs text-red-600">{errorMsg}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-1 inline-flex h-10 w-full items-center justify-center rounded-lg bg-accent text-sm font-semibold text-surface transition hover:bg-accent-muted disabled:opacity-60"
          >
            {status === "loading" ? "Sending…" : "Send sign-in link"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-5 block text-center text-xs text-ink-faint hover:text-ink"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
