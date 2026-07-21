import { NextRequest, NextResponse } from "next/server";
import { adminClient, authorizeOrder, isPaidTier } from "@/lib/orderAuth";

// POST body: { token, doctor_npi, instruction }
// Paid-only. Rewrites one draft's subject/body per the student's instruction via
// DeepSeek, saves it, and returns the new text so the review page updates live.
export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const body = await req.json().catch(() => null);
  const token: string | null = body?.token ?? null;
  const npi: string | undefined = body?.doctor_npi;
  const instruction: string = (body?.instruction || "").toString().slice(0, 500).trim();

  const order = await authorizeOrder(sessionId, token);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Server-side paid gate — never trust the client to hide this.
  if (!isPaidTier(order.tier)) {
    return NextResponse.json({ error: "AI editing is a paid feature. Upgrade to edit drafts with AI." }, { status: 403 });
  }
  if (!npi || !instruction) return NextResponse.json({ error: "Missing draft or instruction" }, { status: 400 });
  if (!process.env.DEEPSEEK_API_KEY) return NextResponse.json({ error: "AI editing is temporarily unavailable" }, { status: 503 });

  const sb = adminClient();
  const { data: draft } = await sb
    .from("email_drafts")
    .select("subject, body, doctor_name, specialty, send_status")
    .eq("stripe_session_id", sessionId)
    .eq("doctor_npi", npi)
    .single();
  if (!draft) return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  if (draft.send_status === "sent") return NextResponse.json({ error: "This email was already sent" }, { status: 409 });

  const prompt =
    `You are editing a cold outreach email from a medical student to a physician (${draft.doctor_name}, ${draft.specialty}).\n\n` +
    `CURRENT SUBJECT: ${draft.subject}\n\nCURRENT BODY:\n${draft.body}\n\n` +
    `EDIT INSTRUCTION FROM THE STUDENT: ${instruction}\n\n` +
    `Apply the instruction. Keep it a genuine, concise, human-sounding email — do not add fluff, do not invent facts about the student or physician. ` +
    `Return ONLY valid JSON, no markdown fences: {"subject": "...", "body": "..."}`;

  let revised: { subject?: string; body?: string } = {};
  try {
    // DeepSeek is OpenAI-compatible. json_object mode requires "json" in the prompt (it is).
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: 1500,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`DeepSeek ${res.status}`);
    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content || "";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end > start) revised = JSON.parse(text.substring(start, end + 1));
  } catch (e) {
    console.error("tweak error:", e);
    return NextResponse.json({ error: "Could not edit the draft. Please try again." }, { status: 502 });
  }

  const newSubject = (revised.subject || draft.subject).slice(0, 998);
  const newBody = (revised.body || draft.body).slice(0, 20000);

  await sb
    .from("email_drafts")
    .update({ subject: newSubject, body: newBody })
    .eq("stripe_session_id", sessionId)
    .eq("doctor_npi", npi);

  return NextResponse.json({ subject: newSubject, body: newBody });
}
