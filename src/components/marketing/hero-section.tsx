"use client";

import { FadeIn } from "@/components/ui/fade-in";
import { HeroRadar } from "@/components/marketing/hero-radar";
import { AnimatedButton } from "@/components/ui/animated-button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 pb-14 sm:pt-32 sm:pb-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[520px] w-[min(920px,100vw)] -translate-x-1/2 rounded-full bg-amber-100/45 blur-[110px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-stone-200/50 blur-[80px]" />
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
          <FadeIn>
            <h1 className="text-balance font-serif text-4xl font-semibold tracking-tight text-ink sm:text-5xl sm:leading-[1.08] lg:text-6xl lg:leading-[1.05]">
              Resumes are guesses. Proof is certainty.
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-ink-muted sm:text-lg">
              Most interview hours go to candidates who have never shown how they
              think through the work. Proof AI is a competency work sample — not
              a replacement for interviews. From your job description it builds a
              realistic simulation with on-screen materials, then returns a
              rubric-scored report so you see how someone works before you spend
              calendar on them.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <AnimatedButton
                href="/login?next=%2Fdashboard%3Ftab%3Dsimulate"
                variant="primary"
              >
                Try a free sample
              </AnimatedButton>
              <AnimatedButton href="#simulation" variant="secondary">
                See a sample report
              </AnimatedButton>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-ink-faint">
              One free sample per account. Sign in, generate a simulation for
              your role, complete it, and review the report. Contact us for
              pricing beyond the sample.
            </p>
          </FadeIn>
          <FadeIn delay={140}>
            <HeroRadar />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
