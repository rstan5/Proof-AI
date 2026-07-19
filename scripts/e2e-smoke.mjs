import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = env.SUPABASE_SERVICE_ROLE_KEY;
const base = process.env.SMOKE_BASE || "http://localhost:3000";

const ROLE = {
  company_name: "Harbor Family Services",
  role_title: "Licensed Clinical Social Worker",
  job_description: [
    "Provide clinical case management and counseling for families involved with child welfare.",
    "Conduct intake assessments, safety planning, and coordination with schools, courts, and community providers.",
    "Document notes to agency standards, manage caseload prioritization, and escalate risk appropriately.",
    "Work with multi-disciplinary teams while centering client dignity and trauma-informed practice.",
  ].join(" "),
  looking_for: [
    "Clinical judgment and risk assessment",
    "Trauma-informed written communication",
    "Caseload prioritization under constraints",
    "Interagency collaboration and ethical boundaries",
  ].join("; "),
};

const SOCIAL_WORK_TERMS =
  /\b(client|case(?:load)?|family|child(?:ren)?|welfare|intake|counsel(?:or|ing)?|trauma(?:-informed)?|safety|clinic(?:al)?|social work(?:er)?|referral|guardian|neglect|abuse|well[- ]?being|cps|dhs|maltreatment|biopsychosocial|ethical|interagency)\b/gi;

const FINANCE_TERMS =
  /\b(acv|pipeline|sdr|outbound|saas|fintech|roi|quota|crm prospect|series [abc]|ebitda|portfolio trader|equity research)\b/gi;

