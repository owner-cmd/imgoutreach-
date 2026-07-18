import { NextRequest, NextResponse } from "next/server";
import { adminClient, authorizeOrder } from "@/lib/orderAuth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const token = req.nextUrl.searchParams.get("t");

  const order = await authorizeOrder(sessionId, token);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const sb = adminClient();
  const { data: drafts, error } = await sb
    .from("email_drafts")
    .select(
      "doctor_npi, doctor_name, doctor_email, specialty, subject, body, email_verified, email_inferred, quality_score, send_status, sent_at",
    )
    .eq("stripe_session_id", sessionId)
    .order("quality_score", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    order: {
      student_name: order.student_name,
      tier: order.tier,
      isPaid: order.tier !== "trial",
      physician_count: order.physician_count,
    },
    drafts: drafts || [],
  });
}
