import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const sessionId = session.id;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch full submission data saved at checkout creation
  const { data: pending } = await supabase
    .from("pending_submissions")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .single();

  if (!pending) {
    console.error("No pending submission found for session:", sessionId);
    return NextResponse.json({ error: "Pending submission not found" }, { status: 404 });
  }

  // Move to student_submissions with confirmed status
  const { error } = await supabase.from("student_submissions").upsert({
    stripe_session_id: sessionId,
    student_email: pending.student_email,
    student_name: pending.student_name,
    specialty: pending.specialty,
    subspecialty: pending.subspecialty,
    state: pending.state,
    state_mode: pending.state_mode,
    city: pending.city,
    ethnicity: pending.ethnicity,
    medical_school: pending.medical_school,
    year: pending.year,
    purpose: pending.purpose,
    letter_of_interest: pending.letter_of_interest,
    custom_prompt: pending.custom_prompt,
    cv_url: pending.cv_url,
    extra_doc_urls: pending.extra_doc_urls,
    physician_count: pending.physician_count,
    tier: pending.tier,
    amount_paid: session.amount_total ?? pending.amount_paid,
    status: "processing",
    submitted_at: new Date().toISOString(),
  }, { onConflict: "stripe_session_id" });

  if (error) {
    console.error("Failed to save student submission:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Clean up pending
  await supabase.from("pending_submissions").delete().eq("stripe_session_id", sessionId);

  // Send confirmation email
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "IMG Outreach <noreply@sales.imgoutreach.com>",
      to: pending.student_email,
      subject: "We received your order — drafts coming within 24 hours",
      html: `<p>Hi ${(pending.student_name || "").split(" ")[0] || "there"},</p>
<p>We received your order for ${pending.physician_count || 25} personalized email drafts in <strong>${pending.specialty}</strong>.</p>
<p>We'll have your drafts ready and delivered directly to your Gmail Drafts folder within 24 hours. You'll get another email when they're ready.</p>
<p>Questions? Contact us at <a href="mailto:contact@imgoutreach.com">contact@imgoutreach.com</a>.</p>
<p>— IMG Outreach</p>`,
    }),
  }).catch(() => null);

  return NextResponse.json({ received: true });
}
