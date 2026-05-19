const STATS = [
  "$100k+ often spent on a single faulty hire (recruiting + ramp + replacement)",
  "10+ hours spent on each candidate before you know if they can do the job",
  "A large % of hires miss performance or competency expectations within 18 months",
  "Most teams underestimate the full cost of a mis-hire",
  "Proof AI surfaces weak fits before expensive interview loops",
];

/**
 * Infinite horizontal marquee below the hero — slides left, loops seamlessly.
 * Duplicated track; CSS moves -50% (half the duplicated width).
 */
export function StatsMarquee() {
  const loop = [...STATS, ...STATS];

  return (
    <section
      aria-label="Hiring cost and risk statistics"
      className="border-b border-border-subtle bg-accent/[0.08]"
    >
      {/* Reduced motion: static row */}
      <div className="hidden flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-4 text-center motion-reduce:flex">
        {STATS.map((text) => (
          <span
            key={text}
            className="inline-flex max-w-xs items-center gap-2 text-xs font-semibold text-ink sm:text-sm"
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
              aria-hidden
            />
            {text}
          </span>
        ))}
      </div>

      <div className="relative overflow-hidden py-3 motion-reduce:hidden">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-surface to-transparent sm:w-20"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-surface to-transparent sm:w-20"
          aria-hidden
        />
        <div className="flex w-max animate-marquee gap-10 pr-10 hover:[animation-play-state:paused] sm:gap-14 sm:pr-14">
          {loop.map((text, i) => (
            <span
              key={`${text}-${i}`}
              className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap text-sm font-semibold tracking-tight text-ink sm:text-[15px]"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-accent shadow-sm ring-2 ring-accent/20"
                aria-hidden
              />
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
