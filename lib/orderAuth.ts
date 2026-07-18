import { createClient } from "@supabase/supabase-js";

export const adminClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export type OrderRow = {
  stripe_session_id: string;
  student_name: string;
  tier: string;
  physician_count: number;
  review_token: string | null;
};

/**
 * Access gate for the public review page and its APIs. Returns the order row
 * only when the supplied token matches the order's stored review_token.
 * No login required — possession of the emailed link is the credential.
 */
export async function authorizeOrder(sessionId: string, token: string | null): Promise<OrderRow | null> {
  if (!token) return null;
  const sb = adminClient();
  const { data } = await sb
    .from("student_submissions")
    .select("stripe_session_id, student_name, tier, physician_count, review_token")
    .eq("stripe_session_id", sessionId)
    .single();
  if (!data || !data.review_token || data.review_token !== token) return null;
  return data as OrderRow;
}

export const isPaidTier = (tier: string | undefined | null) => (tier || "") !== "trial";
