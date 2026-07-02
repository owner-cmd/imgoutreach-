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

  const { data, error } = await supabase
    .from("student_submissions")
    .select("stripe_session_id, student_name, student_email, specialty, tier, physician_count, drafts_completed, status, submitted_at, amount_paid")
    .order("submitted_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
