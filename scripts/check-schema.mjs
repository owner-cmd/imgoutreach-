/**
 * Schema drift check — run BEFORE deploying, or after any change that adds a field.
 *
 * Verifies the database has every column the app code writes. If a column is
 * missing, an insert would fail (silently in some paths), so this catches the
 * "code writes a column that doesn't exist" bug before it reaches a customer.
 *
 * Uses only the public key (a read probe: HTTP 400 = column missing,
 * 401/200 = column exists), so no secrets are needed.
 *
 *   node scripts/check-schema.mjs
 *
 * Exit code 1 if anything is missing (so it can gate a deploy in CI).
 */
const URL = "https://kgykvrrxxolyfhhqehmz.supabase.co/rest/v1";
const KEY = "sb_publishable_dXXe2hK7c2r3WDyQaWUH8w_1Ng4ebei";

// Columns each write path depends on. Keep in sync with the insert/upsert bodies.
const REQUIRED = {
  pending_submissions: [
    "stripe_session_id", "student_email", "student_name", "specialty", "subspecialty",
    "state", "state_mode", "city", "ethnicity", "gender", "medical_school", "year",
    "purpose", "letter_of_interest", "custom_prompt", "student_offers", "cv_url",
    "extra_doc_urls", "preauth_id", "physician_count", "tier", "amount_paid", "created_at",
  ],
  student_submissions: [
    "stripe_session_id", "student_email", "student_name", "specialty", "subspecialty",
    "state", "state_mode", "city", "ethnicity", "gender", "medical_school", "year",
    "purpose", "letter_of_interest", "custom_prompt", "student_offers", "cv_url",
    "extra_doc_urls", "physician_count", "tier", "amount_paid", "status", "submitted_at",
    "gmail_refresh_token", "gmail_connected_at", "drafts_completed",
  ],
  gmail_preauth: ["preauth_id", "refresh_token", "created_at"],
  email_drafts: [
    "stripe_session_id", "doctor_npi", "subject", "body", "status",
    "opened_at", "open_count", "sent_at", "replied_at", "reply_body",
  ],
};

async function columnExists(table, col) {
  const res = await fetch(`${URL}/${table}?select=${col}&limit=1`, { headers: { apikey: KEY } });
  // 400 = column doesn't exist; 401 = exists but RLS-blocked; 200 = exists & readable.
  if (res.status === 400) return false;
  return true;
}

async function main() {
  let missing = 0;
  for (const [table, cols] of Object.entries(REQUIRED)) {
    const results = await Promise.all(cols.map(async c => [c, await columnExists(table, c)]));
    const gaps = results.filter(([, ok]) => !ok).map(([c]) => c);
    if (gaps.length === 0) {
      console.log(`  OK   ${table} — all ${cols.length} columns present`);
    } else {
      missing += gaps.length;
      console.log(`  MISSING in ${table}: ${gaps.join(", ")}`);
      for (const c of gaps) console.log(`         ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${c} TEXT;`);
    }
  }
  if (missing) {
    console.log(`\n${missing} column(s) missing. Add them (see scripts/migration.sql) before deploying.`);
    process.exit(1);
  }
  console.log("\nAll good — schema matches what the code writes.");
}

main().catch(e => { console.error(e); process.exit(1); });
