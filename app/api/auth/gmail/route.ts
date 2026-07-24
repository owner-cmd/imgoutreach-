import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const preauthId = req.nextUrl.searchParams.get("preauth_id") || "";
  const sessionId = req.nextUrl.searchParams.get("session_id") || "";

  // Encode both flows in state so the callback knows where to save and where to return
  const state = Buffer.from(JSON.stringify({ p: preauthId, s: sessionId })).toString("base64url");

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/gmail/callback`,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/gmail.send",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  );
}
