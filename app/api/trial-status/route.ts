import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Tells the request form whether this account has already used its free trial,
// so the UI can hide the trial option and show paid plans only. The server-side
// free-trial route is still the real enforcement (this is just UX).
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return NextResponse.json({ used: false });

  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data: u, error: uErr } = await anon.auth.getUser(token);
  if (uErr || !u.user) return NextResponse.json({ used: false });

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // Source of truth: does a trial order already exist for this account? (The
  // free_trial_used flag is only a secondary signal — it can fail to persist.)
  const { count: trialCount } = await sb
    .from("student_submissions")
    .select("stripe_session_id", { count: "exact", head: true })
    .eq("tier", "trial")
    .or(`account_id.eq.${u.user.id}${u.user.email ? `,student_email.eq.${u.user.email}` : ""}`);
  const { data: acct } = await sb.from("accounts").select("free_trial_used").eq("user_id", u.user.id).single();
  return NextResponse.json({ used: (trialCount ?? 0) > 0 || !!acct?.free_trial_used });
}
