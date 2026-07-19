import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { SimulationClient } from "./SimulationClient";
import type { SimulationRecord } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Load by UUID with service role so candidates (anon) and logged-in
 * recruiters previewing a link always get the same page. The UUID is
 * the invite secret.
 */
export default async function SimulationPage({ params }: Props) {
  const { id } = await params;

  let data: Pick<
    SimulationRecord,
    "id" | "company_name" | "role_title" | "generated_prompt"
  > | null = null;

  try {
    const admin = createAdminClient();
    const { data: row, error } = await admin
      .from("simulations")
      .select("id, company_name, role_title, generated_prompt")
      .eq("id", id)
      .single();
    if (!error && row) data = row;
  } catch (err) {
    console.error("Simulation page admin load failed:", err);
  }

  if (!data) notFound();

  return <SimulationClient simulation={data} />;
}
