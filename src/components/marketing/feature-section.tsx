const features = [
  {
    title: "Role-native tasks",
    body: "Simulations mirror real work — outreach, analysis tickets, support threads, and product tradeoffs — not generic brain teasers.",
  },
  {
    title: "Objective signal, early",
    body: "Evaluate structured outputs against a consistent rubric so hiring teams spend live interviews on qualified candidates.",
  },
  {
    title: "Built for speed",
    body: "Generate a scenario, share a link, and get a competency report in minutes — without replacing your existing process.",
  },
];

export function FeatureSection() {
  return (
    <section
      id="product"
      className="scroll-mt-24 border-y border-border-subtle bg-surface py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Pre-screening that matches how the job actually works
          </h2>
          <p className="mt-3 leading-relaxed text-ink-muted">
            Proof AI is not an ATS and not a replacement for interviews. It is a
            focused layer that validates capability before you invest recruiter and
            hiring manager time.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              className="group rounded-2xl border border-border-subtle bg-surface-overlay/50 p-6 shadow-sm transition hover:border-accent/15 hover:shadow-md"
            >
              <div className="mb-4 h-px w-10 bg-gradient-to-r from-accent to-transparent opacity-70" />
              <h3 className="text-base font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
