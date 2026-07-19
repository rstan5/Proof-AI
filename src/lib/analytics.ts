import type {
  CandidateRow,
  CompetencyEvaluation,
  DashboardAnalytics,
} from "@/types/database";

function archetypeLabel(evalJson: CompetencyEvaluation): string {
  const dims = [
    { key: "communication", label: "Communicator" },
    { key: "problem_solving", label: "Problem solver" },
    { key: "domain_knowledge", label: "Domain specialist" },
  ] as const;
  const top = dims.reduce((best, d) =>
    evalJson[d.key] > evalJson[best.key] ? d : best,
  );
  return top.label;
}

export function computeAnalytics(
  candidates: CandidateRow[],
): DashboardAnalytics {
  const evaluated = candidates.filter((c) => c.evaluation_json);
  const total = candidates.length;

  const recCounts = {
    strong: 0,
    reservations: 0,
    notRecommended: 0,
  };

  let sumOverall = 0;
  let sumComm = 0;
  let sumProblem = 0;
  let sumDomain = 0;

  const archetypeMap = new Map<string, number>();
  const roleMap = new Map<string, number>();

  for (const c of evaluated) {
    const e = c.evaluation_json!;
    sumOverall += e.overall_score;
    sumComm += e.communication;
    sumProblem += e.problem_solving;
    sumDomain += e.domain_knowledge;

    if (e.recommendation === "Strong Interview Candidate") recCounts.strong++;
    else if (e.recommendation === "Interview with Reservations")
      recCounts.reservations++;
    else recCounts.notRecommended++;

    const arch = archetypeLabel(e);
    archetypeMap.set(arch, (archetypeMap.get(arch) ?? 0) + 1);
  }

  for (const c of candidates) {
    const role = c.simulation?.role_title ?? "Unknown role";
    roleMap.set(role, (roleMap.get(role) ?? 0) + 1);
  }

  return {
    totalCandidates: total,
    evaluatedCandidates: evaluated.length,
    hireSuggestionRate: evaluated.length
      ? Math.round((recCounts.strong / evaluated.length) * 100)
      : 0,
    reservationRate: evaluated.length
      ? Math.round((recCounts.reservations / evaluated.length) * 100)
      : 0,
    notRecommendedRate: evaluated.length
      ? Math.round((recCounts.notRecommended / evaluated.length) * 100)
      : 0,
    avgOverallScore: evaluated.length
      ? Math.round(sumOverall / evaluated.length)
      : 0,
    avgCommunication: evaluated.length
      ? Math.round(sumComm / evaluated.length)
      : 0,
    avgProblemSolving: evaluated.length
      ? Math.round(sumProblem / evaluated.length)
      : 0,
    avgDomainKnowledge: evaluated.length
      ? Math.round(sumDomain / evaluated.length)
      : 0,
    archetypes: [...archetypeMap.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
    roleBreakdown: [...roleMap.entries()]
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count),
  };
}
