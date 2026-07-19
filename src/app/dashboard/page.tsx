import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeAnalytics } from "@/lib/analytics";
import { DashboardShell } from "./DashboardShell";
import type { CandidateRow, CompanyProfile, SimulationRecord } from "@/types/database";

async function ensureProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: { id: string; user_metadata?: Record<string, unknown> },
) {
  const { data: existing } = await supabase
    .from("company_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return existing as CompanyProfile;

  const meta = user.user_metadata ?? {};
  const company_name =
    typeof meta.company_name === "string" ? meta.company_name : "Company";
  const role_at_company =
    typeof meta.role_at_company === "string" ? meta.role_at_company : "Recruiter";
  const contact_phone =
    typeof meta.contact_phone === "string" ? meta.contact_phone : null;

  const { data: created } = await supabase
    .from("company_profiles")
    .insert({
      id: user.id,
      company_name,
      role_at_company,
      contact_phone,
    })
    .select("*")
    .single();

  return (created as CompanyProfile) ?? null;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard");

  const profile = await ensureProfile(supabase, user);

  const { data: simulations } = await supabase
    .from("simulations")
    .select("id, company_name, role_title, created_at")
    .eq("recruiter_id", user.id)
    .order("created_at", { ascending: false });

  const simIds = (simulations ?? []).map((s) => s.id);

  let candidates: CandidateRow[] = [];

  if (simIds.length > 0) {
    const { data: submissions } = await supabase
      .from("submissions")
      .select(
        `
        id,
        simulation_id,
        candidate_name,
        response,
        violation_count,
        evaluation_json,
        created_at,
        simulation:simulations (
          id,
          role_title,
          company_name,
          generated_prompt
        )
      `,
      )
      .in("simulation_id", simIds)
      .order("created_at", { ascending: false });

    candidates = (submissions ?? []).map((row) => {
      const sim = Array.isArray(row.simulation)
        ? row.simulation[0]
        : row.simulation;
      return {
        id: row.id,
        simulation_id: row.simulation_id,
        candidate_name: row.candidate_name,
        response: row.response,
        violation_count: row.violation_count,
        evaluation_json: row.evaluation_json,
        created_at: row.created_at,
        simulation: sim,
      };
    }) as CandidateRow[];
  }

  const analytics = computeAnalytics(candidates);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-ink-muted">
          Loading dashboard…
        </div>
      }
    >
      <DashboardShell
        userEmail={user.email ?? ""}
        profile={profile}
        candidates={candidates}
        simulations={
          (simulations ?? []) as Pick<
            SimulationRecord,
            "id" | "company_name" | "role_title" | "created_at"
          >[]
        }
        analytics={analytics}
      />
    </Suspense>
  );
}
