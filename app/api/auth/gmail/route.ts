import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const preauthId = req.nextUrl.searchParams.get("preauth_id") || "";

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/gmail/callback`,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/gmail.compose",
    access_type: "offline",
    prompt: "consent",
    state: preauthId,
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  );
}
