import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAI } from "@/lib/openai/client";
import {
  customSimulationSystemPrompt,
  customSimulationUserPrompt,
} from "@/lib/openai/prompts";

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    if (!json || typeof json !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const body = json as Record<string, unknown>;
    const { company_name, role_title, job_description, looking_for } = body;

    if (
      typeof company_name !== "string" ||
      !company_name.trim() ||
      typeof role_title !== "string" ||
      !role_title.trim() ||
      typeof job_description !== "string" ||
      !job_description.trim() ||
      typeof looking_for !== "string" ||
      !looking_for.trim()
    ) {
      return NextResponse.json(
        { error: "All four fields are required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: customSimulationSystemPrompt() },
        {
          role: "user",
          content: customSimulationUserPrompt({
            company_name: company_name.trim(),
            role_title: role_title.trim(),
            job_description: job_description.trim(),
            looking_for: looking_for.trim(),
          }),
        },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const generated_prompt =
      completion.choices[0]?.message?.content?.trim() ?? "";
    if (!generated_prompt) {
      return NextResponse.json({ error: "Generation failed" }, { status: 500 });
    }

    const { data: simulation, error: dbError } = await supabase
      .from("simulations")
      .insert({
        company_name: company_name.trim(),
        role_title: role_title.trim(),
        job_description: job_description.trim(),
        looking_for: looking_for.trim(),
        generated_prompt,
        recruiter_id: user.id,
        role: role_title.trim(),
      })
      .select("id")
      .single();

    if (dbError || !simulation) {
      console.error("Supabase insert error:", dbError);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: simulation.id });
  } catch (err) {
    console.error("Simulation generate error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
