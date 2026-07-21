/**
 * Verify webhook → plan unlock without charging a card.
 * Signs a fake checkout.session.completed with STRIPE_WEBHOOK_SECRET
 * (same technique as Stripe CLI / generateTestHeaderString).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import Stripe from "stripe";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .map((l) => l.match(/^([^#=]+)=(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1].trim(), m[2].trim()]),
);

const base = process.env.VERIFY_BASE || "https://proof-ai-two.vercel.app";
const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret?.startsWith("whsec_")) {
  console.error("Missing STRIPE_WEBHOOK_SECRET in .env.local");
  process.exit(1);
}

const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const email = `webhook-verify-${Date.now()}@proofai-test.local`;
const password = `Verify-${Math.random().toString(36).slice(2)}A1!`;

function log(name, pass, detail = "") {
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  return !!pass;
}

let fails = 0;
const assert = (n, p, d) => {
  if (!log(n, p, d)) fails += 1;
};

console.log(`Base: ${base}`);
console.log(`Creating temp user ${email}`);

const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
if (createErr || !created.user) {
  console.error(createErr);
  process.exit(1);
}
const userId = created.user.id;

try {
  const { error: profileErr } = await admin.from("company_profiles").upsert({
    id: userId,
    company_name: "Webhook Verify Co",
    role_at_company: "Founder",
    plan_id: "free",
  });
  assert("Create free profile", !profileErr, profileErr?.message);

  // Use free sample
  await admin.from("simulations").insert({
    company_name: "Webhook Verify Co",
    role_title: "Sample Role",
    job_description: "JD",
    looking_for: "Traits",
    generated_prompt: "{}",
    recruiter_id: userId,
    role: "Sample Role",
  });

  const anon = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { data: signedIn, error: signErr } = await anon.auth.signInWithPassword({
    email,
    password,
  });
  assert("Sign in", !signErr && !!signedIn.session, signErr?.message);
  const token = signedIn.session.access_token;

  // Confirm paywall before unlock
  const blocked = await fetch(`${base}/api/simulations/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      company_name: "Webhook Verify Co",
      role_title: "Blocked Role",
      job_description: "Should be blocked",
      looking_for: "N/A",
    }),
  });
  const blockedJson = await blocked.json().catch(() => ({}));
  assert(
    "Paywall blocks before webhook",
    blocked.status === 403 && blockedJson.code === "SAMPLE_LIMIT_REACHED",
    `${blocked.status} ${JSON.stringify(blockedJson).slice(0, 180)}`,
  );

  // Fake completed checkout — no card charged
  const fakeSubId = `sub_test_verify_${Date.now()}`;
  const fakeCustId = `cus_test_verify_${Date.now()}`;
  const payload = JSON.stringify({
    id: `evt_test_verify_${Date.now()}`,
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: `cs_test_verify_${Date.now()}`,
        object: "checkout.session",
        client_reference_id: userId,
        customer: fakeCustId,
        subscription: fakeSubId,
        metadata: {
          supabase_user_id: userId,
          plan_id: "small_business",
        },
        mode: "subscription",
        payment_status: "paid",
        status: "complete",
      },
    },
  });

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: webhookSecret,
  });

  const whRes = await fetch(`${base}/api/stripe/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": signature,
    },
    body: payload,
  });
  const whJson = await whRes.json().catch(() => ({}));
  assert(
    "Webhook accepts signed fake checkout (no charge)",
    whRes.status === 200 && whJson.received === true,
    `${whRes.status} ${JSON.stringify(whJson)}`,
  );

  const { data: profile } = await admin
    .from("company_profiles")
    .select(
      "plan_id, subscription_status, plan_simulations_per_month, stripe_subscription_id",
    )
    .eq("id", userId)
    .single();

  assert(
    "Profile upgraded to small_business",
    profile?.plan_id === "small_business" &&
      profile?.subscription_status === "active" &&
      profile?.plan_simulations_per_month === 100 &&
      profile?.stripe_subscription_id === fakeSubId,
    JSON.stringify(profile),
  );

  // Paid user can generate again (gate only — may still hit OpenAI later)
  const allowed = await fetch(`${base}/api/simulations/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      company_name: "Webhook Verify Co",
      role_title: "Paid Role",
      job_description: "Should pass the paywall gate",
      looking_for: "N/A",
    }),
  });
  const allowedJson = await allowed.json().catch(() => ({}));
  assert(
    "Generate no longer blocked by free-sample paywall",
    allowed.status !== 403 ||
      (allowedJson.code !== "SAMPLE_LIMIT_REACHED" &&
        allowedJson.code !== "MONTHLY_LIMIT_REACHED"),
    `${allowed.status} ${JSON.stringify(allowedJson).slice(0, 200)}`,
  );

  // Also verify cancel path without charge
  const cancelPayload = JSON.stringify({
    id: `evt_test_cancel_${Date.now()}`,
    object: "event",
    type: "customer.subscription.deleted",
    data: {
      object: {
        id: fakeSubId,
        object: "subscription",
        status: "canceled",
        customer: fakeCustId,
        metadata: {
          supabase_user_id: userId,
          plan_id: "small_business",
        },
      },
    },
  });
  const cancelSig = stripe.webhooks.generateTestHeaderString({
    payload: cancelPayload,
    secret: webhookSecret,
  });
  const cancelRes = await fetch(`${base}/api/stripe/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": cancelSig,
    },
    body: cancelPayload,
  });
  assert("Cancel webhook accepted", cancelRes.status === 200, String(cancelRes.status));

  const { data: afterCancel } = await admin
    .from("company_profiles")
    .select("plan_id, subscription_status")
    .eq("id", userId)
    .single();
  assert(
    "Plan cleared after cancel webhook",
    afterCancel?.plan_id === "free" &&
      afterCancel?.subscription_status === "canceled",
    JSON.stringify(afterCancel),
  );
} finally {
  await admin.auth.admin.deleteUser(userId);
  console.log("Cleaned up temp user");
}

console.log(fails ? `\n${fails} check(s) failed` : "\nAll no-charge webhook checks passed");
process.exit(fails ? 1 : 0);
