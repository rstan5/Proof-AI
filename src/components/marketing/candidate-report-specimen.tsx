const grades = [
  { label: "Decision", value: "B+" },
  { label: "Reasoning", value: "A−" },
  { label: "Risk", value: "C" },
  { label: "Speed", value: "A" },
] as const;

/**
 * Marketing specimen: sample layout of a post-simulation candidate report (not real data).
 */
export function CandidateReportSpecimen() {
  return (
    <section
      className="scroll-mt-24 border-y border-border-subtle bg-surface py-16 sm:py-20"
      aria-labelledby="specimen-report-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="specimen-report-heading"
            className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
          >
            Example candidate report
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
            After a simulation, recruiters receive structured signal—scores,
            rationale, and a clear hiring posture. Below is a fictional specimen
            for illustration only.
          </p>
        </div>

        <article
          className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-[0_12px_40px_-16px_rgba(44,40,37,0.12)] ring-1 ring-black/[0.04] sm:mt-12"
        >
          <header className="border-b border-border-subtle bg-surface-overlay/60 px-6 py-4 sm:px-8">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ink-faint">
              Confidential — Specimen
            </p>
            <p className="mt-1 text-xs text-ink-muted">Candidate</p>
            <h3 className="mt-0.5 font-serif text-lg font-semibold tracking-tight text-ink sm:text-xl">
              M. Hernandez — Equity Research Intern
            </h3>
          </header>

          <div className="grid gap-px bg-border-subtle sm:grid-cols-2">
            {grades.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-4 bg-white px-6 py-4 sm:px-8"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  {row.label}
                </span>
                <span className="font-serif text-2xl font-semibold tabular-nums text-ink sm:text-3xl">
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <blockquote className="border-b border-border-subtle px-6 py-6 sm:px-8 sm:py-7">
            <p className="border-l-2 border-accent pl-4 text-sm leading-relaxed text-ink sm:text-[15px]">
              &ldquo;Thinks like a short-term trader but misses macro risk signals.
              Strong execution, weak strategic framing. Would succeed in an
              execution analyst role — not portfolio strategy.&rdquo;
            </p>
          </blockquote>

          <footer className="space-y-3 bg-surface/40 px-6 py-5 font-sans text-sm sm:px-8">
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-ink">
              <span className="font-semibold text-accent">Recommend</span>
              <span className="text-ink-muted">→</span>
              <span>Execution Analyst</span>
            </p>
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-ink">
              <span className="font-semibold text-ink-muted">Hold</span>
              <span className="text-ink-muted">→</span>
              <span>Strategy seat</span>
            </p>
          </footer>
        </article>

        <p className="mx-auto mt-4 max-w-2xl text-center text-xs text-ink-faint">
          Fictional example for product illustration. Not an actual candidate or
          employer record.
        </p>
      </div>
    </section>
  );
}
