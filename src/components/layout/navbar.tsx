import Link from "next/link";
import { BrandLogo } from "@/components/branding/logo";
import { cn } from "@/utils/cn";

const nav = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how" },
  { label: "ROI", href: "#roi" },
];

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border-subtle bg-surface/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-3 sm:h-16">
          <BrandLogo size={32} priority />
          <nav className="hidden items-center gap-8 text-sm text-ink-muted md:flex">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden text-sm text-ink-muted transition hover:text-ink sm:inline"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                "relative inline-flex h-9 items-center justify-center overflow-hidden rounded-lg px-3 text-xs font-semibold text-surface transition sm:px-4 sm:text-sm",
                "bg-accent shadow-[0_1px_2px_rgba(44,40,37,0.12)]",
                "hover:bg-accent-muted",
                "active:scale-[0.98]",
              )}
            >
              Run a Simulation
            </Link>
          </div>
        </div>
        <nav className="flex items-center gap-5 overflow-x-auto border-t border-border-subtle py-2.5 text-xs text-ink-muted md:hidden">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 whitespace-nowrap transition hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
