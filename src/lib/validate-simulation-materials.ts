import type {
  StructuredSimulation,
  SimulationPhase,
  WorkArtifact,
} from "@/lib/simulation-structure";

/** Fake external file language — only fail when clearly pointing off-screen. */
const FORBIDDEN =
  /\b(see attached pdf|please find attached|google drive|dropbox link|download the (pdf|excel|file)|open the pdf)\b/i;

/**
 * Deliverables that cannot be completed in the candidate text box.
 * "slide deck" / "powerpoint" as OUTPUT is a fail; asking for slide *outline text* is fine.
 */
const UNDOABLE_DELIVERABLE =
  /\b(build|create|make|design|produce|deliver|send|upload|attach)\b[\s\S]{0,40}\b(powerpoint|power\s*point|\.pptx|keynote|figma|excel (?:model|file|workbook)|spreadsheet file|dashboard|video|loom|zoom call|phone call|live (?:call|meeting)|prototype|mockup)\b/i;

const UNDOABLE_DELIVERABLE_ALT =
  /\b(powerpoint|power\s*point|\.pptx|excel workbook|spreadsheet file)\b/i;

/**
 * Only treat as "needs embedded report" when the phase clearly references a
 * named/external document — NOT bare words like analysis/pipeline/memo.
 */
const NEEDS_EMBEDDED_SOURCE =
  /\b(sector report|market report|industry report|pipeline report|market brief|research brief|the (?:attached|enclosed|linked) (?:report|brief|memo|doc|file)|review the .{0,40}\breport|analyze the .{0,40}\breport|based on the .{0,40}\breport)\b/i;

function artifactBodyLength(a: WorkArtifact): number {
  const tableChars =
    (a.columns?.join("").length ?? 0) + (a.rows?.flat().join("").length ?? 0);
  return a.body.trim().length + tableChars;
}

function isSubstantive(a: WorkArtifact): boolean {
  if (a.type === "data_table") {
    return (a.rows?.length ?? 0) >= 4 && (a.columns?.length ?? 0) >= 2;
  }
  if (a.type === "memo" || a.type === "doc" || a.type === "crm_record") {
    return a.body.trim().length >= 600;
  }
  if (a.type === "email" || a.type === "slack" || a.type === "call_notes") {
    return a.body.trim().length >= 220;
  }
  return a.body.trim().length >= 300;
}

function hasEmbeddedSource(artifacts: WorkArtifact[]): boolean {
  const longDoc = artifacts.some(
    (a) =>
      (a.type === "memo" || a.type === "doc" || a.type === "crm_record") &&
      a.body.trim().length >= 600,
  );
  const table = artifacts.some(
    (a) =>
      a.type === "data_table" &&
      (a.rows?.length ?? 0) >= 4 &&
      (a.columns?.length ?? 0) >= 2,
  );
  const longEmail = artifacts.some(
    (a) => a.type === "email" && a.body.trim().length >= 550,
  );
  const longSlack = artifacts.some(
    (a) => a.type === "slack" && a.body.trim().length >= 400,
  );
  return longDoc || table || longEmail || longSlack;
}

export function validateSimulationMaterials(
  sim: StructuredSimulation,
): { ok: true } | { ok: false; reasons: string[] } {
  const reasons: string[] = [];

  for (const phase of sim.phases) {
    const instructionBlob = [
      phase.situation,
      phase.materials,
      phase.task,
      phase.deliverable,
    ].join("\n");

    if (FORBIDDEN.test(instructionBlob)) {
      reasons.push(
        `Phase ${phase.number}: references external downloads instead of embedding content.`,
      );
    }

    const deliverableBlob = `${phase.task}\n${phase.deliverable}`;
    if (
      UNDOABLE_DELIVERABLE.test(deliverableBlob) ||
      UNDOABLE_DELIVERABLE_ALT.test(deliverableBlob)
    ) {
      reasons.push(
        `Phase ${phase.number}: deliverable is not completable in the text box (no PowerPoint/Excel/calls/files — ask for typed prose, email reply, memo, or slide outline text instead).`,
      );
    }

    if (!phase.artifacts.length) {
      reasons.push(`Phase ${phase.number}: has no artifacts.`);
      continue;
    }

    const totalChars = phase.artifacts.reduce(
      (sum, a) => sum + artifactBodyLength(a),
      0,
    );

    if (totalChars < 800) {
      reasons.push(
        `Phase ${phase.number}: artifacts are too thin (${totalChars} chars; need ≥800 of readable source content).`,
      );
    }

    if (!phase.artifacts.some(isSubstantive)) {
      reasons.push(
        `Phase ${phase.number}: missing at least one substantive source the candidate can work from.`,
      );
    }

    if (!hasEmbeddedSource(phase.artifacts)) {
      reasons.push(
        `Phase ${phase.number}: needs a rich on-screen source (memo/doc ≥600 chars, data_table with ≥4 rows, or a long email/slack with the content pasted in). Thin emails alone are not enough — especially Phase 1.`,
      );
    }

    if (NEEDS_EMBEDDED_SOURCE.test(instructionBlob) && !hasEmbeddedSource(phase.artifacts)) {
      reasons.push(
        `Phase ${phase.number}: references a report/brief to analyze, but no full source body is in artifacts.`,
      );
    }
  }

  if (reasons.length) return { ok: false, reasons };
  return { ok: true };
}

/**
 * Last-resort hydration: if a phase is thin or points at a missing report,
 * promote materials/situation into an on-screen memo so the candidate always
 * has something real to read (never a hollow "see the report" email alone).
 */
