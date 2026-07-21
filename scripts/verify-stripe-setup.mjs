import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .map((l) => l.match(/^([^#=]+)=(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1].trim(), m[2].trim()]),
);

const base = process.env.VERIFY_BASE || "https://proof-ai-two.vercel.app";
const checks = [];

function ok(name, pass, detail = "") {
  checks.push({ name, pass: !!pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
);

const { data: profiles, error: profileErr } = await supabase
  .from("company_profiles")
  .select(
    "id, plan_id, stripe_customer_id, subscription_status, plan_simulations_per_month",
  )
  .limit(5);

ok(
  "DB subscription columns exist",
  !profileErr,
  profileErr ? profileErr.message : `sample rows=${profiles?.length ?? 0}`,
);

const pricing = await fetch(`${base}/pricing`);
const pricingHtml = await pricing.text();
ok("Pricing page 200", pricing.status === 200, String(pricing.status));
ok(
  "Pricing shows 3 tiers",
  /Small Business/.test(pricingHtml) &&
    /Enterprise/.test(pricingHtml) &&
    /Custom/.test(pricingHtml) &&
    /\$50/.test(pricingHtml) &&
    /\$400/.test(pricingHtml),
);

const home = await fetch(base);
const homeHtml = await home.text();
ok("Home has Pricing nav", /href="\/pricing"/.test(homeHtml) || />Pricing</.test(homeHtml));

const login = await fetch(`${base}/login`);
ok("Login page loads", login.status === 200, String(login.status));

const checkout = await fetch(`${base}/api/stripe/checkout`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ plan: "small_business" }),
});
const checkoutJson = await checkout.json().catch(() => ({}));
ok(
  "Checkout requires auth (401)",
  checkout.status === 401,
  `${checkout.status} ${JSON.stringify(checkoutJson)}`,
);

const webhook = await fetch(`${base}/api/stripe/webhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: "{}",
});
const webhookJson = await webhook.json().catch(() => ({}));
// 503 = Stripe env missing on Vercel; 400 Missing signature = keys present
ok(
  "Webhook endpoint configured on Vercel",
  webhook.status === 400 && /signature/i.test(JSON.stringify(webhookJson)),
  `${webhook.status} ${JSON.stringify(webhookJson)}`,
);

ok(
  "Local STRIPE_SECRET_KEY set",
  !!env.STRIPE_SECRET_KEY?.startsWith("sk_"),
);
ok(
  "Local STRIPE_WEBHOOK_SECRET set",
  !!env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_"),
);

// Stripe API ping with local key
try {
  const r = await fetch("https://api.stripe.com/v1/balance", {
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
  });
  const j = await r.json();
  ok(
    "Stripe secret key valid (API)",
    r.ok && !j.error,
    r.ok ? "balance readable" : JSON.stringify(j.error || j).slice(0, 120),
  );
} catch (e) {
  ok("Stripe secret key valid (API)", false, String(e));
}

const failed = checks.filter((c) => !c.pass);
console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
process.exit(failed.length ? 1 : 0);
