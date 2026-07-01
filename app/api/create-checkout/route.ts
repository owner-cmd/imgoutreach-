import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";

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
        ...metadata,
        // Stripe metadata values max 500 chars each
        letter_of_interest: (metadata.letter_of_interest || "").slice(0, 490),
        custom_prompt: (metadata.custom_prompt || "").slice(0, 490),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e: unknown) {
    console.error("Checkout error:", e);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
