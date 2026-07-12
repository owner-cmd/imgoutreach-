import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function parseState(raw: string): { p: string; s: string } {
  try {
    const decoded = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    return { p: decoded.p || "", s: decoded.s || "" };
  } catch {
    // Backwards compat: old links carried the preauth_id as plain state
    return { p: raw, s: "" };
  }
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const { p: preauthId, s: sessionId } = parseState(req.nextUrl.searchParams.get("state") || "");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Where to send the user if something fails
  const errorUrl = sessionId
    ? `${siteUrl}/success?session_id=${encodeURIComponent(sessionId)}&gmail=error`
    : `${siteUrl}/request?gmail=error`;

  if (!code) {
    return NextResponse.redirect(errorUrl);
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

    if (sessionId) {
      // Post-payment flow: attach token directly to the paid order
      await supabase
        .from("student_submissions")
        .update({
          gmail_refresh_token: tokens.refresh_token,
          gmail_connected_at: new Date().toISOString(),
        })
        .eq("stripe_session_id", sessionId);

      return NextResponse.redirect(
        `${siteUrl}/success?session_id=${encodeURIComponent(sessionId)}&gmail=connected`
      );
    }

    // Pre-payment flow: park token under preauth_id; webhook copies it after payment
    await supabase.from("gmail_preauth").upsert({
      preauth_id: preauthId,
      refresh_token: tokens.refresh_token,
      created_at: new Date().toISOString(),
    }, { onConflict: "preauth_id" });

    return NextResponse.redirect(`${siteUrl}/request?gmail=connected`);
  } catch (e) {
    console.error("Gmail OAuth callback error:", e);
    return NextResponse.redirect(errorUrl);
  }
}
