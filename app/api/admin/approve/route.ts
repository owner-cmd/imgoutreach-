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

  // Fetch the order so we can notify the student with their review link.
  const { data: order } = await supabase
    .from("student_submissions")
    .select("student_email, student_name, review_token")
    .eq("stripe_session_id", stripe_session_id)
    .single();

  // Model B: the admin has reviewed the drafts and is releasing them to the
  // student, who then reviews, edits, and sends from their own review page.
  // (No Gmail push here — sending happens later via queue-send → Send Queue.)
  const { error } = await supabase
    .from("student_submissions")
    .update({ status: "ready_for_review" })
    .eq("stripe_session_id", stripe_session_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify the student their drafts are ready to review (best-effort — a failed
  // notification must not fail the approval).
  if (order?.student_email && order?.review_token && process.env.RESEND_API_KEY) {
    const reviewUrl = `https://imgoutreach.com/review/${stripe_session_id}?t=${order.review_token}`;
    const firstName = (order.student_name || "").split(" ")[0] || "there";
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "IMG Outreach <noreply@sales.imgoutreach.com>",
        to: order.student_email,
        subject: "Your physician outreach drafts are ready to review",
        html: `<p>Hi ${firstName},</p>
<p>Your personalized physician outreach emails are ready. Review them, edit anything you like, then send them from your own Gmail — all from one page:</p>
<p><a href="${reviewUrl}" style="display:inline-block;background:#1e3a8a;color:#fff;text-decoration:none;font-weight:600;padding:10px 18px;border-radius:8px;">Review &amp; send your drafts →</a></p>
<p>Questions? Reply to this email or contact <a href="mailto:contact@imgoutreach.com">contact@imgoutreach.com</a>.</p>
<p>— IMG Outreach</p>`,
      }),
    }).catch(() => null);
  }

  return NextResponse.json({ success: true });
}
