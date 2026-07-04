import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const preauthId = req.nextUrl.searchParams.get("state") || "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/request?gmail=error`);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${siteUrl}/api/auth/gmail/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.refresh_token) throw new Error("No refresh token returned");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.from("gmail_preauth").upsert({
      preauth_id: preauthId,
      refresh_token: tokens.refresh_token,
      created_at: new Date().toISOString(),
    }, { onConflict: "preauth_id" });

    return NextResponse.redirect(`${siteUrl}/request?gmail=connected`);
  } catch (e) {
    console.error("Gmail OAuth callback error:", e);
    return NextResponse.redirect(`${siteUrl}/request?gmail=error`);
  }
}
