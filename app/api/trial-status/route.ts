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
  const { data: acct } = await sb.from("accounts").select("free_trial_used").eq("user_id", u.user.id).single();
  return NextResponse.json({ used: !!acct?.free_trial_used });
}
