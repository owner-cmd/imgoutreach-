# IMG Outreach — directory

Sells AI-personalized cold-email drafts to IMG med students seeking US observerships/research.
Next.js + Supabase + Stripe + n8n. Live at imgoutreach.com.

**Deep history & open TODOs: see [HANDOFF.md](HANDOFF.md). Don't duplicate it here.**

## Standing rules
- **Be concise in all responses.** Answer the question, skip the preamble and the recap.
- **Never deploy without asking.** Vercel auto-deploys `owner-cmd/imgoutreach-` main → `git push` IS a deploy.
- Students receive drafts **in Gmail / on the review page**, never Google Sheets. Sheets are admin-only.
- Ethnicity is a **soft preference** (sorts results), never a hard filter. Paid tiers only; trial forces `any`.
- Owner is a non-expert coder — give manual UI steps for n8n changes when he wants to do them himself.
- Never print secrets. n8n uses `{{ $env.GOOGLE_CLIENT_SECRET }}`; site uses `.env.local` (gitignored).

## Where things are
| What | Where |
|---|---|
| n8n main workflow (source of truth) | `~/Downloads/Physician Research Agent Nodes (3).json` |
| n8n throttled sender | `~/Downloads/Send Queue.json` |
| n8n reply poller (dormant, needs CASA) | `~/Downloads/Email Tracking - Reply Poller.json` |
| Schema (idempotent, re-runnable) | `scripts/schema-updates.sql` |
| Token auth for review pages | `lib/orderAuth.ts` |
| Filter option lists | `lib/specialties.ts`, `lib/specialtyStateGender.ts`, `lib/medSchools.ts` |
| Pricing tiers / feature copy | `lib/stripe.ts` |

`app/prototype-a|b|c` are dead experiments — ignore, not deployed.

## Customer journey (code path)
1. `/request` — 6 steps: filters → Google sign-in gate → Gmail connect → info → letter → CV → package
2. Trial → `app/api/free-trial/route.ts`; paid → `app/api/create-checkout/route.ts` → Stripe
3. `app/api/webhook/route.ts` — `pending_submissions` → `student_submissions`, sends confirmation, triggers n8n
4. n8n researches each physician (agent + Exa/Firecrawl/PubMed), writes `email_drafts`
5. Drafts-ready email → `/review/<sessionId>?t=<review_token>` — edit, AI-tweak (paid), Send All
6. `Send Queue` workflow sends 5 per 10 min from the student's own Gmail, CV + tracking pixel attached

## Key tables
- `pending_submissions` → `student_submissions` (has `review_token`, `gmail_refresh_token`, `tier`)
- `physicians` (NPPES import: specialty, state, gender, ethnicity) · `physician_enrichment` (agent output, cached)
- `email_drafts` (subject, body, send_status, opened_at, gmail_thread_id/message_id)
- `accounts` + `trial_fingerprints` (one free trial per account + per unique info)

## Gotchas
- Google OAuth client is **948188183701-vhnmnht2m2l6qnht9kefak8u8mtsjke0** — refresh tokens only work with the client that minted them (`unauthorized_client` otherwise).
- `gmail.compose` already allows **send**. `gmail.readonly` is RESTRICTED (needs CASA, ~$500–4k/yr) — that's why reply tracking is dormant.
- n8n: `$('Node Name')` breaks silently on rename. HTTP nodes REPLACE item json — restore context from a named upstream node.
- Anti-hallucination: if `source_urls` is empty the agent didn't really search → discard the email, mark `enrichment_status='unverified'`.
- Supabase PostgREST caps at ~1000 rows — use keyset pagination and estimated counts.
- Sandbox preview can't reach Supabase (fetch failed is expected). Verify with `npx next build` + the real site.

## Commands
```bash
npx next build          # verify before any push
node scripts/assign-gender.mjs      # NPPES gender backfill (needs scripts/service-key.local)
```
