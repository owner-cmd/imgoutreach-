import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { planId, metadata } = await req.json();
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: plan.price * 100,
            product_data: {
              name: `IMG Outreach ${plan.name} — ${plan.count} Personalized Email Drafts`,
              description: plan.description,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/request`,
      customer_email: metadata.student_email,
      metadata: {
        student_email: metadata.student_email || "",
        student_name: metadata.student_name || "",
        specialty: (metadata.specialty || "").slice(0, 490),
        subspecialty: (metadata.subspecialty || "").slice(0, 490),
        state: (metadata.state || "").slice(0, 490),
        state_mode: metadata.state_mode || "all",
        city: metadata.city || "",
        ethnicity: metadata.ethnicity || "any",
        medical_school: (metadata.medical_school || "").slice(0, 490),
        year: metadata.year || "",
        purpose: metadata.purpose || "",
        physician_count: String(metadata.physician_count || "25"),
        tier: metadata.tier || plan.id,
        cv_url: (metadata.cv_url || "").slice(0, 490),
        extra_doc_urls: (metadata.extra_doc_urls || "").slice(0, 490),
      },
    });

    // Save full submission to Supabase immediately — includes untruncated letter
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await supabase.from("student_submissions").upsert({
      stripe_session_id: session.id,
      student_email: metadata.student_email,
      student_name: metadata.student_name,
      specialty: metadata.specialty,
      subspecialty: metadata.subspecialty,
      state: metadata.state,
      state_mode: metadata.state_mode,
      city: metadata.city,
      ethnicity: metadata.ethnicity,
      medical_school: metadata.medical_school,
      year: metadata.year,
      purpose: metadata.purpose,
      letter_of_interest: metadata.letter_of_interest || "",
      custom_prompt: metadata.custom_prompt || "",
      cv_url: metadata.cv_url,
      extra_doc_urls: metadata.extra_doc_urls,
      physician_count: parseInt(metadata.physician_count || "25"),
      tier: metadata.tier || plan.id,
      amount_paid: plan.price * 100,
      status: "pending_payment",
      submitted_at: new Date().toISOString(),
    }, { onConflict: "stripe_session_id" });

    // Send confirmation email to student
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "IMG Outreach <noreply@sales.imgoutreach.com>",
        to: metadata.student_email,
        subject: "We received your order — drafts coming within 24 hours",
        html: `<p>Hi ${metadata.student_name?.split(" ")[0] || "there"},</p>
<p>We received your order for ${metadata.physician_count || 25} personalized email drafts in <strong>${metadata.specialty}</strong>.</p>
<p>We'll have your drafts ready and delivered directly to your Gmail Drafts folder within 24 hours. You'll get another email when they're ready.</p>
<p>Questions? Reply to this email or contact us at <a href="mailto:contact@imgoutreach.com">contact@imgoutreach.com</a>.</p>
<p>— IMG Outreach</p>`,
      }),
    }).catch(() => null); // don't fail checkout if email fails

    return NextResponse.json({ url: session.url });
  } catch (e: unknown) {
    console.error("Checkout error:", e);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
