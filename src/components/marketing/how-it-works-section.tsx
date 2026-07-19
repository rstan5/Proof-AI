import { FadeIn } from "@/components/ui/fade-in";

const steps = [
  {
    step: "01",
    title: "Define the role",
    body: "Enter your company context, role title, job description, and the competencies that matter for this hire — in any industry.",
    outcome: "The simulation is built against your bar for “good,” not a generic quiz.",
  },
  {
    step: "02",
    title: "Generate a multi-phase simulation",
    body: "Proof AI creates a ~2-hour work session: sequential phases with emails, memos, tables, chats, and other role materials embedded on-screen — no fake downloads.",
    outcome: "Candidates prove capability through realistic output.",
  },
  {
    step: "03",
    title: "Candidate completes the work",
    body: "Share a link. They stay in a focused fullscreen environment, read the source materials, and submit deliverables phase by phase.",
    outcome: "You see how they think, write, and execute under real constraints.",
  },
  {
    step: "04",
    title: "Review the competency report",
    body: "Scores, strengths, weaknesses, and a hiring recommendation land in your dashboard — ready before you burn calendar on interviews.",
    outcome: "Advance people who cleared the competency bar.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how" className="scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              From job description to hiring signal
            </h2>
            <p className="mt-3 leading-relaxed text-ink-muted">
              A competency-first loop for any firm and any role — filter weak fits
              early, and protect recruiter and hiring-manager time downstream.
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
