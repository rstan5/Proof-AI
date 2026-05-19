import { NextResponse } from "next/server";
import { isJobRole } from "@/types/roles";

/**
 * POST /api/simulations/generate
 * Example API route — wires to OpenAI + Supabase in a later step.
 */
export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    if (!json || typeof json !== "object" || !("role" in json)) {
      return NextResponse.json({ error: "Missing role" }, { status: 400 });
    }
    const role = (json as { role: unknown }).role;
    if (typeof role !== "string" || !isJobRole(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Generation will call OpenAI and persist to Supabase.",
        role,
      },
      { status: 501 },
    );
  } catch {
    return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
  }
}
