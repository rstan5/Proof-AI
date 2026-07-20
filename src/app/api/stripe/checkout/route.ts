import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/supabase/request-user";
import { appBaseUrl, getStripe } from "@/lib/stripe";
import { PRICING_PLANS, type PaidPlanId } from "@/lib/pricing";

export async function POST(request: Request) {
  try {
    const authed = await getRequestUser(request);
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { user, supabase } = authed;

    const body = (await request.json().catch(() => ({}))) as {
      plan?: string;
    };
    const planId = body.plan as PaidPlanId | undefined;
    const plan = PRICING_PLANS.find(
      (p) => p.id === planId && p.priceCents != null,
    );
    if (!plan || plan.priceCents == null) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured yet. Add STRIPE_SECRET_KEY to enable checkout.",
        },
        { status: 503 },
      );
    }

    const stripe = getStripe();
    const base = appBaseUrl();

    const { data: profile } = await supabase
      .from("company_profiles")
      .select("company_name, stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        name: profile?.company_name ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase
        .from("company_profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      metadata: {
        supabase_user_id: user.id,
        plan_id: plan.id,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan_id: plan.id,
        },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: plan.priceCents,
            recurring: { interval: "month" },
            product_data: {
              name: `Proof AI — ${plan.name}`,
              description: `${plan.simulationsPerMonth} simulations / month`,
            },
          },
        },
      ],
      success_url: `${base}/dashboard?tab=simulate&upgraded=1`,
      cancel_url: `${base}/pricing?canceled=1`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not start checkout" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
