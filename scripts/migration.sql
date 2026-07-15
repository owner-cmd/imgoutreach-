-- ============================================================================
-- Consolidated migration for all pending features.
-- RUN THIS IN THE SUPABASE SQL EDITOR *BEFORE* DEPLOYING THE NEW CODE.
-- Every statement is idempotent (IF NOT EXISTS), so it is safe to re-run.
-- ============================================================================

-- ── Website: gender + offers must exist or checkout/webhook inserts will fail ──
ALTER TABLE pending_submissions ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'any';
ALTER TABLE pending_submissions ADD COLUMN IF NOT EXISTS student_offers TEXT;
ALTER TABLE pending_submissions ADD COLUMN IF NOT EXISTS preauth_id TEXT;

ALTER TABLE student_submissions ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'any';
ALTER TABLE student_submissions ADD COLUMN IF NOT EXISTS student_offers TEXT;
ALTER TABLE student_submissions ADD COLUMN IF NOT EXISTS gmail_refresh_token TEXT;
ALTER TABLE student_submissions ADD COLUMN IF NOT EXISTS gmail_connected_at TIMESTAMPTZ;

-- ── Gmail pre-auth (pre-payment connect flow) ──
CREATE TABLE IF NOT EXISTS gmail_preauth (
  preauth_id   TEXT PRIMARY KEY,
  refresh_token TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── Email tracking (open pixel + reply poller) ──
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft_ready';
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ;
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS last_opened_at TIMESTAMPTZ;
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS open_count INT DEFAULT 0;
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ;
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS reply_message_id TEXT;
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS reply_subject TEXT;
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS reply_snippet TEXT;
ALTER TABLE email_drafts ADD COLUMN IF NOT EXISTS reply_body TEXT;

-- ── physicians: gender filter + NPPES backfill fields ──
-- gender already exists. These support the backfill script + future PD filter.
ALTER TABLE physicians ADD COLUMN IF NOT EXISTS enumeration_year INT;
ALTER TABLE physicians ADD COLUMN IF NOT EXISTS npi_deactivated BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_physicians_npi ON physicians (npi);

-- ── physician_enrichment: all enrichment agent fields ──
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS email_inferred BOOLEAN DEFAULT false;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS email_pattern TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS institution_email_domain TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS medical_school TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS med_school_country TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS graduation_year INT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS languages_spoken JSONB;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS institution_type TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS academic_position TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS is_program_director BOOLEAN DEFAULT false;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS accepts_observership BOOLEAN;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS observership_note TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS residency_program TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS fellowship_program TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS has_research_lab BOOLEAN;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS lab_url TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS linkedin_active BOOLEAN;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS linkedin_last_activity_hint TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS self_reported_ethnicity TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS probable_ethnicity TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS ethnicity_confidence FLOAT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS verified_ethnicity TEXT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS name_confidence FLOAT;
ALTER TABLE physician_enrichment ADD COLUMN IF NOT EXISTS source_urls JSONB;
