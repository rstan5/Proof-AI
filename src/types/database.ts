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
