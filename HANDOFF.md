# IMG Outreach — AI Session Handoff (2026-07-17)

Paste this whole document into a new AI session to continue work with full context.

## What this project is
**IMG Outreach** (imgoutreach.com) sells personalized cold-email drafts to IMG medical
students who want US physician observerships/research. Flow: student fills a multi-step
form (specialty/state/gender/ethnicity filters → Google sign-in → info → letter → CV →
package) → pays via Stripe (or free trial) → an **n8n workflow** researches each
physician (Claude agent + Exa/Firecrawl/PubMed tools), writes personalized emails →
student reviews them on the site and sends them **from their own Gmail**, throttled.

Owner: Omar Saad (doctor.omar.sd@gmail.com / 3mr.5l5.l@gmail.com), Egyptian IMG,
non-expert coder — explain things simply, ask before deploying.

## Stack & key locations
- **Website**: Next.js 16 (app router), Tailwind, in `C:\Users\3mr5l\Downloads\physician-outreach-site`
  - Deployed on **Vercel**, builds from GitHub `owner-cmd/imgoutreach-` branch `main`.
  - **Deploy = git push.** NEVER push without the owner's explicit permission.
- **DB**: Supabase project `kgykvrrxxolyfhhqehmz`. Tables: `physicians` (1.16M rows,
  from NPPES), `physician_enrichment` (cache of agent research), `student_submissions`
  (paid orders), `pending_submissions` (pre-payment), `email_drafts` (per-physician
  drafts + tracking), `gmail_preauth`, `accounts`, `trial_fingerprints`.
