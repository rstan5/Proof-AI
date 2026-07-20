export interface CompanyProfile {
  id: string;
  company_name: string;
  role_at_company: string;
  contact_phone: string | null;
  created_at: string;
  plan_id?: string;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status?: string | null;
  plan_simulations_per_month?: number | null;
}

export interface CompetencyEvaluation {
  overall_score: number;
  communication: number;
  problem_solving: number;
  domain_knowledge: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

export interface SimulationRecord {
  id: string;
  company_name: string;
  role_title: string;
  job_description: string;
  looking_for: string;
  generated_prompt: string;
  recruiter_id: string | null;
  created_at: string;
}

export interface SubmissionRecord {
  id: string;
  simulation_id: string;
  candidate_name: string;
  response: string;
  violation_count: number;
  evaluation_json: CompetencyEvaluation | null;
  created_at: string;
}

export type CandidateRow = SubmissionRecord & {
  simulation: Pick<
    SimulationRecord,
    "id" | "role_title" | "company_name" | "generated_prompt"
  > | null;
};

export interface DashboardAnalytics {
  totalCandidates: number;
  evaluatedCandidates: number;
  hireSuggestionRate: number;
  reservationRate: number;
  notRecommendedRate: number;
  avgOverallScore: number;
  avgCommunication: number;
  avgProblemSolving: number;
  avgDomainKnowledge: number;
  archetypes: { label: string; count: number }[];
  roleBreakdown: { role: string; count: number }[];
}
