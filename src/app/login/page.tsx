import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border-subtle bg-surface-overlay/50 p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-ink">Sign in</p>
        <p className="mt-2 text-sm text-ink-muted">
          Supabase auth will be wired in the next milestone. For now, continue to
          the recruiter flow.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-lg bg-accent text-sm font-semibold text-surface transition hover:bg-accent-muted"
        >
          Continue to dashboard
        </Link>
        <Link
          href="/"
          className="mt-4 block text-xs text-ink-faint hover:text-ink"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
