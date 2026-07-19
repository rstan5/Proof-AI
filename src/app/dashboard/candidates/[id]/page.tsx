import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CandidateReportCard } from "@/components/dashboard/candidate-report-card";
import type { CompetencyEvaluation } from "@/types/database";

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/dashboard/candidates/${id}`);

  const { data: submission } = await supabase
    .from("submissions")
    .select(
      `
      id,
      candidate_name,
      response,
      violation_count,
      evaluation_json,
      created_at,
      simulation:simulations!inner (
        role_title,
        company_name,
        generated_prompt,
        recruiter_id
      )
    `,
    )
    .eq("id", id)
    .single();

  if (!submission) notFound();

  const sim = Array.isArray(submission.simulation)
    ? submission.simulation[0]
    : submission.simulation;

  if (!sim || sim.recruiter_id !== user.id) notFound();

  const evaluation = submission.evaluation_json as CompetencyEvaluation | null;

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border-subtle bg-surface/90 px-4 py-4 sm:px-6">
        <Link
          href="/dashboard?tab=candidates"
          className="text-xs text-ink-muted transition hover:text-ink"
        >
          ← Back to candidates
        </Link>
      </header>
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        {!evaluation ? (
          <div className="rounded-2xl border border-border-subtle bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-semibold text-ink">Report processing</p>
            <p className="mt-2 text-sm text-ink-muted">
              The competency evaluation for {submission.candidate_name} is still
              being generated. Refresh in a moment.
            </p>
          </div>
        ) : (
          <CandidateReportCard
            candidateName={submission.candidate_name}
            roleTitle={sim.role_title}
            companyName={sim.company_name}
            evaluation={evaluation}
            violations={submission.violation_count}
            narrative={`Overall recommendation: ${evaluation.recommendation}. Review the competency breakdown and written response before scheduling interviews.`}
          />
        )}

        <section className="rounded-2xl border border-border-subtle bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-ink">
            Candidate written response
          </h2>
          <p className="mt-1 text-xs text-ink-muted">
            Full deliverable submitted across all phases.
          </p>
          <pre className="mt-4 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-xl bg-surface px-4 py-3 text-sm leading-relaxed text-ink">
            {submission.response}
          </pre>
        </section>
      </main>
    </div>
  );
}