const results = [];
function log(step, ok, detail) {
  results.push({ step, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${step}${detail ? " — " + detail : ""}`);
}

if (!url || !anon || !service || !env.OPENAI_API_KEY) {
  console.error("Missing env keys");
  process.exit(1);
}

const admin = createClient(url, service);
const email = `e2e+sw+${Date.now()}@proofai.test`;
const password = "TestPass123!";

const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: {
    company_name: ROLE.company_name,
    role_at_company: "Clinical Hiring Manager",
    contact_phone: null,
  },
});
if (createErr) {
  log("createUser", false, createErr.message);
  process.exit(1);
}
const userId = created.user.id;
log("createUser", true, userId);

await admin.from("company_profiles").upsert({
  id: userId,
  company_name: ROLE.company_name,
  role_at_company: "Clinical Hiring Manager",
  contact_phone: null,
});
log("company_profiles upsert", true);

const sb = createClient(url, anon, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data: signed, error: signErr } = await sb.auth.signInWithPassword({
  email,
  password,
});
if (signErr) {
  log("signIn", false, signErr.message);
  process.exit(1);
}
log("signIn", true);

const access = signed.session.access_token;
const refresh = signed.session.refresh_token;
const projectRef = new URL(url).hostname.split(".")[0];
const cookieName = `sb-${projectRef}-auth-token`;
const cookieVal = encodeURIComponent(
  JSON.stringify({
    access_token: access,
    refresh_token: refresh,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    expires_in: 3600,
    token_type: "bearer",
    user: signed.user,
  }),
);

console.log("\nGenerating SOCIAL WORKER simulation (may take 1–3 min)...");
const genController = new AbortController();
const genTimer = setTimeout(() => genController.abort(), 240_000);
let genRes;
try {
  genRes = await fetch(`${base}/api/simulations/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access}`,
      Cookie: `${cookieName}=${cookieVal}`,
    },
    body: JSON.stringify(ROLE),
    signal: genController.signal,
  });
} catch (err) {
  clearTimeout(genTimer);
  log(
    "generate social worker sim",
    false,
    `fetch error: ${err?.cause?.code || err?.message || err}`,
  );
  process.exit(1);
}
clearTimeout(genTimer);

const genText = await genRes.text();
let simId = null;
try {
  simId = JSON.parse(genText).id;
} catch {
  /* ignore */
}
log(
  "generate social worker sim",
  genRes.status === 200 && !!simId,
  `${genRes.status} ${genText.slice(0, 280)}`,
);
if (!simId) {
  console.error("Generate failed — aborting (no finance fallback seed).");
  process.exit(1);
}

const { data: simRow } = await admin
  .from("simulations")
  .select("id, company_name, role_title, job_description, generated_prompt")
  .eq("id", simId)
  .single();

log(
  "stored role_title is social worker",
  /social worker/i.test(simRow?.role_title ?? ""),
  simRow?.role_title ?? "(missing)",
);

let structured;
try {
  structured = JSON.parse(simRow.generated_prompt);
} catch {
  structured = null;
}

log(
  "generated_prompt is structured JSON",
  !!structured?.phases?.length,
  structured?.phases
    ? `${structured.phases.length} phases, ~${structured.total_minutes} min`
    : "parse failed",
);

if (!structured?.phases?.length) process.exit(1);

const corpus = JSON.stringify(structured).toLowerCase();
const socialHits = (corpus.match(SOCIAL_WORK_TERMS) || []).length;
const financeHits = (corpus.match(FINANCE_TERMS) || []).length;

log(
  "content has social-work domain language",
  socialHits >= 5,
  `social-term matches=${socialHits}`,
);
log(
  "content is not finance/SDR flavored",
  financeHits <= 1,
  `finance-term matches=${financeHits}`,
);

const artifactCount = structured.phases.reduce(
  (n, p) => n + (p.artifacts?.length ?? 0),
  0,
);
const memoOrDoc = structured.phases.some((p) =>
  (p.artifacts ?? []).some(
    (a) =>
      (a.type === "memo" || a.type === "doc" || a.type === "email") &&
      (a.body?.length ?? 0) >= 200,
  ),
);
log(
  "phases include substantive on-screen artifacts",
  artifactCount >= 4 && memoOrDoc,
  `artifacts=${artifactCount}, longSource=${memoOrDoc}`,
);

const UNDOABLE =
  /\b(build|create|make|design|produce)\b[\s\S]{0,40}\b(powerpoint|power\s*point|\.pptx|excel (?:model|file|workbook)|spreadsheet file|dashboard|figma|video|phone call)\b/i;
const TEXT_DELIVERABLE =
  /\b(write|draft|reply|respond|compose|type|email|memo|note|outline|pitch|report|letter|script|rationale)\b/i;

let undoablePhases = 0;
let textyPhases = 0;
for (const p of structured.phases) {
  const blob = `${p.task}\n${p.deliverable}`;
  if (UNDOABLE.test(blob)) undoablePhases += 1;
  if (TEXT_DELIVERABLE.test(blob)) textyPhases += 1;
}
log(
  "deliverables are text-box completable",
  undoablePhases === 0 && textyPhases >= 3,
  `undoable=${undoablePhases}, texty=${textyPhases}/${structured.phases.length}`,
);

const hasNumericTable = structured.phases.some(
  (p) =>
    (p.artifacts ?? []).some(
      (a) =>
        a.type === "data_table" &&
        (a.rows?.length ?? 0) >= 3 &&
        /\d/.test(JSON.stringify(a.rows ?? [])),
    ),
);
log(
  "at least one phase has real numeric data_table",
  hasNumericTable,
  hasNumericTable ? "ok" : "missing quantitative source",
);

console.log("\nPhase titles:");
for (const p of structured.phases) {
  console.log(`  ${p.number}. ${p.title} (${p.minutes}m) — ${(p.artifacts ?? []).map((a) => a.type).join(", ")}`);
  console.log(`     deliverable: ${(p.deliverable || "").slice(0, 100)}`);
}

const pageAnon = await fetch(`${base}/sim/${simId}`);
log("sim page (anon)", pageAnon.status === 200, String(pageAnon.status));

const html = await pageAnon.text();
log(
  "sim page shows role + secure intro",
  /Licensed Clinical Social Worker/i.test(html) &&
    (/Secure assessment/i.test(html) || /Begin/i.test(html)),
  "markers checked",
);

const socialResponse = [
  "PHASE 1",
  "Conducted biopsychosocial intake noting housing instability, school absences, and prior CPS contact.",
  "Safety plan: emergency contacts, school counselor check-ins, and next home visit within 48 hours.",
  "",
  "PHASE 2",
  "Prioritized caseload: highest risk first based on imminent harm indicators vs. stable open cases.",
  "",
  "PHASE 3",
  "Drafted interagency email to school social worker with clear consents and trauma-informed language.",
  "",
  "PHASE 4",
  "Documented session note with goals, interventions, and ethical boundary reminder regarding dual roles.",
].join("\n");

const subRes = await fetch(`${base}/api/submissions`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    simulation_id: simId,
    candidate_name: "Jordan Reese, LCSW Candidate",
    response: socialResponse,
    violation_count: 0,
  }),
});
const subText = await subRes.text();
let subJson = {};
try {
  subJson = JSON.parse(subText);
} catch {
  /* ignore */
}
log(
  "submit + evaluate social worker response",
  subRes.status === 200 && subJson.ok === true && subJson.evaluated === true,
  `${subRes.status} ${subText.slice(0, 220)}`,
);

if (subJson.id) {
  const { data: row } = await admin
    .from("submissions")
    .select("id,evaluation_json,violation_count")
    .eq("id", subJson.id)
    .single();
  const score = row?.evaluation_json?.overall_score;
  log(
    "evaluation_json persisted",
    typeof score === "number",
    typeof score === "number"
      ? `score=${score} rec=${row.evaluation_json.recommendation}`
      : JSON.stringify(row).slice(0, 200),
  );

  const dash = await fetch(`${base}/dashboard/candidates/${subJson.id}`, {
    headers: { Cookie: `${cookieName}=${cookieVal}` },
    redirect: "manual",
  });
  log(
    "candidate report page",
    dash.status === 200 || dash.status === 307 || dash.status === 302,
    String(dash.status),
  );
}

const voidRes = await fetch(`${base}/api/submissions`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    simulation_id: simId,
    candidate_name: "Alex Void Test",
    response:
      "[ASSESSMENT VOIDED]\nReason: Candidate exited fullscreen during the secure assessment.",
    violation_count: 1,
    voided: true,
  }),
});
const voidJson = await voidRes.json().catch(() => ({}));
log(
  "voided submission API",
  voidRes.status === 200 && voidJson.voided === true,
  JSON.stringify(voidJson).slice(0, 180),
);

if (voidJson.id) {
  const { data: voidRow } = await admin
    .from("submissions")
    .select("evaluation_json")
    .eq("id", voidJson.id)
    .single();
  log(
    "voided evaluation stored",
    !!voidRow?.evaluation_json?.recommendation?.startsWith("Voided"),
    voidRow?.evaluation_json?.recommendation ?? "(missing)",
  );
}

console.log("\nFree-tier limit (second generate must be blocked)...");
const limitRes = await fetch(`${base}/api/simulations/generate`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${access}`,
    Cookie: `${cookieName}=${cookieVal}`,
  },
  body: JSON.stringify({
    ...ROLE,
    role_title: "Second Sample Should Fail",
  }),
});
const limitText = await limitRes.text();
let limitJson = {};
try {
  limitJson = JSON.parse(limitText);
} catch {
  /* ignore */
}
log(
  "second generate blocked (sample limit)",
  limitRes.status === 403 &&
    limitJson.code === "SAMPLE_LIMIT_REACHED" &&
    /contact\.proof\.ai@gmail\.com/i.test(limitText),
  `${limitRes.status} ${limitText.slice(0, 220)}`,
);

