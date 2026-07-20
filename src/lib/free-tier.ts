/** Free-tier: one sample simulation per signed-in account. */

export const FREE_SAMPLE_LIMIT = 1;

export const SAMPLE_LIMIT_CODE = "SAMPLE_LIMIT_REACHED";
export const MONTHLY_LIMIT_CODE = "MONTHLY_LIMIT_REACHED";

export const SAMPLE_LIMIT_MESSAGE =
  "Your free sample is complete. Choose a plan to generate more simulations.";

export const MONTHLY_LIMIT_MESSAGE =
  "You’ve reached your monthly simulation limit. Upgrade your plan or wait until next month.";

export function sampleLimitBlurb(): string {
  return SAMPLE_LIMIT_MESSAGE;
}
