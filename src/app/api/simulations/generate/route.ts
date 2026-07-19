import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai/client";
import {
  customSimulationSystemPrompt,
  customSimulationUserPrompt,
} from "@/lib/openai/prompts";
import { parseSimulationContent } from "@/lib/simulation-structure";
import { getRequestUser } from "@/lib/supabase/request-user";
import {
  FREE_SAMPLE_LIMIT,
  PRICING_CONTACT_EMAIL,
  SAMPLE_LIMIT_CODE,
  pricingContactBlurb,
} from "@/lib/free-tier";
import {
  hydrateSimulationMaterials,
  materialsRepairUserPrompt,
  validateSimulationMaterials,
} from "@/lib/validate-simulation-materials";

export const maxDuration = 300;

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

    const authed = await getRequestUser(request);
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { user, supabase } = authed;

    const { count, error: countError } = await supabase
      .from("simulations")
      .select("id", { count: "exact", head: true })
      .eq("recruiter_id", user.id);

    if (countError) {
      console.error("Simulation count error:", countError);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    if ((count ?? 0) >= FREE_SAMPLE_LIMIT) {
      return NextResponse.json(
        {
          error: pricingContactBlurb(),
          code: SAMPLE_LIMIT_CODE,
          contact_email: PRICING_CONTACT_EMAIL,
        },
        { status: 403 },
      );
    }

    const company = company_name.trim();
    const role = role_title.trim();
    const openai = getOpenAI();

    const first = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: customSimulationSystemPrompt() },
        {
          role: "user",
          content: customSimulationUserPrompt({
            company_name: company,
            role_title: role,
            job_description: job_description.trim(),
            looking_for: looking_for.trim(),
          }),
        },
      ],
      max_tokens: 5000,
      temperature: 0.5,
    });

    let raw = first.choices[0]?.message?.content?.trim() ?? "";
    if (!raw) {
      return NextResponse.json({ error: "Generation failed" }, { status: 500 });
    }

    let structured = hydrateSimulationMaterials(parseSimulationContent(raw));
    let QA = validateSimulationMaterials(structured);

    // Repair only when phases lack usable on-screen artifacts (fast path skips this)
    const needsRepair =
      !QA.ok &&
      structured.phases.some(
        (p) =>
          p.artifacts.length === 0 ||
          p.artifacts.reduce((s, a) => s + a.body.length, 0) < 250,
      );

    if (needsRepair) {
      const repair = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: customSimulationSystemPrompt() },
          {
            role: "user",
            content: materialsRepairUserPrompt({
              previousJson: JSON.stringify(structured),
              reasons: QA.ok ? [] : QA.reasons,
              company_name: company,
              role_title: role,
            }),
          },
        ],
        max_tokens: 5000,
        temperature: 0.35,
      });

      raw = repair.choices[0]?.message?.content?.trim() ?? "";
      if (raw) {
        structured = hydrateSimulationMaterials(parseSimulationContent(raw));
        QA = validateSimulationMaterials(structured);
      }
    }

    structured = hydrateSimulationMaterials(structured);

    if (!structured.phases.length) {
      return NextResponse.json(
        { error: "Generated simulation had no phases" },
        { status: 500 },
      );
    }

    const emptyPhase = structured.phases.find((p) => p.artifacts.length === 0);
    if (emptyPhase) {
      return NextResponse.json(
        {
          error:
            "Simulation materials were incomplete after repair. Please try generating again.",
          details: QA.ok ? undefined : QA.reasons,
        },
        { status: 500 },
      );
    }

    if (!QA.ok) {
      console.warn(
        "Saving simulation with soft QA warnings:",
        QA.reasons.join(" | "),
      );
    }

    const generated_prompt = JSON.stringify(structured);

    const { data: simulation, error: dbError } = await supabase
      .from("simulations")
      .insert({
        company_name: company,
        role_title: role,
        job_description: job_description.trim(),
        looking_for: looking_for.trim(),
        generated_prompt,
        recruiter_id: user.id,
        role,
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