const unauthGen = await fetch(`${base}/api/simulations/generate`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(ROLE),
});
log(
  "unauthenticated generate rejected",
  unauthGen.status === 401,
  String(unauthGen.status),
);

console.log("\nCritical routes...");
const home = await fetch(`${base}/`);
const homeHtml = await home.text();
log(
  "landing page",
  home.status === 200 && /Proof/i.test(homeHtml),
  String(home.status),
);
log(
  "landing CTA → login → simulate",
  /login\?next=%2Fdashboard%3Ftab%3Dsimulate/.test(homeHtml),
  "CTA href checked",
);
log(
  "landing Contact email",
  /contact\.proof\.ai@gmail\.com/.test(homeHtml),
  "footer/contact checked",
);

const loginPage = await fetch(`${base}/login`);
log("login page", loginPage.status === 200, String(loginPage.status));

const dash = await fetch(`${base}/dashboard?tab=simulate`, {
  headers: { Cookie: `${cookieName}=${cookieVal}` },
  redirect: "manual",
});
log(
  "dashboard simulate tab (authed)",
  dash.status === 200,
  String(dash.status),
);

const dashAnon = await fetch(`${base}/dashboard`, { redirect: "manual" });
log(
  "dashboard redirects when anonymous",
  dashAnon.status === 307 || dashAnon.status === 302 || dashAnon.status === 303,
  String(dashAnon.status),
);

const failed = results.filter((r) => !r.ok);
console.log("\n--- summary ---");
console.log(`${results.length - failed.length}/${results.length} passed`);
if (failed.length) {
  console.log("Failures:");
  for (const f of failed) console.log(` - ${f.step}: ${f.detail}`);
  process.exit(1);
}
console.log("email:", email);
console.log("simId:", simId);
console.log("submissionId:", subJson.id);
