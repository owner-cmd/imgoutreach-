import { NextRequest, NextResponse } from "next/server";

function checkAuth(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${process.env.ADMIN_PASSWORD}`;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { stripe_session_id } = await req.json();
  if (!stripe_session_id) return NextResponse.json({ error: "Missing stripe_session_id" }, { status: 400 });

  const n8nRes = await fetch("https://n8n.imgoutreach.com/webhook/run-workflow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stripe_session_id }),
  });

  if (!n8nRes.ok) {
    return NextResponse.json({ error: "Failed to trigger n8n workflow" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
