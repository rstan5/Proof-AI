/** Free-tier: one sample simulation per signed-in account. */

export const FREE_SAMPLE_LIMIT = 1;

export const PRICING_CONTACT_EMAIL = "contact.proof.ai@gmail.com";

export const PRICING_MAILTO = `mailto:${PRICING_CONTACT_EMAIL}?subject=${encodeURIComponent(
  "Proof AI pricing inquiry",
)}&body=${encodeURIComponent(
  "Hi Proof AI team,\n\nI tried the free sample and would like pricing details for my hiring team.\n\nCompany:\nRoles I hire for:\n",
)}`;

export const SAMPLE_LIMIT_CODE = "SAMPLE_LIMIT_REACHED";

export const SAMPLE_LIMIT_MESSAGE =
  "Your free sample is complete. Contact the Proof AI team for pricing to generate more simulations.";

export function pricingContactBlurb(): string {
  return `${SAMPLE_LIMIT_MESSAGE} Email ${PRICING_CONTACT_EMAIL}.`;
}
