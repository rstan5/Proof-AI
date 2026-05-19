/**
 * MVP job roles supported for simulation generation.
 */
export const JOB_ROLES = [
  "SDR",
  "Financial Analyst",
  "Customer Support",
  "Product Manager",
] as const;

export type JobRole = (typeof JOB_ROLES)[number];

export function isJobRole(value: string): value is JobRole {
  return (JOB_ROLES as readonly string[]).includes(value);
}
