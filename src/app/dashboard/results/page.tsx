import Link from "next/link";

export default function DashboardResultsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface px-4 py-16">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border-subtle bg-surface-overlay/50 p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-ink">Results</p>
        <p className="mt-2 text-sm text-ink-muted">
          Evaluation cards and score breakdowns will render here after submissions
          are implemented.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block text-xs text-ink-faint hover:text-ink"
        >
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
