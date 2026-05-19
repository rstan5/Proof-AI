import { NextResponse } from "next/server";
import type { CompetencyEvaluation } from "@/types/database";

/**
 * POST /api/submissions/evaluate
 * Example shape — implementation will call OpenAI with response_format json_object.
 */
export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    if (!json || typeof json !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const body = json as Record<string, unknown>;
    if (
      typeof body.simulationPrompt !== "string" ||
      typeof body.candidateResponse !== "string" ||
      typeof body.role !== "string"
    ) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const sample: CompetencyEvaluation = {
      overall_score: 84,
      communication: 90,
      problem_solving: 78,
      domain_knowledge: 82,
      strengths: ["Clear communication", "Strong objection handling"],
      weaknesses: ["Needs stronger urgency in CTA"],
      recommendation: "Strong Interview Candidate",
    };

    return NextResponse.json(
      {
        ok: true,
        message: "Replace with OpenAI rubric scoring + persistence.",
        preview: sample,
      },
      { status: 501 },
    );
  } catch {
    return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
  }
}
