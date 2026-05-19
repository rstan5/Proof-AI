const costs = [
  { label: "Recruiting & interview hours", detail: "Dozens of hours per role" },
  { label: "Onboarding & ramp", detail: "Weeks of partial productivity" },
  { label: "Training & rework", detail: "Manager time + team drag" },
  { label: "Cost of a mis-hire", detail: "Often six figures all-in" },
];

export function RoiSection() {
  return (
    <section
      id="roi"
      className="scroll-mt-24 border-y border-border-subtle bg-surface py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              The hidden tax of bad hires
            </h2>
            <p className="mt-4 leading-relaxed text-ink-muted">
              Companies pay twice: once in salary and tools, again in time — screening,
              interviews, onboarding, and eventually replacement. Proof AI targets
              the earliest leak in the funnel with competency verification before
              interviews.
            </p>
            <ul className="mt-8 space-y-4">
              {costs.map((c) => (
                <li
                  key={c.label}
                  className="flex items-start justify-between gap-4 border-b border-border-subtle pb-4 last:border-0 last:pb-0"
                >
                  <span className="text-sm font-semibold text-ink">{c.label}</span>
                  <span className="text-right text-sm text-ink-muted">{c.detail}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-overlay/60 p-8 shadow-sm">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
            <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-ink-faint">
              Positioning
            </p>
            <p className="mt-4 font-serif text-xl font-semibold leading-snug text-ink sm:text-2xl">
              Reduce bad hires, wasted recruiting hours, and hiring inefficiency
              through AI-powered job simulations.
            </p>
            <div className="mt-8 grid gap-3 text-sm text-ink-muted">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                Verify competency before you hire.
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink-faint" />
                Keep your process — add an objective pre-screen.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
