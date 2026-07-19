import type { CompetencyEvaluation } from "@/types/database";
import { CompetencyRadarChart } from "@/components/marketing/competency-radar-chart";
import { cn } from "@/utils/cn";

type Props = {
  candidateName: string;
  roleTitle: string;
  companyName: string;
  evaluation: CompetencyEvaluation;
  narrative?: string;
  violations?: number;
  className?: string;
};

function gradeFromScore(score: number): string {
  if (score >= 93) return "A";
  if (score >= 87) return "A−";
  if (score >= 83) return "B+";
  if (score >= 77) return "B";
  if (score >= 70) return "B−";
  if (score >= 63) return "C+";
  if (score >= 57) return "C";
  return "C−";
}

export function CandidateReportCard({
  candidateName,
  roleTitle,
  companyName,
  evaluation,
  narrative,
  violations = 0,
  className,
}: Props) {
  const overall = Number(evaluation.overall_score) || 0;
  const communication = Number(evaluation.communication) || 0;
  const problemSolving = Number(evaluation.problem_solving) || 0;
  const domainKnowledge = Number(evaluation.domain_knowledge) || 0;
  const strengths = Array.isArray(evaluation.strengths)
    ? evaluation.strengths
    : [];
  const weaknesses = Array.isArray(evaluation.weaknesses)
    ? evaluation.weaknesses
    : [];
  const recommendation =
    evaluation.recommendation?.trim() || "Interview with Reservations";

  const radarAxes = [
    { label: "Communication", score: communication },
    { label: "Problem solving", score: problemSolving },
    { label: "Domain", score: domainKnowledge },
    { label: "Overall", score: overall },
  ];

  const recColor =
    recommendation === "Strong Interview Candidate"
      ? "text-emerald-800 bg-emerald-50 border-emerald-200"
      : recommendation === "Interview with Reservations"
        ? "text-amber-800 bg-amber-50 border-amber-200"
        : recommendation.startsWith("Voided")
          ? "text-rose-950 bg-rose-100 border-rose-300"
          : "text-rose-800 bg-rose-50 border-rose-200";

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-sm ring-1 ring-black/[0.03]",
        className,
      )}
    >
      <header className="flex flex-col gap-3 border-b border-border-subtle bg-surface-overlay/50 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs text-ink-muted">Candidate</p>
          <h3 className="font-serif text-lg font-semibold text-ink">{candidateName}</h3>
          <p className="mt-0.5 text-sm text-ink-muted">
            {roleTitle} · {companyName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-border-subtle bg-white px-3 py-2 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
              Score
            </p>
            <p className="font-serif text-xl font-semibold text-ink">
              {gradeFromScore(overall)}
            </p>
          </div>
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold",
              recColor,
            )}
          >
            {recommendation}
          </span>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_1.2fr]">
        <div className="border-b border-border-subtle px-4 py-5 lg:border-b-0 lg:border-r">
          <CompetencyRadarChart
            axes={radarAxes}
            size={260}
            title="Competency profile"
            subtitle="Scores from simulation rubric"
          />
        </div>
        <div className="grid gap-px bg-border-subtle sm:grid-cols-3 lg:grid-cols-1">
          {[
            { label: "Overall", value: overall },
            { label: "Communication", value: communication },
            { label: "Problem solving", value: problemSolving },
            { label: "Domain knowledge", value: domainKnowledge },
          ].map((row) => (
            <div key={row.label} className="bg-white px-5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                {row.label}
              </p>
              <p className="font-serif text-2xl font-semibold tabular-nums text-ink">
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-px border-t border-border-subtle bg-border-subtle sm:grid-cols-2">
        <div className="bg-white px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
            Strengths
          </p>
          <ul className="mt-2 space-y-1.5">
            {(strengths.length ? strengths : ["None listed"]).map((s) => (
              <li key={s} className="text-sm text-ink-muted">
                + {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
            Weaknesses
          </p>
          <ul className="mt-2 space-y-1.5">
            {(weaknesses.length ? weaknesses : ["None listed"]).map((w) => (
              <li key={w} className="text-sm text-ink-muted">
                − {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {narrative && (
        <blockquote className="border-t border-border-subtle px-6 py-5">
          <p className="border-l-2 border-accent pl-4 text-sm leading-relaxed text-ink">
            {narrative}
          </p>
        </blockquote>
      )}

      {violations > 0 && (
        <p className="border-t border-border-subtle bg-amber-50/80 px-6 py-3 text-xs text-amber-800">
          {violations} proctoring violation{violations !== 1 ? "s" : ""} recorded
          during the assessment.
        </p>
      )}
    </article>
  );
}
