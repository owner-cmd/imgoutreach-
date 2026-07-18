-- ============================================================
-- IMG Outreach — consolidated schema updates for this session
-- Safe to run repeatedly (every statement is IF NOT EXISTS).
-- Paste the whole thing into Supabase → SQL Editor → Run.
-- ============================================================

-- ---- physicians: gender filter ----
ALTER TABLE physicians ADD COLUMN IF NOT EXISTS gender TEXT;              -- 'M' | 'F' (from NPPES)
CREATE INDEX IF NOT EXISTS idx_physicians_gender ON physicians(gender);

-- ---- pending_submissions: new form fields ----
ALTER TABLE pending_submissions ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'any';
ALTER TABLE pending_submissions ADD COLUMN IF NOT EXISTS student_offers TEXT;

-- ---- student_submissions: form fields + review/account ----
ALTER TABLE student_submissions ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'any';
ALTER TABLE student_submissions ADD COLUMN IF NOT EXISTS student_offers TEXT;
ALTER TABLE student_submissions ADD COLUMN IF NOT EXISTS review_token TEXT;
ALTER TABLE student_submissions ADD COLUMN IF NOT EXISTS account_id uuid;

-- ---- email_drafts: engagement tracking ----
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft_ready';
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS opened_at timestamptz;
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS last_opened_at timestamptz;
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS open_count int DEFAULT 0;
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS sent_at timestamptz;
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS replied_at timestamptz;
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS last_checked_at timestamptz;
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS reply_message_id TEXT;
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS reply_subject TEXT;
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS reply_snippet TEXT;
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS reply_body TEXT;

-- ---- email_drafts: Review & Send + follow-up hooks ----
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS send_status TEXT DEFAULT 'draft'; -- draft|queued|sent|failed
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS send_error TEXT;
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS gmail_thread_id TEXT;
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS gmail_message_id TEXT;

-- ---- physician_enrichment: expanded fields (many may already exist) ----
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS self_reported_ethnicity TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS probable_ethnicity TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS ethnicity_confidence FLOAT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS medical_school TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS med_school_country TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS graduation_year INT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS languages_spoken JSONB;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS institution_type TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS accepts_observership BOOLEAN;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS observership_note TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS residency_program TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS fellowship_program TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS has_research_lab BOOLEAN;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS lab_url TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS linkedin_active BOOLEAN;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS linkedin_last_activity_hint TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS name_confidence FLOAT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS source_urls JSONB;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS email_inferred BOOLEAN;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS email_pattern TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS institution_email_domain TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS position_title TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS academic_position TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS is_program_director BOOLEAN;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS verified_ethnicity TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS ethnicity_reason TEXT;

-- ---- accounts + free-trial abuse protection ----
CREATE TABLE IF NOT EXISTS accounts (
  user_id uuid PRIMARY KEY,
  email text,
  free_trial_used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS trial_fingerprints (
  fingerprint text PRIMARY KEY,
  user_id uuid,
  created_at timestamptz DEFAULT now()
);

-- ---- one-time cleanup: wipe the fabricated enrichment data ----
-- (Uncomment to run — removes the old hallucinated emails so enrichment rebuilds clean.)
-- TRUNCATE physician_enrichment;
