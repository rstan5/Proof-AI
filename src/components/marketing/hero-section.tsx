import { AnimatedButton } from "@/components/ui/animated-button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-36 sm:pb-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[480px] w-[min(880px,100vw)] -translate-x-1/2 rounded-full bg-amber-100/50 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-stone-200/60 blur-[72px]" />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `linear-gradient(rgba(62,52,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(62,52,42,0.06) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse 85% 65% at 50% 0%, black, transparent)",
          }}
        />
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center animate-fadeUp">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface/80 px-3 py-1 text-xs font-semibold tracking-wide text-ink-muted shadow-sm backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-700/80" />
            Pre-screen with role-specific simulations
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-ink sm:text-5xl sm:leading-[1.12]">
            Verify competency BEFORE you hire.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-ink-muted sm:text-lg">
            AI-powered role simulations that reduce bad hires, wasted recruiting
            hours, and costly hiring mistakes before the interview process even
            begins.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm text-ink-faint">
            Save dozens of recruiting hours and avoid the massive financial cost of
            faulty hires through role-specific competency verification.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <AnimatedButton href="/dashboard" variant="primary">
              Run a Simulation
            </AnimatedButton>
            <AnimatedButton href="#how" variant="secondary">
              See how it works
            </AnimatedButton>
          </div>
        </div>
      </div>
    </section>
  );
}
