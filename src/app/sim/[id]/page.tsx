import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SimulationClient } from "./SimulationClient";
import type { SimulationRecord } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SimulationPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("simulations")
    .select("id, company_name, role_title, generated_prompt")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  return (
    <SimulationClient
      simulation={data as Pick<SimulationRecord, "id" | "company_name" | "role_title" | "generated_prompt">}
    />
  );
}
