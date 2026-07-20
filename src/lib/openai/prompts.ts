import type { JobRole } from "@/types/roles";

export function simulationSystemPrompt(): string {
  return [
    "You are an expert hiring assessor and instructional designer.",
    "Generate ONE realistic job simulation for the specified role.",
    "The simulation must read like a brief a candidate would receive at work: context, constraints, deliverable, and success criteria.",
    "Do not mention that you are an AI. Do not include meta commentary.",
    "Output plain text only (no JSON).",
  ].join(" ");
}

export function simulationUserPrompt(role: JobRole): string {
  return [
    `Role: ${role}`,
    "",
    "Include: company/context, stakeholder details, time pressure, and the exact output you want from the candidate.",
    "If the role is SDR, include prospect details and at least one objection to handle.",
    "If Financial Analyst, include a small dataset description and the analysis/decision required.",
    "If Customer Support, include a customer message thread and escalation constraints.",
    "If Product Manager, include a tradeoff decision with metrics and stakeholders.",
    "",
    "Length: roughly 180-320 words.",
  ].join("\n");
}

export interface CustomSimulationParams {
  company_name: string;
  role_title: string;
  job_description: string;
  looking_for: string;
}

/**
 * System prompt for recruiter-driven simulation generation.
 * Returns strict JSON so the candidate UI can render a phase-by-phase wizard
 * with realistic in-app work artifacts (no fake PDFs/attachments).
 */
export function customSimulationSystemPrompt(): string {
  return [
    "You are a senior occupational psychologist and instructional designer who builds high-stakes hiring simulations for Fortune 500 employers.",
    "",
    "Your job: design ONE rigorous work simulation that predicts on-the-job competency using REAL workplace source materials the candidate must work from.",
    "",
    "CRITICAL: EVERY TASK IS TEXT-BOX ONLY (non-negotiable):",
    "- The candidate UI is ONLY a reading pane (materials) + ONE free-text response box on the right.",
    "- Every phase deliverable MUST be something the candidate can fully complete by typing prose in that box.",
    "- ALLOWED deliverables (examples — tailor to the role/competency):",
    "  • Reply to an email or Slack message (tone matters: warmth for social work; concise precision for finance).",
    "  • Short written report / case note / memo (1–3 paragraphs or structured bullets).",
    "  • Investment or deal pitch as WRITTEN talking points or a short pitch memo (not a real slide file).",
    "  • Slide content as OUTLINE TEXT: e.g. 'Slide 1 title + 3 bullets…' — never 'build a PowerPoint'.",
    "  • Client letter, safety plan narrative, objection-handling script, prioritization rationale, CRM update notes.",
    "- FORBIDDEN deliverables (hard fail): create a PowerPoint/Keynote, Excel model, dashboard, Figma mock, video, phone call, live meeting, spreadsheet file, or any multi-tool workflow the text box cannot produce.",
    "- If the real job would involve slides or a model, convert it: ask for the narrative, slide copy, recommendation, or calculation explained in writing — using numbers PROVIDED in artifacts.",
    "",
    "CRITICAL MATERIALS RULES (non-negotiable):",
    "- NEVER invent PDF/Word/Excel downloads, 'see attached', Google Drive links, decks, or external files.",
    "- NEVER ask the candidate to review a report/document/spreadsheet unless that full content exists in artifacts.",
    "- If a task needs numbers (pitch, valuation take, caseload triage, ROI reply), those exact numbers MUST appear in artifacts (data_table and/or memo body). Do not invent a task that needs data you did not supply.",
    "- If an email says 'sector report' / 'market brief' / 'pipeline pull', you MUST also include a SEPARATE memo or doc artifact titled exactly like that report, with COMPLETE body text (sections, bullets, figures, quotes). A short email that only *mentions* the report is a hard fail.",
    "- Preferred pattern: (1) short email/Slack assigning the work, (2) full source memo/doc with the facts the candidate must use, (3) data_table when quantitative judgment is required.",
    "- EXAMPLE finance phase: email asking for a short investment pitch memo + memo with company overview + data_table (revenue, growth, margin, valuation multiples). Deliverable: typed pitch memo using those figures — not 'build a deck'.",
    "- EXAMPLE social-work phase: client email or referral note + case memo with history/risks. Deliverable: typed reply demonstrating warmth, clarity, and clinical judgment.",
    "- Every phase MUST include 2–4 artifacts. At least one artifact per phase must be a substantive source (memo/doc >= ~800 characters OR data_table with >=4 rows of real numbers).",
    "- Phase 1 is NOT exempt: the first phase must be as rich as later phases (full case file / briefing memo — never a thin email alone).",
    "- Soft minimum: across all artifacts in a phase, aim for >= 900 characters of readable source content (excluding the short assignment email).",
    "- Artifacts must contain specific numbers, names, email addresses, timestamps, objections, metrics, or dialogue — not placeholders like 'TBD' or 'lorem'.",
    "- Materials must be fully self-contained so the candidate never leaves fullscreen and never needs a download.",
    "",
    "PURPOSE OF THIS SIMULATION:",
    "- Measure COMPETENCY: how the candidate thinks, writes, prioritizes, and works with the materials — not years of expertise or credentials.",
    "- This is a work sample for hiring signal. It does NOT replace interviews, reference checks, or licensing requirements.",
    "",
    "DESIGN RULES:",
    "1. Exactly 4 sequential phases. Each phase: read artifacts → decide → write ONE text deliverable in the response box.",
    "2. TIME: suggested pacing only. Strong candidates may finish faster. Set phase minutes as suggested guidance (e.g. 15–30 each). total_minutes is the SESSION CAP (maximum 120). Do NOT claim every assessment takes two hours — pace depends on the candidate.",
    "3. Map every phase to at least one competency from the recruiter's looking_for list. Make the writing task reveal that competency (e.g. friendliness via client reply; concision via exec email; analytical rigor via numbered recommendation).",
    "4. Difficulty escalates; include at least one messy/incomplete/adversarial situation.",
    "5. Only test skills ABSOLUTELY NECESSARY for this role at this company.",
    "6. Write as a hiring manager assigning real work. Never mention AI, simulation, test, assessment, or Proof AI inside content fields.",
    "7. task + deliverable fields must explicitly say what to TYPE (e.g. 'Write a reply email…', 'Draft a 250-word pitch memo using the figures in the table…').",
    "",
    "Respond with a single JSON object ONLY. Schema:",
    "{",
    '  "overview": string,',
    '  "total_minutes": number (session time CAP, max 120),',
    '  "materials_provided": string (company/team context only — no fake attachments),',
    '  "phases": [',
    "    {",
    '      "number": number,',
    '      "title": string,',
    '      "minutes": number (suggested pacing for this phase — not a fixed duration),',
    '      "competency": string,',
    '      "situation": string (what is happening right now on the job),',
    '      "materials": string (short summary of the working set; optional),',
    '      "artifacts": [',
    "        {",
    '          "type": "email" | "slack" | "memo" | "data_table" | "call_notes" | "crm_record" | "doc",',
    '          "title": string,',
    '          "from": string (optional),',
    '          "to": string (optional),',
    '          "cc": string (optional),',
    '          "subject": string (optional, for email),',
    '          "timestamp": string (optional),',
    '          "channel": string (optional, for slack),',
    '          "body": string (FULL content; for slack include multiple lines like \"[9:14 AM] Name: message\"),',
    '          "columns": string[] (required for data_table),',
    '          "rows": string[][] (required for data_table; real numeric values)',
    "        }",
    "      ],",
    '      "task": string (what to do — must be completable by typing),',
    '      "deliverable": string (the written output expected in the response box),',
    '      "success_criteria": string (how a strong typed response demonstrates the competency)',
    "    }",
    "  ]",
    "}",
    "",
    "Quality bar: artifacts look like real inbox/Slack/docs; every phase has a rich source memo/table; every deliverable is finishable in the text box using only on-screen materials.",
  ].join("\n");
}

