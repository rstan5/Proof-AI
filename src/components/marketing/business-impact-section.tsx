import { FadeIn } from "@/components/ui/fade-in";

const metrics = [
  {
    value: "Front of funnel",
    label: "Competency before interviews",
    detail:
      "See work output early — so expensive loops focus on people who can do the job.",
  },
  {
    value: "~2 hours",
    label: "Serious role simulation",
    detail:
      "Multi-phase tasks with real materials. Hard enough that the report is worth believing.",
  },
  {
    value: "Minutes",
    label: "Recruiter time to a report",
    detail:
      "Generate, send a link, and review a scored competency breakdown — without scheduling another screen.",
  },
  {
    value: "Your ATS",
    label: "Keep the stack you have",
    detail:
      "Proof AI is a verification layer, not a full recruiting suite to rip and replace.",
  },
];

const withoutProof = [
  "Resume keywords and pedigree drive early filters",
  "Interview loops discover capability gaps too late",
  "Hiring managers repeat the same soft screens",
  "Weak fits surface after onboarding, not before",
];

const withProof = [
  "Candidates complete realistic role work before interviews",
  "Scores, strengths, and gaps land in one hiring report",
  "Recruiters advance competency — not just credentials",
  "Interview loops reserve calendar for finalists who deliver",
];

export function BusinessImpactSection() {
  return (
    <section
      id="benefits"
      className="scroll-mt-24 border-y border-border-subtle bg-surface py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              What hiring teams get back
            </h2>
            <p className="mt-3 leading-relaxed text-ink-muted">
              Proof AI moves competency verification earlier for teams across
              industries — so you spend less interview time on people who can’t
              execute, and more on those who can.
            </p>
          </div>
        </FadeIn>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m, i) => (
            <FadeIn key={m.label} delay={i * 80}>
              <article className="h-full rounded-2xl border border-border-subtle bg-white p-5 shadow-sm transition hover:shadow-md">
                <p className="font-serif text-2xl font-semibold tracking-tight text-accent sm:text-[1.65rem]">
                  {m.value}
                </p>
                <p className="mt-2 text-sm font-semibold text-ink">{m.label}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                  {m.detail}
                </p>
              </article>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={100}>
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border-subtle bg-surface-overlay/50 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                Resume-first screening
              </p>
              <ul className="mt-5 space-y-3">
                {withoutProof.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-ink-muted"
                  >
                    <span className="mt-0.5 text-rose-600" aria-hidden>
                      ✕
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-accent/20 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                With Proof AI
              </p>
              <ul className="mt-5 space-y-3">
                {withProof.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-ink"
                  >
                    <span className="mt-0.5 text-emerald-700" aria-hidden>
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
