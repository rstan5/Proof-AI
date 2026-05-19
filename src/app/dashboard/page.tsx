import Link from "next/link";
import { LogoMark } from "@/components/branding/logo";

const nav = [
  { label: "Simulations", href: "/dashboard", active: true },
  { label: "Results", href: "/dashboard/results", active: false },
];

export default function DashboardPage() {
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
        <header className="flex h-14 items-center border-b border-border-subtle bg-surface/80 px-4 backdrop-blur-sm sm:px-6">
          <h1 className="text-sm font-semibold text-ink">Recruiter dashboard</h1>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-border bg-surface-overlay/40 p-8 text-center shadow-sm">
            <p className="text-sm font-semibold text-ink">Simulation workflow</p>
            <p className="mt-2 text-sm text-ink-muted">
              Role selection, generation, candidate link, and evaluation will live
              here in the next implementation step.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex text-xs text-ink-faint hover:text-ink"
            >
              ← Back to landing
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
