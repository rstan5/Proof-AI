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
const email = `stripe-verify-${Date.now()}@proofai-test.local`;
const password = `Verify-${Math.random().toString(36).slice(2)}A1!`;

const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

function log(name, pass, detail = "") {
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  return !!pass;
}

let fails = 0;
const assert = (name, pass, detail) => {
  if (!log(name, pass, detail)) fails += 1;
};

console.log(`Using base=${base}`);
console.log(`Creating temp user ${email}`);

const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { company_name: "Stripe Verify Co" },
});
if (createErr || !created.user) {
  console.error("Could not create user:", createErr);
  process.exit(1);
}
const userId = created.user.id;

try {
  await admin.from("company_profiles").upsert({
    id: userId,
    company_name: "Stripe Verify Co",
    role_at_company: "Founder",
    plan_id: "free",
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
  assert("Sign in temp user", !signErr && !!signedIn.session, signErr?.message);
  const token = signedIn.session.access_token;

  // First generate body shape check (gate runs after validation)
  const genBody = {
    company_name: "Stripe Verify Co",
    role_title: "Verify Analyst",
    job_description: "Analyze candidate competency under time pressure.",
    looking_for: "Clear reasoning and structured communication.",
  };

  // Insert a fake simulation to simulate free sample used
  const { error: simErr } = await admin.from("simulations").insert({
    company_name: "Stripe Verify Co",
    role_title: "Paywall Probe Role",
    job_description: "Probe JD",
    looking_for: "Probe traits",
    generated_prompt: "{}",
    recruiter_id: userId,
    role: "Paywall Probe Role",
  });
  if (simErr) {
    console.log("NOTE  could not insert sim directly:", simErr.message);
  }

  const { count } = await admin
    .from("simulations")
    .select("*", { count: "exact", head: true })
    .eq("recruiter_id", userId);
  console.log(`Simulations for user: ${count}`);

  if ((count ?? 0) < 1) {
    assert("Have >=1 sim for paywall test", false, "no simulation row");
  } else {
    const gen2 = await fetch(`${base}/api/simulations/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...genBody,
        role_title: "Second Role After Free Sample",
      }),
    });
    const gen2Json = await gen2.json().catch(() => ({}));
    assert(
      "Second generate blocked with pricing paywall",
      gen2.status === 403 &&
        gen2Json.code === "SAMPLE_LIMIT_REACHED" &&
        (gen2Json.pricing_url === "/pricing" ||
          /pricing/i.test(gen2Json.error || "")),
      `${gen2.status} ${JSON.stringify(gen2Json).slice(0, 240)}`,
    );
  }

  // Authenticated checkout → Stripe session URL
  const checkout = await fetch(`${base}/api/stripe/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ plan: "small_business" }),
  });
  const checkoutJson = await checkout.json().catch(() => ({}));
  const hasUrl =
    checkout.status === 200 &&
    typeof checkoutJson.url === "string" &&
    /stripe\.com|checkout/i.test(checkoutJson.url);
  assert(
    "Checkout creates Stripe session URL",
    hasUrl,
    `${checkout.status} ${JSON.stringify(checkoutJson).slice(0, 300)}`,
  );

  if (hasUrl) {
    const page = await fetch(checkoutJson.url, { redirect: "manual" });
    assert(
      "Stripe Checkout URL reachable",
      page.status >= 200 && page.status < 400,
      String(page.status),
    );
    // Cancel the open session so we don't leave dangling checkouts
    try {
      const stripe = new Stripe(env.STRIPE_SECRET_KEY);
      const match = checkoutJson.url.match(/cs_live_[A-Za-z0-9]+|cs_test_[A-Za-z0-9]+/);
      // URL is usually https://checkout.stripe.com/c/pay/cs_live_...
      const idMatch = checkoutJson.url.match(/(cs_(?:live|test)_[A-Za-z0-9]+)/);
      if (idMatch) {
        await stripe.checkout.sessions.expire(idMatch[1]).catch(() => {});
        console.log(`Expired checkout session ${idMatch[1]}`);
      }
    } catch (e) {
      console.log("NOTE  could not expire session:", e.message);
    }
  }

  // Confirm profile still free (we didn't complete payment)
  const { data: profile } = await admin
    .from("company_profiles")
    .select("plan_id, stripe_customer_id, subscription_status")
    .eq("id", userId)
    .maybeSingle();
  assert(
    "Profile still free until payment webhook",
    !profile?.plan_id || profile.plan_id === "free",
    JSON.stringify(profile),
  );
  if (profile?.stripe_customer_id) {
    console.log("NOTE  stripe_customer_id was saved during checkout start:", profile.stripe_customer_id);
  }
} finally {
  await admin.auth.admin.deleteUser(userId);
  console.log("Cleaned up temp user");
}

console.log(fails ? `\n${fails} check(s) failed` : "\nAll authenticated checks passed");
process.exit(fails ? 1 : 0);
