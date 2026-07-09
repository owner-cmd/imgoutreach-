import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function checkAuth(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${process.env.ADMIN_PASSWORD}`;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [{ data: confirmed, error: err1 }, { data: pending, error: err2 }] = await Promise.all([
    supabase
      .from("student_submissions")
      .select("stripe_session_id, student_name, student_email, specialty, tier, physician_count, drafts_completed, status, submitted_at, amount_paid")
      .order("submitted_at", { ascending: false }),
    supabase
      .from("pending_submissions")
      .select("stripe_session_id, student_name, student_email, specialty, tier, physician_count, amount_paid, created_at")
      .order("created_at", { ascending: false }),
  ]);

  if (err1) return NextResponse.json({ error: err1.message }, { status: 500 });

  const confirmedIds = new Set((confirmed || []).map((o: { stripe_session_id: string }) => o.stripe_session_id));

  // Show pending_submissions that haven't made it to student_submissions yet
  const pendingOrders = (pending || [])
    .filter((p: { stripe_session_id: string }) => !confirmedIds.has(p.stripe_session_id))
    .map((p: { stripe_session_id: string; student_name: string; student_email: string; specialty: string; tier: string; physician_count: number; amount_paid: number; created_at: string }) => ({
      stripe_session_id: p.stripe_session_id,
      student_name: p.student_name,
      student_email: p.student_email,
      specialty: p.specialty,
      tier: p.tier,
      physician_count: p.physician_count,
      drafts_completed: 0,
      status: "pending_payment",
      submitted_at: p.created_at,
      amount_paid: p.amount_paid,
    }));

  return NextResponse.json([...(confirmed || []), ...pendingOrders]);
}
