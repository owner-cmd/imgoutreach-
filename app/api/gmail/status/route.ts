import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Reports whether the signed-in account already has a Gmail send token, so the
// request flow can skip re-connecting Gmail on every visit.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return NextResponse.json({ connected: false });

  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data, error } = await anon.auth.getUser(token);
  if (error || !data.user) return NextResponse.json({ connected: false });

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: acct } = await admin
    .from("accounts")
    .select("gmail_refresh_token")
    .eq("user_id", data.user.id)
    .single();

  return NextResponse.json({ connected: !!acct?.gmail_refresh_token });
}
