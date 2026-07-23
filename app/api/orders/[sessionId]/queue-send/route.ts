import { NextRequest, NextResponse } from "next/server";
import { adminClient, authorizeOrder } from "@/lib/orderAuth";

// POST body: { token, drafts: [{ doctor_npi, subject?, body? }] }
// Saves any edited subject/body and flips the selected drafts to send_status='queued'.
// The throttled n8n "Send Queue" workflow then drains the queue a few at a time.
export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const body = await req.json().catch(() => null);
  const token: string | null = body?.token ?? null;
  const selected: Array<{ doctor_npi: string; subject?: string; body?: string }> = Array.isArray(body?.drafts)
    ? body.drafts
    : [];

  const order = await authorizeOrder(sessionId, token);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Guard: nothing can be sent until the admin has reviewed and released the order.
  if (order.status !== "ready_for_review" && order.status !== "sent") {
    return NextResponse.json({ error: "These drafts aren't available to send yet." }, { status: 403 });
  }
  if (selected.length === 0) return NextResponse.json({ error: "No drafts selected" }, { status: 400 });

  const sb = adminClient();
  let queued = 0;

  // One update per draft (subject/body may have been edited individually).
  for (const d of selected) {
    if (!d.doctor_npi) continue;
    const update: Record<string, unknown> = { send_status: "queued", send_error: null };
    if (typeof d.subject === "string") update.subject = d.subject.slice(0, 998);
    if (typeof d.body === "string") update.body = d.body.slice(0, 20000);

    const { error } = await sb
      .from("email_drafts")
      .update(update)
      .eq("stripe_session_id", sessionId)
      .eq("doctor_npi", d.doctor_npi)
      // Never re-queue something already sent.
      .neq("send_status", "sent");
    if (!error) queued++;
  }

  // Kick the n8n Send Queue workflow immediately so queued drafts start
  // sending right away (the workflow throttles internally between sends).
  // Best-effort — a failed trigger must not fail the queue operation.
  if (queued > 0) {
    await fetch("https://n8n.imgoutreach.com/webhook/send-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    }).catch(() => null);
  }

  return NextResponse.json({ queued });
}
