import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "./DashboardShell";
import type { SimulationRecord } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: simulations } = await supabase
    .from("simulations")
    .select("id, company_name, role_title, created_at")
    .eq("recruiter_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  return (
    <DashboardShell
      userEmail={user?.email ?? ""}
      simulations={(simulations ?? []) as Pick<SimulationRecord, "id" | "company_name" | "role_title" | "created_at">[]}
    />
  );
}
