"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/branding/logo";

type Mode = "signin" | "signup";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const authError = searchParams.get("error");

  const [mode, setMode] = useState<Mode>("signup");
  const [status, setStatus] = useState<"idle" | "loading" | "confirm">("idle");
  const [errorMsg, setErrorMsg] = useState(
    authError === "auth_failed"
      ? "Email confirmation failed or expired. Please sign in or sign up again."
      : "",
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleAtCompany, setRoleAtCompany] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setStatus("loading");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg(error.message);
      setStatus("idle");
      return;
    }

    router.push(next);
    router.refresh();
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setStatus("loading");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        data: {
          company_name: companyName.trim(),
          role_at_company: roleAtCompany.trim(),
          contact_phone: contactPhone.trim(),
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setStatus("idle");
      return;
    }

    if (data.user && !data.session) {
      setStatus("confirm");
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("company_profiles").insert({
        id: data.user.id,
        company_name: companyName.trim(),
        role_at_company: roleAtCompany.trim(),
        contact_phone: contactPhone.trim() || null,
      });

      if (profileError) {
        console.error("Profile insert error:", profileError);
      }
    }

    router.push(next);
    router.refresh();
  }

  if (status === "confirm") {
    return (
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-overlay/50 p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-ink">Confirm your email</p>
        <p className="mt-2 text-sm text-ink-muted">
          We sent a confirmation link to{" "}
          <span className="font-medium text-ink">{email}</span>. Click it to
          activate your company account, then sign in.
        </p>
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setStatus("idle");
          }}
          className="mt-6 text-xs text-ink-faint hover:text-ink"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-overlay/50 p-8 shadow-sm">
      <div className="mb-6 flex justify-center">
        <BrandLogo size={36} className="pointer-events-none" />
      </div>

      <p className="text-center text-sm font-semibold text-ink">
        {mode === "signup" ? "Create your company account" : "Sign in"}
      </p>
      <p className="mt-1 text-center text-sm text-ink-muted">
        {mode === "signup"
          ? "Set up Proof AI to verify candidate competency before interviews."
          : "Access your dashboard, candidates, and simulations."}
      </p>

      <div className="mt-6 flex rounded-lg border border-border-subtle bg-surface p-1">
        {(["signup", "signin"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setErrorMsg("");
            }}
            className={
              mode === m
                ? "flex-1 rounded-md bg-white py-2 text-xs font-semibold text-ink shadow-sm"
                : "flex-1 rounded-md py-2 text-xs font-medium text-ink-muted transition hover:text-ink"
            }
          >
            {m === "signup" ? "Sign up" : "Sign in"}
          </button>
        ))}
      </div>

      <form
        onSubmit={mode === "signup" ? handleSignUp : handleSignIn}
        className="mt-6 space-y-3"
      >
        {mode === "signup" && (
          <>
            <AuthField
              label="Company name"
              value={companyName}
              onChange={setCompanyName}
              placeholder="Acme Corp"
              required
            />
            <AuthField
              label="Your role at the company"
              value={roleAtCompany}
              onChange={setRoleAtCompany}
              placeholder="Head of Talent / Recruiter"
              required
            />
            <AuthField
              label="Contact phone (optional)"
              value={contactPhone}
              onChange={setContactPhone}
              placeholder="(555) 123-4567"
              type="tel"
            />
          </>
        )}

        <AuthField
          label="Work email"
          value={email}
          onChange={setEmail}
          placeholder="you@company.com"
          type="email"
          required
        />
        <AuthField
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          type="password"
          required
          minLength={8}
        />

        {errorMsg && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-1 inline-flex h-10 w-full items-center justify-center rounded-lg bg-accent text-sm font-semibold text-surface transition hover:bg-accent-muted disabled:opacity-60"
        >
          {status === "loading"
            ? "Please wait…"
            : mode === "signup"
              ? "Create account"
              : "Sign in"}
        </button>
      </form>

      <Link
        href="/"
        className="mt-5 block text-center text-xs text-ink-faint hover:text-ink"
      >
        ← Back to home
      </Link>
    </div>
  );
}

function AuthField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-muted">
        {label}
      </label>
      <input
        type={type}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-12">
      <Suspense
        fallback={
          <div className="h-64 w-full max-w-md animate-pulse rounded-2xl bg-surface-overlay/50" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
