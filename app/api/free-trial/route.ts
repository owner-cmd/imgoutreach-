import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import { notifyAdminNewOrder } from "@/lib/notifyAdmin";

const TRIAL_COUNT = 25;

const admin = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Verify the caller's Supabase (Google) session from the Bearer token.
async function getUser(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data, error } = await anon.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

// Fingerprint the identifying parts of the request so the same info can't farm
// multiple free trials across different accounts.
function fingerprint(m: Record<string, string>) {
  const norm = (s: string) => (s || "").toLowerCase().replace(/\s+/g, " ").trim();
  const basis = [norm(m.student_name), norm(m.cv_url), norm(m.medical_school), norm(m.specialty), norm(m.state)].join("|");
  return crypto.createHash("sha256").update(basis).digest("hex");
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Please sign in to use the free trial." }, { status: 401 });

  const { metadata } = await req.json().catch(() => ({ metadata: {} }));
  const m: Record<string, string> = metadata || {};
  const sb = admin();

  const { data: acct } = await sb.from("accounts").select("free_trial_used, gmail_refresh_token").eq("user_id", user.id).single();

  // ── Protection 1: one free trial per account ──
  // Source of truth is whether a trial order already exists for this account —
  // the flag on `accounts` is only a secondary signal (it can fail to persist).
  const { count: trialCount } = await sb
    .from("student_submissions")
    .select("stripe_session_id", { count: "exact", head: true })
    .eq("tier", "trial")
    .or(`account_id.eq.${user.id}${user.email ? `,student_email.eq.${user.email}` : ""}`);
  if ((trialCount ?? 0) > 0 || acct?.free_trial_used) {
    return NextResponse.json({ error: "You've already used your free trial. Upgrade to send more." }, { status: 403 });
  }

  // ── Protection 2: the same info can't claim a second trial (any account) ──
  const fp = fingerprint(m);
  const { data: usedFp } = await sb.from("trial_fingerprints").select("fingerprint").eq("fingerprint", fp).single();
  if (usedFp) {
    return NextResponse.json({ error: "This information has already been used for a free trial." }, { status: 403 });
  }

  const sessionId = "trial_" + crypto.randomUUID();
  const reviewToken = "rv_" + crypto.randomBytes(20).toString("hex");

  // Free trial is trial-tier: ethnicity preference is off (paid-only) and count is fixed.
  const order = {
    stripe_session_id: sessionId,
    student_email: m.student_email || user.email,
    student_name: m.student_name || "",
    specialty: (m.specialty || "").slice(0, 490),
    subspecialty: (m.subspecialty || "").slice(0, 490),
    state: (m.state || "").slice(0, 490),
    state_mode: m.state_mode || "all",
    city: m.city || "",
    ethnicity: "any",
    gender: m.gender || "any",
    medical_school: (m.medical_school || "").slice(0, 490),
    year: m.year || "",
    purpose: m.purpose || m.email_purpose || "",
    letter_of_interest: m.letter_of_interest || "",
    custom_prompt: m.custom_prompt || "",
    student_offers: m.student_offers || "",
    cv_url: m.cv_url || "",
    extra_doc_urls: m.extra_doc_urls || "",
    cv_filename: m.cv_filename || "",
    extra_doc_names: m.extra_doc_names || "",
    physician_count: TRIAL_COUNT,
    tier: "trial",
    amount_paid: 0,
    account_id: user.id,
    review_token: reviewToken,
    // Gmail token captured at sign-in (merged one-consent flow) so the sender can
    // deliver without a separate Gmail-connect step.
    ...(acct?.gmail_refresh_token
      ? { gmail_refresh_token: acct.gmail_refresh_token, gmail_connected_at: new Date().toISOString() }
      : {}),
    status: "processing",
    submitted_at: new Date().toISOString(),
  };

  const { error: insErr } = await sb.from("student_submissions").upsert(order, { onConflict: "stripe_session_id" });
  if (insErr) {
    console.error("free-trial save error:", insErr);
    // Surface the DB reason so schema issues are diagnosable from the browser.
    return NextResponse.json(
      { error: "Could not start your trial. Please try again.", detail: insErr.message || insErr.details || insErr.code },
      { status: 500 },
    );
  }

  // Mark the trial used + record the fingerprint (best-effort; order is already saved).
  await sb.from("accounts").upsert({ user_id: user.id, email: user.email, free_trial_used: true }, { onConflict: "user_id" });
  await sb.from("trial_fingerprints").insert({ fingerprint: fp, user_id: user.id });

  // Notify the owner a new free-trial application came in (best-effort, non-blocking).
  await notifyAdminNewOrder({
    studentName: order.student_name,
    studentEmail: order.student_email,
    specialty: order.specialty,
    purpose: order.purpose,
    physicianCount: TRIAL_COUNT,
    tier: "trial",
  });

  // Trigger the n8n workflow in the same Stripe-event shape it already expects.
  try {
    await fetch("https://n8n.imgoutreach.com/webhook/physician-outreach-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: { object: { id: sessionId, amount_total: 0, metadata: { ...order, physician_count: String(TRIAL_COUNT), email_purpose: order.purpose } } },
      }),
    });
  } catch (e) {
    console.error("free-trial n8n trigger failed (order saved, can be re-run from admin):", e);
  }

  return NextResponse.json({ ok: true, sessionId, reviewToken });
}
