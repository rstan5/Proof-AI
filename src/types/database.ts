import type { JobRole } from "./roles";

/**
 * Structured evaluation returned by OpenAI (strict JSON).
 */
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
  role: JobRole;
  generated_prompt: string;
  created_at: string;
}

export interface SubmissionRecord {
  id: string;
  simulation_id: string;
  candidate_name: string;
  response: string;
  evaluation_json: CompetencyEvaluation | null;
  created_at: string;
}
