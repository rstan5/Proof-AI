import type { SupabaseClient } from "@supabase/supabase-js";
import {
  FREE_SAMPLE_LIMIT,
  MONTHLY_LIMIT_CODE,
  MONTHLY_LIMIT_MESSAGE,
  SAMPLE_LIMIT_CODE,
  sampleLimitBlurb,
} from "@/lib/free-tier";
import {
  isActiveSubscriptionStatus,
  monthlyLimitForPlan,
} from "@/lib/pricing";

export type GenerateGate =
  | { ok: true }
  | {
      ok: false;
      status: 403;
      code: string;
      error: string;
      pricing_url: string;
    };

function startOfUtcMonth(d = new Date()): string {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

/** Enforce free sample (1 lifetime) or paid monthly quota. */
export async function assertCanGenerateSimulation(
  supabase: SupabaseClient,
  userId: string,
): Promise<GenerateGate> {
  const { data: profile } = await supabase
    .from("company_profiles")
    .select(
      "plan_id, subscription_status, plan_simulations_per_month",
    )
    .eq("id", userId)
    .maybeSingle();

  const planId = profile?.plan_id ?? "free";
  const status = profile?.subscription_status ?? null;
  const paid =
    planId !== "free" && isActiveSubscriptionStatus(status);
  const monthlyCap =
    profile?.plan_simulations_per_month ?? monthlyLimitForPlan(planId);

  if (paid && monthlyCap > 0) {
    const { count, error } = await supabase
      .from("simulations")
      .select("id", { count: "exact", head: true })
      .eq("recruiter_id", userId)
      .gte("created_at", startOfUtcMonth());

    if (error) {
      console.error("Monthly sim count error:", error);
      return {
        ok: false,
        status: 403,
        code: "SERVER_ERROR",
        error: "Unable to verify plan usage. Try again.",
        pricing_url: "/pricing",
      };
    }

    if ((count ?? 0) >= monthlyCap) {
      return {
        ok: false,
        status: 403,
        code: MONTHLY_LIMIT_CODE,
        error: MONTHLY_LIMIT_MESSAGE,
        pricing_url: "/pricing",
      };
    }

    return { ok: true };
  }

  // Free tier: one lifetime sample
  const { count, error } = await supabase
    .from("simulations")
    .select("id", { count: "exact", head: true })
    .eq("recruiter_id", userId);

  if (error) {
    console.error("Simulation count error:", error);
    return {
      ok: false,
      status: 403,
      code: "SERVER_ERROR",
      error: "Unable to verify free sample usage. Try again.",
      pricing_url: "/pricing",
    };
  }

  if ((count ?? 0) >= FREE_SAMPLE_LIMIT) {
    return {
      ok: false,
      status: 403,
      code: SAMPLE_LIMIT_CODE,
      error: sampleLimitBlurb(),
      pricing_url: "/pricing",
    };
  }

  return { ok: true };
}
