"use client";

import { FadeIn } from "@/components/ui/fade-in";
import { SimulationPreview } from "@/components/marketing/simulation-preview";

export function CandidateReportSpecimen() {
  return (
    <section
      id="simulation"
      className="scroll-mt-24 border-y border-border-subtle bg-surface-overlay/30 py-16 sm:py-20"
      aria-labelledby="specimen-sim-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="specimen-sim-heading"
              className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
            >
              What the candidate actually does
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
              A multi-phase, fullscreen simulation with live work materials —
              emails, reports, notes, tables — and real deliverables typed
              on-screen. The specimen below is one example role; yours is
              generated from your job description.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={120}>
          <div className="mx-auto mt-10 flex justify-center sm:mt-12">
            <SimulationPreview />
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <p className="mx-auto mt-5 max-w-2xl text-center text-xs text-ink-faint">
            Specimen UI — example sales scenario for illustration, not a live
            assessment.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
