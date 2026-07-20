import { AnimatedButton } from "@/components/ui/animated-button";
import { FadeIn } from "@/components/ui/fade-in";

export function CtaBand() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl border border-border-subtle bg-gradient-to-br from-accent/10 via-white to-surface-overlay p-10 shadow-sm sm:p-14">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(61,79,92,0.1),transparent_55%)]" />
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                See what competency looks like for your role
              </h2>
              <p className="mt-3 leading-relaxed text-ink-muted">
                Sign in, paste a job description, and generate one free sample.
                Complete the simulation and read the report — then decide whether
                to bring Proof into your hiring process.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <AnimatedButton
                  href="/login?next=%2Fdashboard%3Ftab%3Dsimulate"
                  variant="primary"
                >
                  Try a free sample
                </AnimatedButton>
                <AnimatedButton href="/login" variant="secondary">
                  Sign in
                </AnimatedButton>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
