"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PRICING_CONTACT_MAILTO,
  PRICING_PLANS,
  type PaidPlanId,
} from "@/lib/pricing";
import { cn } from "@/utils/cn";

export function PricingCards() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function startCheckout(planId: PaidPlanId) {
    setError("");
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (res.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent("/pricing")}`;
        return;
      }
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout. Try again.");
        setLoadingPlan(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error starting checkout.");
      setLoadingPlan(null);
    }
  }

  return (
    <div>
      {error && (
        <p className="mx-auto mb-6 max-w-xl rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-3">
        {PRICING_PLANS.map((plan) => {
          const isCustom = plan.priceCents == null;
          const isPaid = plan.id === "small_business" || plan.id === "enterprise";
          return (
            <article
              key={plan.id}
              className={cn(
                "flex flex-col rounded-2xl border bg-white p-6 shadow-sm",
                plan.highlighted
                  ? "border-accent/40 ring-1 ring-accent/20"
                  : "border-border-subtle",
              )}
            >
              {plan.highlighted && (
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
                  Most capacity
                </p>
              )}
              <h2 className="font-serif text-xl font-semibold text-ink">
                {plan.name}
              </h2>
              <p className="mt-1 text-sm text-ink-muted">{plan.description}</p>
              <p className="mt-5 flex items-baseline gap-1">
                <span className="font-serif text-4xl font-semibold text-ink">
                  {plan.priceLabel}
                </span>
                {!isCustom && (
                  <span className="text-sm text-ink-faint">/ month</span>
                )}
              </p>
              {plan.simulationsPerMonth != null && (
                <p className="mt-1 text-sm font-medium text-ink">
                  {plan.simulationsPerMonth.toLocaleString()} simulations / month
                </p>
              )}
              <ul className="mt-5 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex gap-2 text-sm leading-snug text-ink-muted"
                  >
                    <span className="text-accent" aria-hidden>
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              {isCustom ? (
                <a
                  href={PRICING_CONTACT_MAILTO}
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-lg border border-border-subtle text-sm font-semibold text-ink transition hover:bg-surface-overlay"
                >
                  {plan.cta}
                </a>
              ) : (
                <button
                  type="button"
                  disabled={loadingPlan === plan.id}
                  onClick={() => startCheckout(plan.id as PaidPlanId)}
                  className={cn(
                    "mt-6 inline-flex h-11 items-center justify-center rounded-lg text-sm font-semibold transition disabled:opacity-60",
                    plan.highlighted
                      ? "bg-accent text-surface hover:bg-accent-muted"
                      : "border border-border-subtle text-ink hover:bg-surface-overlay",
                  )}
                >
                  {loadingPlan === plan.id ? "Redirecting…" : plan.cta}
                </button>
              )}
              {isPaid && (
                <p className="mt-3 text-center text-[11px] text-ink-faint">
                  Secure checkout via Stripe. Cancel anytime from your Stripe
                  portal (coming soon) or by contacting us.
                </p>
              )}
            </article>
          );
        })}
      </div>
      <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-ink-faint">
        Every account includes one free sample simulation. Paid plans unlock
        monthly generation capacity.{" "}
        <Link href="/login?next=%2Fdashboard%3Ftab%3Dsimulate" className="underline">
          Try the free sample
        </Link>
        .
      </p>
    </div>
  );
}
