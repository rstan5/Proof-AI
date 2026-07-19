import { redirect } from "next/navigation";

export default function DashboardResultsRedirect() {
  redirect("/dashboard?tab=candidates");
}
