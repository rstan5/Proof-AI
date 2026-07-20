"use client";

import { FadeIn } from "@/components/ui/fade-in";
import { ReportPreview } from "@/components/marketing/report-preview";

export function CandidateReportSpecimen() {
  return (
    <section
      id="simulation"
      className="scroll-mt-24 border-y border-border-subtle bg-surface-overlay/30 py-16 sm:py-20"
      aria-labelledby="specimen-report-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="specimen-report-heading"
              className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
            >
              The competency report you get back
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
              A competency readout from observed work — how they think,
              communicate, and prioritize — with strengths, gaps, and a
              recommendation. Use it to inform interviews; it does not replace
              them.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={120}>
          <div className="mx-auto mt-10 flex justify-center sm:mt-12">
            <ReportPreview />
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <p className="mx-auto mt-5 max-w-2xl text-center text-xs text-ink-faint">
            Specimen only — illustrative example. Live reports are generated
            from a real submission using frontier AI models combined with
            structured evaluation rubrics.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