- **n8n**: self-hosted at n8n.imgoutreach.com (v2.28.4). Workflow JSONs live in
  `C:\Users\3mr5l\Downloads\`:
  - `Physician Research Agent Nodes (3).json` — THE main workflow (latest, heavily fixed)
  - `Send Queue.json` — new throttled Gmail sender (drains queued drafts every 10 min)
  - `Email Tracking - Reply Poller.json` — reply/sent tracking (DORMANT: needs
    gmail.readonly scope + Google CASA review; deferred by choice)
- **Google OAuth**: ONE client only: `948188183701-vhnmnht2m2l6qnht9kefak8u8mtsjke0.apps.googleusercontent.com`
  ("IMG Outreach Web"). Old client 163745267028-… is dead. Scope is **gmail.compose only**
  (includes send). Redirect URIs include the site callback + Supabase auth callback.
  Secrets: in Vercel env + n8n env (`GOOGLE_CLIENT_SECRET`) — never hardcode in workflow JSON.
- **Keys**: Supabase publishable key `sb_publishable_dXXe2hK7c2r3WDyQaWUH8w_1Ng4ebei`
  (public, used by n8n reads). Service-role key: in `.env.local` / Vercel / script key
  files (`scripts/*.local`, gitignored). Anthropic key: n8n credential + needs to be in
  Vercel as `ANTHROPIC_API_KEY` for the AI-tweak API.

## Git state RIGHT NOW
- Pushed & live-building: commit `f2727ba` "Add Review & Send, Google auth foundation,
  and filter fixes".
- **UNCOMMITTED in working tree**: `app/request/page.tsx` — the free-trial form wiring
  (sign-in gate after step 0, $0 trial card on package step, trial submit path that
  calls /api/free-trial instead of Stripe, auth-race fix). Build verified ✓ compiles.
  Owner was asked "push it?" — NOT yet answered. `app/prototype-a/b/c/` are old homepage
  experiments, intentionally untracked/not deployed.

## What was accomplished this session (all verified to compile; NOT tested vs real DB)
### n8n main workflow — critical fixes
1. **Root-cause bug**: `Code: Ensure Enrichment` dropped physician identity → agent
   searched blind → hallucinated/null results. Fixed: `return [{ json: Object.assign({}, physician, record) }]`.
2. Anti-hallucination: system prompt forbids answering from memory; guard in
   `Code: Parse Enrichment + Score1` — empty `source_urls` ⇒ null email/pubs, status
   'unverified'. Evidence-based email-pattern inference IS allowed (must construct the
   actual address into found_email, `email_inferred: true`).
3. Hunter verify: now advisory (Option B) — 'invalid' keeps the email, `email_verified=false`.
4. Fixed: PubMed `term={query}` param; quotes in prompts/placeholders breaking JSON
   ("Could not replace placeholders"); `.substring` on array crash; Hunter response
   wiping context (quality 0 → all skipped); no-email branch routes to Log Skipped;
   `IF: Has Email?` etc.; OAuth token exchange uses correct client + `$env.GOOGLE_CLIENT_SECRET`.
5. Ethnicity: agent outputs lowercase slugs matching site filter (`middle_eastern`,
  `south_asian`, `east_asian`, `hispanic`, `other`). MENA definition = North Africa +
  Levant + Gulf + Iran/Turkey; Hebrew/Israeli names → `other` (owner's requirement).
  Writes `verified_ethnicity` back to `physicians.ethnicity` (guarded, no null overwrite).
6. Ethnicity is a **soft preference**: removed from the physicians query filter; matches
   sorted first in `Code: Attach Student Context`; zero matches no longer crash (`return []`).
7. `review_token` generated in `Prepare Student Data`, saved via Upsert Student
   Submission; "drafts ready" email (`Code in JavaScript1`) links to
   `https://imgoutreach.com/review/<sessionId>?t=<token>` (no longer Gmail).
8. Gmail MIME builder embeds a tracking pixel `https://imgoutreach.com/api/track/open/<sid>__<npi>`.

### Website (pushed in f2727ba)
- `/review/[sessionId]` page: edit drafts, verified/inferred badges, per-draft checkbox,
  "Tweak with AI" (paid-only), sticky Send All → queues drafts.
- APIs: `GET /api/orders/[sessionId]?t=` (token-gated), `POST .../queue-send`,
  `POST .../tweak` (Claude Haiku `claude-haiku-4-5`, paid-gated server-side).
  Shared gate in `lib/orderAuth.ts` (`authorizeOrder`, `isPaidTier` = tier !== 'trial').
- `/signin` page (Google via Supabase auth, `lib/supabaseBrowser.ts` singleton).
- `POST /api/free-trial`: verifies Supabase JWT, one-trial-per-account (`accounts`),
  info fingerprint sha256(name|cv_url|school|specialty|state) in `trial_fingerprints`,
  saves order tier='trial' ethnicity forced 'any' count=25, triggers n8n webhook
  `https://n8n.imgoutreach.com/webhook/physician-outreach-payment` in Stripe-event shape.
- create-checkout: server-side gate — trial tier forces ethnicity='any'; also fixed
  purpose field (`metadata.purpose || metadata.email_purpose`).
- physician-count API: subspecialty filters correctly (geriatrics ≠ all internists);
  ethnicity NO LONGER shrinks count (soft) — returns `{count, preferredCount}`.
- Request form: gender filter (M/F, NPPES-backed); ethnicity section relabeled
  "a preference, not a filter" + preferredMatch line; specialties/subspecialties A–Z;
  scroll boxes removed; two Geriatric Medicine options relabeled "(via Internal/Family
  Medicine)"; med-school dropdown (`lib/medSchools.ts`); "don't make it pretty" note;
  purpose multi-select; tracking pixel endpoint `/api/track/open/[key]`.
- Gmail OAuth post-payment fix: `state` carries {preauthId, sessionId}; post-payment
  connect saves token to the order and returns to /success (was saving under empty id).

### Data & scripts
- `scripts/schema-updates.sql` — consolidated idempotent schema (run in Supabase!):
  physicians.gender+index; gender/student_offers on submissions; review_token,
  account_id; email_drafts tracking cols (status/opened/sent/replied/reply_* /
  send_status/send_error/gmail_thread_id/gmail_message_id); enrichment expanded cols;
  accounts + trial_fingerprints tables; commented-out `TRUNCATE physician_enrichment`.
- `scripts/assign-gender.mjs` — NPPES bulk CSV → physicians.gender (keyset pagination;
  key from `scripts/service-key.local`). Owner has run/attempted this.
- `scripts/assign-ethnicity.mjs` — NamSor backfill for NULL/'other' ethnicity with
  owner's MENA country list (IL excluded). Owner found NamSor expensive → agreed
  alternative: rewrite to Claude Haiku Batch API (~$15–35 for full table). NOT done yet.
- DB findings: enrichment table had 155 fabricated emails, 0 source_urls → owner agreed
  to TRUNCATE (may not have run yet). Ethnicity classifier is bad: 87% 'other', 0
  middle_eastern geriatricians in IL (156 total geriatricians IL; 4,182 IM-geriatrics +
  1,788 FM-geriatrics nationwide). physicians.ethnicity came from name-based import —
  do NOT wipe it.

## Product/tier rules (owner decisions)
- Free trial: 25 drafts, one per account + per info-fingerprint, Google sign-in required
  after filter step. Paid: Standard 50/$279, Pro 150/$549 (lib/stripe.ts).
- Paid-only: ethnicity targeting, AI draft-tweak. Enforce server-side.
- Ethnicity = preference not filter (top-up to full count with other strong physicians;
  low-quality skipped regardless). Site copy says exactly this.
- No time promises in copy ("We'll email you when your drafts are ready").
- No drafts without an email address. Inferred emails allowed but flagged.
- Reply tracking (gmail.readonly, CASA) deliberately deferred; hooks exist
  (reply poller JSON, reply_* columns, thread/message ids captured by Send Queue).
- Follow-up messages: future feature; hooks = gmail_thread_id/gmail_message_id.

## IMMEDIATE NEXT STEPS (in order)
1. **Owner decision**: push the uncommitted free-trial wiring (git add app/request/page.tsx
   → commit → push; prototypes stay untracked). Vercel auto-deploys.
2. **Owner**: run `scripts/schema-updates.sql` in Supabase SQL editor (required for
   review page, send queue, free trial). Optionally uncomment TRUNCATE physician_enrichment.
3. **Owner**: Vercel env — ensure `ANTHROPIC_API_KEY`, `GOOGLE_CLIENT_ID/SECRET`
   (948188-vhnm) set. n8n env — `GOOGLE_CLIENT_SECRET`. Supabase Google provider —
   owner says done.
4. **Owner**: re-import `Physician Research Agent Nodes (3).json` + import
   `Send Queue.json` into n8n; activate schedule.
5. **Test end-to-end with real DB** (nothing was tested against production data —
   sandbox had no DB access): sign-in gate → free trial → workflow run → review page →
   Send All → Send Queue sends from Gmail (check Sent folder, thread ids recorded).
6. **Copy conflicts to fix** (identified, not fixed): request-form Gmail step says
   "your 50 email drafts" (hardcoded; wrong for trial/Pro) and "we cannot read your
   emails" (fine) but promises drafts-in-Gmail while new flow sends from site;
   `lib/stripe.ts` SHARED_FEATURES stale ("Drafts delivered to your Gmail",
   "ethnicity targeting", "Delivered in under 24 hrs"); webhook confirmation email
   copy; main n8n workflow still ALSO creates Gmail drafts (duplicate with Send Queue —
   owner said keep as backup for now, decide later); pricing page has no trial tier shown.
7. **Later**: Claude-Haiku ethnicity backfill script; accounts dashboard (list orders,
   prefill returning users — prefill not built yet); merge geriatrics options into one;
   follow-up sender; reply tracking via CASA when revenue justifies.

## Gotchas for the next AI
- n8n node names matter: `$('Node Name')` references break silently if renamed
  (that caused the Score1 bug). Main workflow has ~57 nodes.
- n8n HTTP nodes REPLACE item json with the response — always restore context from a
  named upstream node (pattern used in Process Verification / Send Queue).
- Workflow JSON files in Downloads are the source of truth the owner imports; edit them
  with Python json scripts (encoding utf-8) and re-validate, or give the owner manual
  UI steps (he often prefers doing edits himself — offer both).
- Owner's Windows box, Git Bash available; site dev server via `npm run dev` (port 3000);
  sandbox browser cannot reach Supabase (fetch failed is expected locally) and React
  ignores synthetic clicks — verify via `npx next build` + real-site testing.
- Never print secrets; keys live in `.env.local` / Vercel / n8n env / `scripts/*.local`.
- Stripe metadata values cap at 500 chars — full text goes to pending_submissions
  (letter_of_interest is truncated to 490 in the form before send — known issue, full
  text is NOT saved anywhere; fix = send full text to DB, truncate only Stripe copy).
