import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function checkAuth(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${process.env.ADMIN_PASSWORD}`;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { stripe_session_id } = await req.json();
  if (!stripe_session_id) return NextResponse.json({ error: "Missing stripe_session_id" }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Mark as approved in Supabase
  const { error } = await supabase
    .from("student_submissions")
    .update({ status: "approved" })
    .eq("stripe_session_id", stripe_session_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Trigger n8n send-approved-drafts workflow
  const n8nRes = await fetch("https://n8n.imgoutreach.com/webhook/send-approved-drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stripe_session_id }),
  });

  if (!n8nRes.ok) {
    return NextResponse.json({ error: "Approved in DB but failed to trigger n8n" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
