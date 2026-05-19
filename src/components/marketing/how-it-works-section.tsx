const steps = [
  {
    step: "01",
    title: "Pick a role",
    body: "Choose from SDR, Financial Analyst, Customer Support, or Product Manager.",
  },
  {
    step: "02",
    title: "Generate a simulation",
    body: "AI creates a realistic brief with context, constraints, and deliverables.",
  },
  {
    step: "03",
    title: "Candidate completes work",
    body: "They respond in a focused writing environment with clear instructions.",
  },
  {
    step: "04",
    title: "Structured evaluation",
    body: "Scores, strengths, weaknesses, and a hiring recommendation land in one view.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how" className="scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              How it works
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-ink-muted">
              A tight loop from scenario to signal — designed for recruiters and
              hiring managers who need quality, not another dashboard.
            </p>
          </div>
        </div>
        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li
              key={s.step}
              className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-overlay/40 p-6 shadow-sm"
            >
              <span className="font-mono text-xs tabular-nums text-ink-faint">
                {s.step}
              </span>
              <p className="mt-3 text-base font-semibold text-ink">{s.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
