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

  // Fetch full order data from Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: order, error } = await supabase
    .from("student_submissions")
    .select("*")
    .eq("stripe_session_id", stripe_session_id)
    .single();

  if (error || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Reset to "processing" so the workflow's resume guard doesn't treat a
  // partial "drafts_ready" order as finished and stop immediately. The workflow
  // resumes from drafts_completed (dedup + cache prevent re-drafting).
  await supabase
    .from("student_submissions")
    .update({ status: "processing" })
    .eq("stripe_session_id", stripe_session_id);

  // Send to n8n in the same format the Stripe webhook would send
  const n8nRes = await fetch("https://n8n.imgoutreach.com/webhook/physician-outreach-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: {
        object: {
          id: order.stripe_session_id,
          amount_total: order.amount_paid,
          metadata: {
              student_email: order.student_email,
              student_name: order.student_name,
              specialty: order.specialty,
              subspecialty: order.subspecialty || "",
              state: order.state,
              state_mode: order.state_mode,
              city: order.city || "",
              ethnicity: order.ethnicity || "any",
              gender: order.gender || "any",
              letter_of_interest: order.letter_of_interest || "",
              custom_prompt: order.custom_prompt || "",
              student_offers: order.student_offers || "",
              email_purpose: order.purpose || "",
              cv_url: order.cv_url,
              extra_doc_urls: order.extra_doc_urls || "",
              physician_count: String(order.physician_count),
              tier: order.tier,
              medical_school: order.medical_school || "",
              year: order.year || "",
            },
          },
        },
      }),
  });


  if (!n8nRes.ok) {
    const text = await n8nRes.text();
    return NextResponse.json({ error: "Failed to trigger n8n workflow", detail: text }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
