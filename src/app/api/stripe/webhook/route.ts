import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { monthlyLimitForPlan, type PaidPlanId } from "@/lib/pricing";

export const runtime = "nodejs";

async function applySubscriptionToUser(args: {
  userId: string;
  planId: PaidPlanId;
  customerId: string | null;
  subscriptionId: string;
  status: string;
}) {
  const admin = createAdminClient();
  await admin
    .from("company_profiles")
    .update({
      plan_id: args.planId,
      stripe_customer_id: args.customerId,
      stripe_subscription_id: args.subscriptionId,
      subscription_status: args.status,
      plan_simulations_per_month: monthlyLimitForPlan(args.planId),
      updated_at: new Date().toISOString(),
    })
    .eq("id", args.userId);
}

async function clearPaidPlan(userId: string) {
  const admin = createAdminClient();
  await admin
    .from("company_profiles")
    .update({
      plan_id: "free",
      stripe_subscription_id: null,
      subscription_status: "canceled",
      plan_simulations_per_month: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("Webhook signature failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId =
        session.client_reference_id ||
        session.metadata?.supabase_user_id ||
        null;
      const planId = (session.metadata?.plan_id ||
        "small_business") as PaidPlanId;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id ?? null;

      if (userId && subscriptionId) {
        await applySubscriptionToUser({
          userId,
          planId,
          customerId,
          subscriptionId,
          status: "active",
        });
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      const planId = (sub.metadata?.plan_id || "small_business") as PaidPlanId;
      if (!userId) {
        return NextResponse.json({ received: true });
      }

      if (
        event.type === "customer.subscription.deleted" ||
        sub.status === "canceled" ||
        sub.status === "unpaid"
      ) {
        await clearPaidPlan(userId);
      } else {
        await applySubscriptionToUser({
          userId,
          planId,
          customerId:
            typeof sub.customer === "string" ? sub.customer : sub.customer.id,
          subscriptionId: sub.id,
          status: sub.status,
        });
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
