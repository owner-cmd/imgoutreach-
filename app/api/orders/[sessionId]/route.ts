import { NextRequest, NextResponse } from "next/server";
import { adminClient, authorizeOrder } from "@/lib/orderAuth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const token = req.nextUrl.searchParams.get("t");

  const order = await authorizeOrder(sessionId, token);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Build the attachment list (same for every email in the order): the CV plus
  // any extra docs, paired with their real uploaded filenames for display.
  const cvName = (order.cv_filename || "").trim();
  const extraNames = (order.extra_doc_names || "").split(",").map((s: string) => s.trim()).filter(Boolean);
  const extraUrls = (order.extra_doc_urls || "").split(",").map((s: string) => s.trim()).filter(Boolean);
  const attachments: Array<{ label: string; name: string }> = [];
  if (order.cv_url) attachments.push({ label: "CV", name: cvName || "CV" });
  extraUrls.forEach((_: string, i: number) => {
    attachments.push({ label: "Document", name: extraNames[i] || `Document ${i + 1}` });
  });

  const orderInfo = {
    student_name: order.student_name,
    tier: order.tier,
    isPaid: order.tier !== "trial",
    physician_count: order.physician_count,
    attachments,
  };

  // Drafts are only shown to the student after the admin reviews and releases
  // the order (status "ready_for_review"). Before that, the page shows a
  // "being prepared" state so nothing is visible or sendable prematurely.
  const released = order.status === "ready_for_review" || order.status === "sent";
  if (!released) {
    return NextResponse.json({ order: orderInfo, drafts: [], ready: false });
  }

  const sb = adminClient();
  const { data: drafts, error } = await sb
    .from("email_drafts")
    .select(
      "doctor_npi, doctor_name, doctor_email, subject, body, email_verified, email_inferred, quality_score, send_status, sent_at",
    )
    .eq("stripe_session_id", sessionId)
    .order("quality_score", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ order: orderInfo, drafts: drafts || [], ready: true });
}
