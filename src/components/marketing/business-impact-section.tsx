import { FadeIn } from "@/components/ui/fade-in";

const metrics = [
  {
    value: "Earlier",
    label: "Weak fits exit the funnel sooner",
    detail:
      "Capability gaps show up in work product — before they consume interview weeks.",
  },
  {
    value: "Work product",
    label: "How they think — on the page",
    detail:
      "You see judgment, writing, and prioritization in action. Pace varies by candidate; sessions have a time limit, not a fixed length.",
  },
  {
    value: "Minutes",
    label: "For a recruiter to act",
    detail:
      "Generate a simulation, send a link, and read a scored report — without another screening call.",
  },
  {
    value: "No rip-and-replace",
    label: "Keep your hiring stack",
    detail:
      "Proof AI sits in front of interviews. Your ATS and process stay in place.",
  },
];

const withoutProof = [
  "Pedigree and keywords decide who gets through",
  "Capability gaps appear mid-loop — after cost is sunk",
  "Hiring managers re-run the same soft screens",
  "False positives reach offer before anyone sees real work",
];

const withProof = [
  "Candidates produce work that mirrors the role first",
  "You get scores, strengths, and gaps in one place",
  "Recruiters advance people who cleared a competency bar",
  "Interview calendars open for finalists with evidence",
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
              The cost of guessing is interviews
            </h2>
            <p className="mt-3 leading-relaxed text-ink-muted">
              Resumes describe a career. They do not show how someone thinks
              through your work. Proof surfaces competency — working judgment,
              not claimed expertise — so weak fits leave before they burn
              recruiter hours and hiring-manager calendar.
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
                Resume-first hiring
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
                Work-first hiring
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
