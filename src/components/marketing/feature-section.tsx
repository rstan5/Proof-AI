import { FadeIn } from "@/components/ui/fade-in";

const capabilities = [
  {
    title: "Work materials on-screen",
    body: "Emails, reports, Slack threads, data tables, tickets, and briefs ship inside the simulation. Candidates analyze what they see — not a hollow “see attached.”",
    benefit: "The assessment looks like the job, because it uses the job’s artifacts.",
  },
  {
    title: "Multi-phase role pressure",
    body: "Sequential phases tailored to the role — research, decisions, written deliverables, stakeholder pushback — roughly two hours of serious work.",
    benefit: "Signal deep enough for hiring managers to trust — report fast enough for recruiters to use.",
  },
  {
    title: "Rubric-backed reports",
    body: "Every submission is scored for communication, problem solving, domain knowledge, and overall recommendation — plus strengths and gaps in plain language.",
    benefit: "Interview only people who cleared your competency bar.",
  },
];

export function FeatureSection() {
  return (
    <section id="product" className="scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Deeper than a screen. Lighter than an ATS.
            </h2>
            <p className="mt-3 leading-relaxed text-ink-muted">
              Proof AI is a competency verification layer for hiring teams in any
              industry — finance, healthcare, tech, professional services, and
              beyond. Keep your ATS; add proof before the interview loop.
            </p>
          </div>
        </FadeIn>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {capabilities.map((f, i) => (
            <FadeIn key={f.title} delay={i * 90}>
              <article className="flex h-full flex-col rounded-2xl border border-border-subtle bg-white p-6 shadow-sm transition hover:border-accent/15 hover:shadow-md">
                <div className="mb-4 h-px w-10 bg-gradient-to-r from-accent to-transparent opacity-70" />
                <h3 className="text-base font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
                  {f.body}
                </p>
                <p className="mt-4 border-t border-border-subtle pt-4 text-sm font-medium text-ink">
                  <span className="text-accent">→</span> {f.benefit}
                </p>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
