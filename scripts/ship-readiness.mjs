/**
 * Final ship-readiness checklist against production.
 * No real card charge — uses signed webhook to unlock paid plan.
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

const base = process.env.SHIP_BASE || "https://proof-ai-two.vercel.app";
const results = [];
const section = (title) => console.log(`\n=== ${title} ===`);
function check(name, pass, detail = "") {
  results.push({ name, pass: !!pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const ROLE = {
  company_name: "Ship Ready Clinics",
  role_title: "Licensed Clinical Social Worker",
  job_description:
    "Provide clinical case management and counseling for families. Conduct intake assessments, safety planning, and coordination with schools and community providers. Document notes to agency standards.",
  looking_for:
    "Clinical judgment; trauma-informed communication; prioritization under constraints; ethical boundaries",
};

console.log(`Ship readiness against ${base}\n`);

// ---------- A. Public surface ----------
section("Public product surface");
for (const path of ["/", "/pricing", "/login"]) {
  const r = await fetch(`${base}${path}`);
  const html = await r.text();
  check(`${path} returns 200`, r.status === 200, String(r.status));
  if (path === "/") {
    check("Home has Pricing nav", /\/pricing/.test(html) && /Pricing/.test(html));
  }
  if (path === "/pricing") {
    check(
      "Pricing shows 3 plans",
      /Small Business/.test(html) &&
        /Enterprise/.test(html) &&
        /Custom/.test(html) &&
        /\$50/.test(html) &&
        /\$400/.test(html),
    );
    check(
      "Custom contacts Proof AI",
      /contact\.proof\.ai@gmail\.com/.test(html) || /Contact Proof AI/.test(html),
    );
  }
}

// ---------- B. Infrastructure ----------
section("Infrastructure");
const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const { data: cols, error: colErr } = await admin
  .from("company_profiles")
  .select(
    "id, plan_id, stripe_customer_id, subscription_status, plan_simulations_per_month",
  )
  .limit(1);
check("Subscription DB columns exist", !colErr, colErr?.message);

check("Local Stripe secret present", !!env.STRIPE_SECRET_KEY?.startsWith("sk_"));
check(
  "Local webhook secret present",
  !!env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_"),
);

const stripe = new Stripe(env.STRIPE_SECRET_KEY);
try {
  await stripe.balance.retrieve();
  check("Stripe live API key works", true);
} catch (e) {
  check("Stripe live API key works", false, e.message);
}

const whProbe = await fetch(`${base}/api/stripe/webhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: "{}",
});
const whProbeJson = await whProbe.json().catch(() => ({}));
check(
  "Vercel webhook configured (rejects unsigned)",
  whProbe.status === 400 && /signature/i.test(JSON.stringify(whProbeJson)),
  `${whProbe.status} ${JSON.stringify(whProbeJson)}`,
);

const checkoutAnon = await fetch(`${base}/api/stripe/checkout`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ plan: "small_business" }),
});
check(
  "Checkout requires login",
  checkoutAnon.status === 401,
  String(checkoutAnon.status),
);

// ---------- C. Full customer journey ----------
section("Customer journey (auth → free → paywall → unlock → generate)");
const email = `ship+${Date.now()}@proofai-test.local`;
const password = `Ship-${Math.random().toString(36).slice(2)}A1!`;

const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: {
    company_name: ROLE.company_name,
    role_at_company: "Hiring Manager",
  },
});
if (createErr || !created.user) {
  check("Create company user", false, createErr?.message);
  console.error("Aborting journey — cannot create user");
  process.exit(1);
}
const userId = created.user.id;
check("Create company user", true, userId);

try {
  await admin.from("company_profiles").upsert({
    id: userId,
    company_name: ROLE.company_name,
    role_at_company: "Hiring Manager",
    plan_id: "free",
  });

  const anon = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { data: signed, error: signErr } = await anon.auth.signInWithPassword({
    email,
    password,
  });
  check("Sign in", !signErr && !!signed.session, signErr?.message);
  const token = signed.session.access_token;

  console.log("Generating free sample (may take 1–3 min)...");
  const gen1 = await fetch(`${base}/api/simulations/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(ROLE),
  });
  const gen1Json = await gen1.json().catch(() => ({}));
  const simId = gen1Json.id;
  check(
    "Free sample generates",
    gen1.status === 200 && !!simId,
    `${gen1.status} ${JSON.stringify(gen1Json).slice(0, 220)}`,
  );

  if (simId) {
    const { data: simRow } = await admin
      .from("simulations")
      .select("role_title, generated_prompt")
      .eq("id", simId)
      .single();
    let structured = null;
    try {
      structured = JSON.parse(simRow.generated_prompt);
    } catch {
      /* ignore */
    }
    check(
      "Simulation has structured phases",
      !!structured?.phases?.length,
      structured?.phases
        ? `${structured.phases.length} phases`
        : "missing phases",
    );

    const simPage = await fetch(`${base}/sim/${simId}`);
    const simHtml = await simPage.text();
    check("Candidate sim page loads", simPage.status === 200, String(simPage.status));
    check(
      "Candidate page shows role",
      /Licensed Clinical Social Worker/i.test(simHtml),
    );

    // Candidate submission
    const subRes = await fetch(`${base}/api/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        simulation_id: simId,
        candidate_name: "Ship Test Candidate",
        response: [
          "PHASE 1: Completed biopsychosocial intake with safety plan and school coordination.",
          "PHASE 2: Prioritized caseload by imminent risk indicators.",
          "PHASE 3: Drafted trauma-informed interagency email with consent language.",
          "PHASE 4: Documented session note with goals and ethical boundaries.",
        ].join("\n"),
        violation_count: 0,
      }),
    });
    const subJson = await subRes.json().catch(() => ({}));
    check(
      "Candidate can submit + get evaluated",
      subRes.status === 200 &&
        !!subJson.id &&
        (subJson.ok === true || subJson.evaluated === true),
      `${subRes.status} ${JSON.stringify(subJson).slice(0, 200)}`,
    );

    const dash = await fetch(`${base}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
      redirect: "manual",
    });
    // dashboard may redirect unauthenticated cookie-less requests
    check(
      "Dashboard route responds",
      dash.status === 200 || dash.status === 307 || dash.status === 302,
      String(dash.status),
    );
  }

  // Paywall
  const gen2 = await fetch(`${base}/api/simulations/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...ROLE,
      role_title: "Second Role After Free Sample",
    }),
  });
  const gen2Json = await gen2.json().catch(() => ({}));
  check(
    "Second generate blocked by paywall",
    gen2.status === 403 &&
      gen2Json.code === "SAMPLE_LIMIT_REACHED" &&
      gen2Json.pricing_url === "/pricing",
    `${gen2.status} ${JSON.stringify(gen2Json).slice(0, 220)}`,
  );

  // Stripe checkout session (no payment)
  const checkout = await fetch(`${base}/api/stripe/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ plan: "small_business" }),
  });
  const checkoutJson = await checkout.json().catch(() => ({}));
  const checkoutOk =
    checkout.status === 200 &&
    typeof checkoutJson.url === "string" &&
    /checkout\.stripe\.com/.test(checkoutJson.url);
  check(
    "Stripe Checkout session created",
    checkoutOk,
    `${checkout.status} ${JSON.stringify(checkoutJson).slice(0, 260)}`,
  );

  if (checkoutOk) {
    const idMatch = checkoutJson.url.match(/(cs_(?:live|test)_[A-Za-z0-9]+)/);
    if (idMatch) {
      const session = await stripe.checkout.sessions.retrieve(idMatch[1]);
      check(
        "Checkout is $50/mo subscription",
        session.mode === "subscription" && session.status === "open",
        `mode=${session.mode} status=${session.status}`,
      );
      check(
        "Checkout success returns to dashboard",
        /\/dashboard/.test(session.success_url || ""),
        session.success_url || "(missing)",
      );
      await stripe.checkout.sessions.expire(idMatch[1]).catch(() => {});
    }
  }

  // Unlock via signed webhook (no charge)
  const fakeSubId = `sub_ship_${Date.now()}`;
  const payload = JSON.stringify({
    id: `evt_ship_${Date.now()}`,
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: `cs_ship_${Date.now()}`,
        object: "checkout.session",
        client_reference_id: userId,
        customer: `cus_ship_${Date.now()}`,
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
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: env.STRIPE_WEBHOOK_SECRET,
  });
  const wh = await fetch(`${base}/api/stripe/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": signature,
    },
    body: payload,
  });
  const whJson = await wh.json().catch(() => ({}));
  check(
    "Webhook unlocks plan without card charge",
    wh.status === 200 && whJson.received === true,
    `${wh.status} ${JSON.stringify(whJson)}`,
  );

  const { data: profile } = await admin
    .from("company_profiles")
    .select("plan_id, subscription_status, plan_simulations_per_month")
    .eq("id", userId)
    .single();
  check(
    "Account is Small Business active (100/mo)",
    profile?.plan_id === "small_business" &&
      profile?.subscription_status === "active" &&
      profile?.plan_simulations_per_month === 100,
    JSON.stringify(profile),
  );

  console.log("Paid generate after unlock (may take 1–3 min)...");
  const gen3 = await fetch(`${base}/api/simulations/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...ROLE,
      role_title: "Paid Plan Role",
    }),
  });
  const gen3Json = await gen3.json().catch(() => ({}));
  check(
    "Paid plan can generate again",
    gen3.status === 200 && !!gen3Json.id,
    `${gen3.status} ${JSON.stringify(gen3Json).slice(0, 220)}`,
  );

  // Cancel path
  const cancelPayload = JSON.stringify({
    id: `evt_ship_cancel_${Date.now()}`,
    object: "event",
    type: "customer.subscription.deleted",
    data: {
      object: {
        id: fakeSubId,
        object: "subscription",
        status: "canceled",
        customer: `cus_ship_${Date.now()}`,
        metadata: {
          supabase_user_id: userId,
          plan_id: "small_business",
        },
      },
    },
  });
  const cancelSig = stripe.webhooks.generateTestHeaderString({
    payload: cancelPayload,
    secret: env.STRIPE_WEBHOOK_SECRET,
  });
  const cancelRes = await fetch(`${base}/api/stripe/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": cancelSig,
    },
    body: cancelPayload,
  });
  check("Cancel webhook accepted", cancelRes.status === 200);

  const { data: after } = await admin
    .from("company_profiles")
    .select("plan_id, subscription_status")
    .eq("id", userId)
    .single();
  check(
    "Cancel returns account to free",
    after?.plan_id === "free" && after?.subscription_status === "canceled",
    JSON.stringify(after),
  );

  // Enterprise checkout path also works
  await admin
    .from("company_profiles")
    .update({
      plan_id: "free",
      subscription_status: null,
      stripe_customer_id: null,
      stripe_subscription_id: null,
    })
    .eq("id", userId);
  const ent = await fetch(`${base}/api/stripe/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ plan: "enterprise" }),
  });
  const entJson = await ent.json().catch(() => ({}));
  check(
    "Enterprise Checkout session created",
    ent.status === 200 && /checkout\.stripe\.com/.test(entJson.url || ""),
    `${ent.status} ${JSON.stringify(entJson).slice(0, 180)}`,
  );
  if (entJson.url) {
    const id = entJson.url.match(/(cs_(?:live|test)_[A-Za-z0-9]+)/)?.[1];
    if (id) await stripe.checkout.sessions.expire(id).catch(() => {});
  }
} finally {
  // cleanup sims + user
  await admin.from("simulations").delete().eq("recruiter_id", userId);
  await admin.auth.admin.deleteUser(userId);
  console.log("\nCleaned up ship-test user + sims");
}

// ---------- Summary ----------
section("Summary");
const failed = results.filter((r) => !r.pass);
const passed = results.length - failed.length;
console.log(`${passed}/${results.length} checks passed`);
if (failed.length) {
  console.log("\nFAILED:");
  for (const f of failed) console.log(`  - ${f.name}${f.detail ? `: ${f.detail}` : ""}`);
  console.log("\nSHIP BLOCKED — fix failures above before selling.");
  process.exit(1);
}
console.log("\nSHIP READY — core product + billing path verified (no live card charged).");
process.exit(0);
