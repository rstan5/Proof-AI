import Link from "next/link";
import { BrandLogo } from "@/components/branding/logo";
import { Footer } from "@/components/layout/footer";
import { PricingCards } from "./PricingCards";

export const metadata = {
  title: "Pricing — Proof AI",
  description:
    "Proof AI plans: Small Business ($50/mo, 100 simulations), Enterprise ($400/mo, 1,000 simulations), or contact us for higher volume.",
};

export default function PricingPage() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border-subtle bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <BrandLogo size={32} priority />
          <nav className="flex items-center gap-4 text-sm sm:gap-6">
            <Link href="/" className="text-ink-muted transition hover:text-ink">
              Home
            </Link>
            <span className="font-semibold text-ink">Pricing</span>
            <Link
              href="/login?next=%2Fpricing"
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-surface transition hover:bg-accent-muted sm:text-sm"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 sm:pt-32">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Simple pricing for hiring teams
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink-muted">
            Start with one free sample. When you need more competency
            simulations, pick a monthly plan — or contact us if your volume
            exceeds 1,000 generations per month.
          </p>
        </div>

        <div className="mt-12">
          <PricingCards />
        </div>
      </main>

      <Footer />
    </>
  );
}
