import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const sessionId = req.nextUrl.searchParams.get("state") || "";

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id=${sessionId}&gmail=error`
    );
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/gmail/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.refresh_token) throw new Error("No refresh token returned");

    // Store refresh token in Supabase against the student's submission
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase
      .from("student_submissions")
      .update({
        gmail_refresh_token: tokens.refresh_token,
        gmail_connected_at: new Date().toISOString(),
      })
      .eq("stripe_session_id", sessionId);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id=${sessionId}&gmail=connected`
    );
  } catch (e) {
    console.error("Gmail OAuth callback error:", e);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id=${sessionId}&gmail=error`
    );
  }
}
