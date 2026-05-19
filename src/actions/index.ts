/**
 * Server actions placeholder.
 * Co-locate mutations here (simulation create, submission, evaluation).
 */
export async function noopAction() {
  "use server";
  return { ok: true as const };
}
