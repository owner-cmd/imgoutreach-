import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Lists the signed-in customer's applications (orders) with a derived status,
// so the account dashboard can show progress and link into each review page.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data: u, error: uErr } = await anon.auth.getUser(token);
  if (uErr || !u.user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  const user = u.user;

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // Match by account (new orders) or email (older orders placed before accounts).
  let q = sb
    .from("student_submissions")
    .select("stripe_session_id, specialty, physician_count, tier, submitted_at, review_token")
    .order("submitted_at", { ascending: false });
  q = user.email
    ? q.or(`account_id.eq.${user.id},student_email.eq.${user.email}`)
    : q.eq("account_id", user.id);
  const { data: orders, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ids = (orders || []).map((o) => o.stripe_session_id);
  const counts: Record<string, { total: number; sent: number }> = {};
  if (ids.length) {
    const { data: drafts } = await sb
      .from("email_drafts")
      .select("stripe_session_id, send_status")
      .in("stripe_session_id", ids);
    for (const d of drafts || []) {
      const c = (counts[d.stripe_session_id] ||= { total: 0, sent: 0 });
      c.total++;
      if (d.send_status === "sent") c.sent++;
    }
  }

  const applications = (orders || []).map((o) => {
    const c = counts[o.stripe_session_id] || { total: 0, sent: 0 };
    // Customer only leaves "researching" once the FULL order is drafted. Partial
    // or empty runs stay "researching" — the customer is never shown a partial or
    // a failure; the admin handles those.
    const requested = o.physician_count || 0;
    const complete = requested > 0 && c.total >= requested;
    let status = "researching";
    if (complete && c.sent === 0) status = "ready";
    else if (complete && c.sent > 0 && c.sent < c.total) status = "sending";
    else if (complete && c.sent >= c.total) status = "sent";
    return {
      sessionId: o.stripe_session_id,
      specialty: o.specialty,
      physicianCount: o.physician_count,
      tier: o.tier,
      submittedAt: o.submitted_at,
      reviewToken: o.review_token,
      draftsTotal: c.total,
      sentCount: c.sent,
      status,
    };
  });

  return NextResponse.json({ applications });
}