export function hydrateSimulationMaterials(
  sim: StructuredSimulation,
): StructuredSimulation {
  return {
    ...sim,
    phases: sim.phases.map((phase) => hydratePhase(phase)),
  };
}

function hydratePhase(phase: SimulationPhase): SimulationPhase {
  const artifacts = [...phase.artifacts];
  const totalChars = artifacts.reduce((s, a) => s + artifactBodyLength(a), 0);
  const instructionBlob = [
    phase.situation,
    phase.materials,
    phase.task,
    phase.deliverable,
  ].join("\n");

  const needsSource =
    NEEDS_EMBEDDED_SOURCE.test(instructionBlob) && !hasEmbeddedSource(artifacts);

  if (!artifacts.length || totalChars < 800 || needsSource || !hasEmbeddedSource(artifacts)) {
    const seedParts = [
      phase.materials.trim(),
      phase.situation.trim(),
      artifacts
        .filter((a) => a.body.trim().length > 0)
        .map((a) => `--- ${a.title} ---\n${a.body.trim()}`)
        .join("\n\n"),
    ].filter(Boolean);

    const seed = seedParts.join("\n\n").trim();
    if (seed.length >= 80 && !hasEmbeddedSource(artifacts)) {
      const title = needsSource
        ? extractReportTitle(instructionBlob) || "Source briefing for this phase"
        : "Working brief & source notes";

      // Prefer adding a memo rather than replacing short emails
      const alreadyHasSimilar = artifacts.some(
        (a) =>
          (a.type === "memo" || a.type === "doc") &&
          a.body.trim().length >= 600,
      );
      if (!alreadyHasSimilar) {
        artifacts.push({
          type: "memo",
          title,
          timestamp: "Internal · provided for this assignment",
          body: buildHydratedMemoBody(phase, seed, needsSource),
        });
      }
    }
  }

  // Still empty? synthesize a minimal workable memo from task fields
  if (!artifacts.length) {
    artifacts.push({
      type: "memo",
      title: "Assignment brief",
      body: [
        phase.situation || "You have been assigned the following work.",
        "",
        "Task:",
        phase.task || "Complete the deliverable.",
        "",
        "Deliverable:",
        phase.deliverable || "Submit your written response.",
        "",
        "Success criteria:",
        phase.success_criteria || "Address all requirements clearly.",
      ].join("\n"),
    });
  }

  return { ...phase, artifacts };
}

function extractReportTitle(blob: string): string | null {
  const m = blob.match(
    /\b((?:Q[1-4]\s+)?(?:[A-Z][A-Za-z0-9/&-]+\s+){0,4}(?:Sector|Market|Industry|Pipeline)\s+Report)\b/i,
  );
  if (m?.[1]) return m[1].trim();
  const m2 = blob.match(/\bthe\s+([A-Za-z0-9][A-Za-z0-9 &/-]{2,40}\s+(?:report|brief))\b/i);
  if (m2?.[1]) return m2[1].replace(/^\w/, (c) => c.toUpperCase());
  return null;
}

function buildHydratedMemoBody(
  phase: SimulationPhase,
  seed: string,
  asReport: boolean,
): string {
  if (asReport) {
    return [
      "INTERNAL SOURCE DOCUMENT",
      `(Compiled for this assignment — use this as the primary source material.)`,
      "",
      `Context: ${phase.situation || "See notes below."}`,
      "",
      "Key material:",
      seed,
      "",
      "Assignment focus:",
      phase.task,
      "",
      "Expected output:",
      phase.deliverable,
    ].join("\n");
  }
  return [
    "WORKING MATERIALS",
    "",
    seed,
    "",
    "Your task:",
    phase.task,
    "",
    "Deliverable:",
    phase.deliverable,
  ].join("\n");
}

export function materialsRepairUserPrompt(args: {
  previousJson: string;
  reasons: string[];
  company_name: string;
  role_title: string;
}): string {
  return [
    "Your previous simulation JSON failed QA because materials or tasks were incomplete / not text-box completable.",
    "",
    "FAILURES:",
    ...args.reasons.map((r) => `- ${r}`),
    "",
    "FIX REQUIREMENTS (do these concretely):",
    "- Keep the same company/role and phase structure.",
    "- For EVERY phase, artifacts[] must include FULL readable content (not pointers).",
    "- Preferred fix when a report is mentioned: ADD a memo/doc artifact with 800+ characters of real report text (headings, bullets, numbers).",
    "- Keep any short assignment email, but add the report as a SEPARATE memo.",
    "- EVERY phase (including Phase 1) must have a memo/doc ≥600 chars OR a data_table with ≥4 rows.",
    "- Add a data_table with real rows when the phase involves numbers — include every figure the deliverable needs.",
    "- Rewrite task/deliverable so the candidate only TYPES a response (email reply, short memo, pitch text, slide outline as bullets, case note). Never ask for PowerPoint, Excel, dashboards, calls, or files.",
    "- Do NOT mention PDFs, Drive links, or attachments.",
    "- Aim for 2–4 artifacts per phase.",
    "- total_minutes is a session CAP (max 120), not a promise that every run takes two hours.",
    "",
    `COMPANY: ${args.company_name}`,
    `ROLE: ${args.role_title}`,
    "",
    "Previous JSON to repair (expand artifacts — do not shrink content):",
    args.previousJson,
    "",
    "Return the corrected full JSON object only.",
  ].join("\n");
}
