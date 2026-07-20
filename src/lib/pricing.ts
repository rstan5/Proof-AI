/** Public pricing plans for Proof AI subscriptions. */

export const PRICING_CONTACT_EMAIL = "contact.proof.ai@gmail.com";

export const PRICING_CONTACT_MAILTO = `mailto:${PRICING_CONTACT_EMAIL}?subject=${encodeURIComponent(
  "Proof AI custom / high-volume plan",
)}&body=${encodeURIComponent(
  "Hi Proof AI team,\n\nOur hiring volume exceeds 1,000 simulations per month and we’d like to discuss a custom plan.\n\nCompany:\nEstimated monthly simulations:\n",
)}`;

export type PaidPlanId = "small_business" | "enterprise";
export type PlanId = "free" | "custom" | PaidPlanId;

export interface PricingPlan {
  id: PlanId;
  name: string;
  priceLabel: string;
  /** Monthly price in USD cents (null = contact sales). */
  priceCents: number | null;
  simulationsPerMonth: number | null;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "small_business",
    name: "Small Business",
    priceLabel: "$50",
    priceCents: 5000,
    simulationsPerMonth: 100,
    description: "For teams running regular competency screens.",
    features: [
      "100 simulations per month",
      "Competency reports for every submission",
      "Dashboard for recruiters and hiring managers",
      "Works beside your existing ATS",
    ],
    cta: "Start Small Business",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceLabel: "$400",
    priceCents: 40000,
    simulationsPerMonth: 1000,
    description: "For larger hiring pipelines that need volume.",
    features: [
      "1,000 simulations per month",
      "Everything in Small Business",
      "Higher capacity for multi-role hiring",
      "Priority support",
    ],
    cta: "Start Enterprise",
    highlighted: true,
  },
  {
    id: "custom",
    name: "Custom",
    priceLabel: "Contact us",
    priceCents: null,
    simulationsPerMonth: null,
    description: "For needs above 1,000 generations per month.",
    features: [
      "Volume above 1,000 simulations / month",
      "Custom limits and onboarding",
      "Talk through your hiring workflow",
    ],
    cta: "Contact Proof AI",
  },
];

export function planById(id: string | null | undefined): PricingPlan | null {
  if (!id || id === "free") return null;
  return PRICING_PLANS.find((p) => p.id === id) ?? null;
}

export function monthlyLimitForPlan(planId: string | null | undefined): number {
  if (planId === "small_business") return 100;
  if (planId === "enterprise") return 1000;
  return 0;
}

export function isActiveSubscriptionStatus(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}
