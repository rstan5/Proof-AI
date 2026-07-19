import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOpenAI } from "@/lib/openai/client";
import {
  evaluationSystemPrompt,
  evaluationUserPrompt,
} from "@/lib/openai/prompts";
import type { CompetencyEvaluation } from "@/types/database";

export const maxDuration = 120;

function asScore(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : String(item ?? "")))
    .filter(Boolean);
}

function parseEvaluation(raw: string): CompetencyEvaluation | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (
      typeof parsed.overall_score !== "number" &&
      typeof parsed.overall_score !== "string"
    ) {
      return null;
    }
    const strengths = asStringList(parsed.strengths);
    const weaknesses = asStringList(parsed.weaknesses);
    const recommendation =
      typeof parsed.recommendation === "string" && parsed.recommendation.trim()
        ? parsed.recommendation.trim()
        : "Interview with Reservations";

    return {
      overall_score: asScore(parsed.overall_score),
      communication: asScore(parsed.communication, asScore(parsed.overall_score)),
      problem_solving: asScore(
        parsed.problem_solving,
        asScore(parsed.overall_score),
      ),
      domain_knowledge: asScore(
        parsed.domain_knowledge,
        asScore(parsed.overall_score),
      ),
      strengths: strengths.length ? strengths : ["No strengths listed"],
      weaknesses: weaknesses.length ? weaknesses : ["No weaknesses listed"],
      recommendation,
    };
  } catch {
    return null;
  }
}

/** Candidate submits response; server saves and runs AI evaluation. */
export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    if (!json || typeof json !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const body = json as Record<string, unknown>;
    const simulationId = body.simulation_id;
    const candidateName = body.candidate_name;
    const response = body.response;
    const violationCount = body.violation_count;

    const voided = body.voided === true;

    if (
      typeof simulationId !== "string" ||
      typeof candidateName !== "string" ||
      !candidateName.trim() ||
      typeof response !== "string" ||
      !response.trim()
    ) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: simulation, error: simError } = await admin
      .from("simulations")
      .select("id, role_title, generated_prompt")
      .eq("id", simulationId)
      .single();

    if (simError || !simulation) {
      return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
    }

    const { data: submission, error: insertError } = await admin
      .from("submissions")
      .insert({
        simulation_id: simulationId,
        candidate_name: candidateName.trim(),
        response: response.trim(),
        violation_count:
          typeof violationCount === "number"
            ? violationCount
            : voided
              ? 1
              : 0,
      })
      .select("id")
      .single();

    if (insertError || !submission) {
      console.error("Submission insert error:", insertError);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    if (voided) {
      const voidEvaluation: CompetencyEvaluation = {
        overall_score: 0,
        communication: 0,
        problem_solving: 0,
        domain_knowledge: 0,
        strengths: [],
        weaknesses: [
          "Assessment voided — candidate exited fullscreen during the secure session",
        ],
        recommendation: "Voided — Fullscreen Exit",
      };
      await admin
        .from("submissions")
        .update({ evaluation_json: voidEvaluation })
        .eq("id", submission.id);

      return NextResponse.json({
        ok: true,
        id: submission.id,
        evaluated: true,
        voided: true,
      });
    }

    let evaluation: CompetencyEvaluation | null = null;

    try {
      const openai = getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: evaluationSystemPrompt() },
          {
            role: "user",
            content: evaluationUserPrompt({
              role: simulation.role_title,
              simulationPrompt: simulation.generated_prompt,
              candidateResponse: response.trim(),
            }),
          },
        ],
        temperature: 0.3,
      });

      const content = completion.choices[0]?.message?.content ?? "";
      evaluation = parseEvaluation(content);
    } catch (err) {
      console.error("OpenAI evaluation error:", err);
    }

    if (evaluation) {
      await admin
        .from("submissions")
        .update({ evaluation_json: evaluation })
        .eq("id", submission.id);
    }

    return NextResponse.json({
      ok: true,
      id: submission.id,
      evaluated: !!evaluation,
    });
  } catch (err) {
    console.error("Submission API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
