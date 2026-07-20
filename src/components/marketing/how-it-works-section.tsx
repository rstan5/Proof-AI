import { FadeIn } from "@/components/ui/fade-in";

const steps = [
  {
    step: "01",
    title: "Start from the role",
    body: "You provide the company context, job description, and the competencies that matter for this hire.",
    outcome: "The bar is yours — not a generic quiz bank.",
  },
  {
    step: "02",
    title: "Proof builds the simulation",
    body: "It extracts required skills from the brief, designs multi-phase work that mirrors the job, and embeds authentic materials — emails, memos, tables, chats — on screen.",
    outcome: "Candidates work from the same kind of artifacts they would see on day one.",
  },
  {
    step: "03",
    title: "The candidate does the work",
    body: "You send a link. They complete written deliverables phase by phase in a focused assessment environment.",
    outcome: "You see how they think and execute — not how they interview.",
  },
  {
    step: "04",
    title: "You review evidence",
    body: "Output is scored against a structured competency rubric. Strengths, gaps, and a recommendation land in your dashboard.",
    outcome: "Interview people who already cleared the bar.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how" className="scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              How Proof builds a trustworthy signal
            </h2>
            <p className="mt-3 leading-relaxed text-ink-muted">
              No black box. Each step is grounded in the role you defined — so
              the result is explainable to a hiring manager.
            </p>
          </div>
        </FadeIn>

        <ol className="relative mt-14 space-y-6">
          <div
            className="absolute bottom-6 left-[1.35rem] top-6 hidden w-px bg-border-subtle lg:block"
            aria-hidden
          />
          {steps.map((s, i) => (
            <FadeIn key={s.step} delay={i * 100}>
              <li className="relative flex flex-col gap-4 rounded-2xl border border-border-subtle bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:gap-8 lg:pl-16">
                <div className="absolute left-6 top-8 hidden h-3 w-3 rounded-full border-2 border-accent bg-surface lg:block" />
                <div className="flex shrink-0 items-center gap-3 sm:w-36 sm:flex-col sm:items-start sm:gap-1">
                  <span className="font-mono text-xs tabular-nums text-ink-faint">
                    {s.step}
                  </span>
                  <p className="text-base font-semibold text-ink sm:text-lg">
                    {s.title}
                  </p>
                </div>
                <div className="min-w-0 flex-1 border-t border-border-subtle pt-4 sm:border-t-0 sm:pt-0">
                  <p className="text-sm leading-relaxed text-ink-muted">
                    {s.body}
                  </p>
                  <p className="mt-3 text-sm font-medium text-ink">
                    <span className="text-accent">→</span> {s.outcome}
                  </p>
                </div>
              </li>
            </FadeIn>
          ))}
        </ol>
      </div>
    </section>
  );
}
