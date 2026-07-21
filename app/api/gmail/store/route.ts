import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Stores the Gmail refresh token captured during Google sign-in (the merged
// one-consent flow). The token is minted by Supabase's configured Google client,
// so that client MUST be the same 948188… client n8n redeems with, or sending
// fails with unauthorized_client. See CLAUDE.md.
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { refresh_token } = await req.json().catch(() => ({}));
  if (!refresh_token) return NextResponse.json({ error: "Missing refresh_token" }, { status: 400 });

  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data, error } = await anon.auth.getUser(token);
  if (error || !data.user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error: upErr } = await admin.from("accounts").upsert(
    {
      user_id: data.user.id,
      email: data.user.email,
      gmail_refresh_token: refresh_token,
      gmail_connected_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (upErr) {
    console.error("gmail/store upsert error:", upErr);
    return NextResponse.json({ error: "Could not save Gmail connection" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
