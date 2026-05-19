import { AnimatedButton } from "@/components/ui/animated-button";

export function CtaBand() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border-subtle bg-surface-overlay/50 p-10 shadow-sm sm:p-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(61,79,92,0.12),transparent_55%)]" />
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Ready to verify competency first?
            </h2>
            <p className="mt-3 leading-relaxed text-ink-muted">
              Spin up a role simulation and preview the recruiter workflow — no
              payments, no ATS, just the core loop.
            </p>
            <div className="mt-8 flex justify-center">
              <AnimatedButton href="/dashboard" variant="primary">
                Run a Simulation
              </AnimatedButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
