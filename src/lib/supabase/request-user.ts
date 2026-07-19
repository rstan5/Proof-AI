import { createClient as createSupabaseJs } from "@supabase/supabase-js";
import type { User, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Resolve the current user from cookies (browser sessions) or
 * Authorization: Bearer <access_token> (API / smoke tests).
 */
export async function getRequestUser(
  request: Request,
): Promise<{ user: User; supabase: SupabaseClient } | null> {
  const cookieClient = await createClient();
  const {
    data: { user: cookieUser },
  } = await cookieClient.auth.getUser();
  if (cookieUser) {
    return { user: cookieUser, supabase: cookieClient };
  }

  const auth = request.headers.get("authorization");
  if (!auth?.toLowerCase().startsWith("bearer ")) return null;

  const token = auth.slice(7).trim();
  if (!token) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const bearerClient = createSupabaseJs(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
    error,
  } = await bearerClient.auth.getUser(token);
  if (error || !user) return null;
  return { user, supabase: bearerClient };
}
