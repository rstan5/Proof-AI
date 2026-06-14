import type { JobRole } from "@/types/roles";

export function simulationSystemPrompt(): string {
  return [
    "You are an expert hiring assessor and instructional designer.",
    "Generate ONE realistic job simulation for the specified role.",
    "The simulation must read like a brief a candidate would receive at work: context, constraints, deliverable, and success criteria.",
    "Do not mention that you are an AI. Do not include meta commentary.",
    "Output plain text only (no JSON).",
  ].join(" ");
}

export function simulationUserPrompt(role: JobRole): string {
  return [
    `Role: ${role}`,
    "",
    "Include: company/context, stakeholder details, time pressure, and the exact output you want from the candidate.",
    "If the role is SDR, include prospect details and at least one objection to handle.",
    "If Financial Analyst, include a small dataset description and the analysis/decision required.",
    "If Customer Support, include a customer message thread and escalation constraints.",
    "If Product Manager, include a tradeoff decision with metrics and stakeholders.",
    "",
    "Length: roughly 180-320 words.",
  ].join("\n");
}

export interface CustomSimulationParams {
  company_name: string;
  role_title: string;
  job_description: string;
  looking_for: string;
}

export function customSimulationSystemPrompt(): string {
  return [
    "You are an expert hiring assessor and instructional designer.",
    "Generate ONE realistic job simulation scenario that a recruiter will send to a candidate.",
    "The scenario must read like a real work brief: company context, a stakeholder situation, a concrete task with time pressure, and clear success criteria.",
    "Tailor everything specifically to the company, role, and competencies provided.",
    "Do not mention AI, simulation, test, or assessment anywhere in the output.",
    "Output plain text only — no headers, no bullet lists, no markdown.",
    "Length: 200–350 words.",
  ].join(" ");
}

export function customSimulationUserPrompt(p: CustomSimulationParams): string {
  return [
    `Company: ${p.company_name}`,
    `Role: ${p.role_title}`,
    "",
    "Job description:",
    p.job_description,
    "",
    "Key competencies to assess:",
    p.looking_for,
    "",
    "Generate the simulation scenario now.",
  ].join("\n");
}

const evaluationSchemaDescription = `{
  "overall_score": number (0-100),
  "communication": number (0-100),
  "problem_solving": number (0-100),
  "domain_knowledge": number (0-100),
  "strengths": string[] (2-4 items),
  "weaknesses": string[] (2-4 items),
  "recommendation": string (one of: "Strong Interview Candidate", "Interview with Reservations", "Not Recommended")
}`;

export function evaluationSystemPrompt(): string {
  return [
    "You evaluate hiring simulation submissions using a consistent rubric.",
    "Respond with a single JSON object ONLY. No markdown fences, no prose.",
    "Schema:",
    evaluationSchemaDescription,
    "Scores must reflect evidence in the candidate response. Be specific in strengths and weaknesses.",
  ].join("\n");
}

export function evaluationUserPrompt(params: {
  role: string;
  simulationPrompt: string;
  candidateResponse: string;
}): string {
  return [
    `Role: ${params.role}`,
    "",
    "Simulation prompt:",
    params.simulationPrompt,
    "",
    "Candidate response:",
    params.candidateResponse,
  ].join("\n");
}
