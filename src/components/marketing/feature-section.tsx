import { FadeIn } from "@/components/ui/fade-in";

const capabilities = [
  {
    title: "Materials that look like the job",
    body: "Emails, reports, threads, and tables appear inside the assessment. Candidates work from what they see — not a vague prompt.",
    benefit: "The output is comparable to real day-one work.",
  },
  {
    title: "Pressure without theater",
    body: "Sequential phases force research, judgment, and written deliverables under time — typically about two hours.",
    benefit: "Deep enough for hiring managers. Fast enough for recruiters.",
  },
  {
    title: "Scores you can defend",
    body: "Each submission is evaluated against a structured rubric. Every competency score maps back to work the candidate produced.",
    benefit: "Recommendations rest on evidence — not gut feel.",
  },
];

export function FeatureSection() {
  return (
    <section id="product" className="scroll-mt-24 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Built to sit in front of interviews
            </h2>
            <p className="mt-3 leading-relaxed text-ink-muted">
              Proof AI does not replace your ATS or your interview loop. It
              reduces false positives before either one spends time on a
              candidate.
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
