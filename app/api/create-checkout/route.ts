import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { planId, metadata, promoCode } = await req.json();
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    // ── Paid-tier gate (server-side, never trust the client) ──
    // Ethnicity targeting is a paid feature. A free-trial order (tier "trial")
    // can never target by ethnicity, regardless of what the form submitted.
    const tier = metadata.tier || plan.id;
    const isPaid = tier !== "trial";
    if (!isPaid) metadata.ethnicity = "any";

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Resolve promo code to a Stripe promotion_code ID so it's pre-applied at checkout
    let resolvedPromoId: string | null = null;
    if (promoCode) {
      const promos = await stripe.promotionCodes.list({ code: promoCode, active: true, limit: 1 });
      if (promos.data.length > 0) resolvedPromoId = promos.data[0].id;
    }

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
      ...(resolvedPromoId
        ? { discounts: [{ promotion_code: resolvedPromoId }] }
        : { allow_promotion_codes: true }),
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
        gender: metadata.gender || "any",
        medical_school: (metadata.medical_school || "").slice(0, 490),
        year: metadata.year || "",
        purpose: metadata.purpose || metadata.email_purpose || "",
        student_offers: (metadata.student_offers || "").slice(0, 490),
        physician_count: String(metadata.physician_count || "25"),
        tier: metadata.tier || plan.id,
        cv_url: (metadata.cv_url || "").slice(0, 490),
        extra_doc_urls: (metadata.extra_doc_urls || "").slice(0, 490),
        preauth_id: (metadata.preauth_id || "").slice(0, 490),
      },
    });

    // Save full data (including untruncated letter) to pending_submissions.
    // The Stripe webhook moves it to student_submissions after payment is confirmed.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error: supabaseError } = await supabase.from("pending_submissions").upsert({
      stripe_session_id: session.id,
      student_email: metadata.student_email,
      student_name: metadata.student_name,
      specialty: metadata.specialty,
      subspecialty: metadata.subspecialty,
      state: metadata.state,
      state_mode: metadata.state_mode,
      city: metadata.city,
      ethnicity: metadata.ethnicity,
      gender: metadata.gender || "any",
      medical_school: metadata.medical_school,
      year: metadata.year,
      purpose: metadata.purpose || metadata.email_purpose || "",
      letter_of_interest: metadata.letter_of_interest || "",
      custom_prompt: metadata.custom_prompt || "",
      student_offers: metadata.student_offers || "",
      cv_url: metadata.cv_url,
      extra_doc_urls: metadata.extra_doc_urls,
      preauth_id: metadata.preauth_id || "",
      physician_count: parseInt(metadata.physician_count || "25"),
      tier: metadata.tier || plan.id,
      amount_paid: plan.price * 100,
      created_at: new Date().toISOString(),
    }, { onConflict: "stripe_session_id" });

    if (supabaseError) {
      // Fail loudly BEFORE the user pays — otherwise the order is saved nowhere
      // and is lost after payment (invisible in admin, webhook has nothing to move).
      console.error("Supabase pending_submissions error:", supabaseError);
      return NextResponse.json(
        { error: "Could not save your order. Please try again or contact support." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (e: unknown) {
    console.error("Checkout error:", e);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