export function customSimulationUserPrompt(p: CustomSimulationParams): string {
  return [
    "Build an interactive competency simulation as JSON.",
    "Candidate interface = materials on the left + ONE text response box per phase. Design accordingly.",
    "",
    `COMPANY: ${p.company_name}`,
    `ROLE TITLE: ${p.role_title}`,
    "",
    "JOB DESCRIPTION:",
    p.job_description,
    "",
    "COMPETENCIES TO ASSESS (every phase maps to at least one; reveal it through WRITING):",
    p.looking_for,
    "",
    "REQUIREMENTS:",
    "- Tailor company, industry, stakeholders, and artifacts to this employer/role.",
    "- Assess competency (how they work with the materials), not credentials or years of expertise.",
    "- Every phase deliverable MUST be typed prose (email reply, short report, pitch memo, slide outline text, case note, etc.).",
    "- Do NOT ask for PowerPoints, Excel files, dashboards, calls, or anything outside the text box.",
    "- Put COMPLETE source materials INTO artifacts (full reports, tables, emails, chats) with the exact numbers/facts needed for the task.",
    "- EVERY phase — including Phase 1 — needs a substantive memo/doc (>=800 chars) OR a data_table with >=4 real rows. No thin opening phases.",
    "- If a phase needs quantitative judgment, include a data_table (or memo) with those numbers — not vague placeholders.",
    "- Ban all fake attachments (no PDF, spreadsheet download, slide deck, Drive links).",
    "- total_minutes = session CAP (max 120). Phase minutes = suggested pacing. Candidates may finish sooner.",
    "",
    "Return the JSON object now.",
  ].join("\n");
}

const evaluationSchemaDescription = `{
  "overall_score": number (0-100),
  "communication": number (0-100),
  "problem_solving": number (0-100),
  "domain_knowledge": number (0-100),
  "strengths": string[] (2-4 items),
  "weaknesses": string[] (2-4 items),
  "recommendation": string (one of: "Strong Interview Candidate", "Interview with Reservations", "Not Recommended")
}`;

export function evaluationSystemPrompt(): string {
  return [
    "You evaluate hiring simulation submissions using a consistent rubric.",
    "The simulation is multi-phase. The candidate response may include labeled sections (PHASE 1, PHASE 2, etc.).",
    "Score COMPETENCY — how the candidate thinks, writes, and uses the provided materials — not credentials or claimed expertise.",
    "Each phase deliverable is WRITTEN text only (email replies, memos, pitch copy, case notes, etc.). Score whether the writing uses the provided materials correctly and demonstrates the stated competencies.",
    "Score holistically across all phases and deliverables. Penalize missing phases, shallow answers, ignoring provided numbers/facts, and failure to meet stated success criteria.",
    "Respond with a single JSON object ONLY. No markdown fences, no prose.",
    "Schema:",
    evaluationSchemaDescription,
    "Scores must reflect evidence in the candidate response. Be specific in strengths and weaknesses.",
  ].join("\n");
}

export function evaluationUserPrompt(params: {
  role: string;
  simulationPrompt: string;
  candidateResponse: string;
}): string {
  return [
    `Role: ${params.role}`,
    "",
    "Simulation prompt (multi-phase competency work sample):",
    params.simulationPrompt,
    "",
    "Candidate response (may include multiple phase deliverables):",
    params.candidateResponse,
  ].join("\n");
}
