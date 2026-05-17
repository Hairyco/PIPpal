# PIPpal — Claude Session Handoff
**Date:** Sunday 17 May 2026
**Repo:** https://github.com/Hairyco/PIPpal
**Live:** https://www.pippal.uk
**Stack:** React 18 + TypeScript + Vite + Tailwind + Supabase + Stripe + Vercel

---

## To pick up instantly

```
git pull origin main
```

Sign in as **daley_cutler@hotmail.co.uk** — auto-granted paid + admin access.

---

## Critical rule — never forget

**Do NOT edit `QuestionWizard.tsx`** — dead code, never called.
All question flow changes go in **`QuestionFlow.tsx`** only.

---

## What was done this session (17 May 2026)

### Landing page / Hero
- Badge: "UK's #1 PIP Application Assistant"
- Subtext: "We guide you to describe your real daily challenges clearly and accurately so the DWP fully understands your needs."
- Teal strip inside hero card: "Built on 1,000s of successful claims"
- Avatar row (5 fun coloured circles) + "1,200+ applications" + ★★★★★ stars
- 5 ticks: 65% of claims fail — we help you succeed / 100% personalised. No templates / Finish in just 15 minutes / Get a faster decision / Handwritten form service available
- CTA: "Start Now" (removed "It's Free")
- Feature strip between hero and WhatIsPIP: two cards (Get instant inspiration / Test 100% free)
- Removed: WhyPIPpal section, HowItWorks section
- WhatIsPIP paragraphs: spacing + bold on key points
- Blog CTA: pricing removed from all blogs

### Question flow
- Draft answer prompt: complete rewrite — vivid concrete opening, no repetition, each sentence must add NEW info
- CoC mode: draft now explicitly shows deterioration ("harder or less safe NOW")
- CoC step 2: "Breaking down what's on file" replaced with AI-generated "Summary" card
  - Generates on mount via API
  - Summarises previous answer + PA4 notes
  - Tells claimant what they need to show to score higher
  - Previous answer + assessor boxes removed (shown on previous page already)
- Help pills in step 1: sorted to match user's conditions first
- Descriptor section: on steps 2, 3, 4, 5 with live highlight
- Personalising screen: 5s minimum, progress bar with 12 question dots
- Next question routes through personalising (fixes conditions not loading)

### Result card (final answer page)
- Teal question hero at top
- Highlights OFF by default
- Helpful details section: AI-generates 6-8 personalised pills per question, tap to append to draft
- Improve answer: tapped details explicitly preserved, faithful to edits, 4-6 sentences
- Handwritten service upsell: only shows on Q12
- Bottom bar: Redo / Improve / Next, previous answer row above

### Handwritten form service
- New screen: HandwrittenService.tsx
- Standard £19.99 (7-10 days) / Fast Track £24.99 (1-3 days)
- Posts completed form BACK TO CLAIMANT — they sign and send to DWP themselves
- On submit: stores in Supabase `handwritten_requests`, emails daley_cutler@hotmail.co.uk via Resend
- Access: HomeScreen NavCard + Q12 result page upsell

### Admin dashboard
- New "Claim completions" section: New Claims / Change of Circ. / Appeals
- Tracked via `claim_events` Supabase table (fires when all 12 answered)
- Age/gender discussed — NOT yet built, flagged for next session

### Other
- Favicon: white heart on teal background (public/favicon.svg)
- QuestionIndex: score shows X / 118 pts
- CoC: Previous answer + PA4 boxes removed from step 2 (already shown on previous page)
- Fix: docx package added to npm dependencies (build error from Cursor)

---

## Supabase SQL still needed (run if not done)

**Supabase SQL editor:** https://supabase.com/dashboard/project/pqjmfrnoeflezhdzdijq/sql/new

### condition_content_cache (personalisation cache)
```sql
CREATE TABLE IF NOT EXISTS condition_content_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key text NOT NULL UNIQUE,
  question_id text NOT NULL,
  conditions_key text NOT NULL,
  explainer text NOT NULL,
  example text NOT NULL,
  hit_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cache_key ON condition_content_cache(cache_key);
ALTER TABLE condition_content_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read" ON condition_content_cache FOR SELECT USING (true);
CREATE POLICY "insert" ON condition_content_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "update" ON condition_content_cache FOR UPDATE USING (true);
```

### handwritten_requests
```sql
CREATE TABLE IF NOT EXISTS handwritten_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tier text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  postcode text NOT NULL,
  notes text,
  price text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE handwritten_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON handwritten_requests USING (false);
```

### claim_events
```sql
CREATE TABLE IF NOT EXISTS claim_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  event_type text NOT NULL,
  total_points integer,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE claim_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert" ON claim_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role read" ON claim_events FOR SELECT USING (false);
```

---

## Pending tasks

### Age + gender in medical profile (NOT YET BUILT — Daley to confirm)
- Add optional age and gender fields to MedicalProfile.tsx
- Store against user's Supabase profile
- Display in AdminDashboard user list and as aggregate stats
- Purpose: understand who is using the product for audience targeting

### Medium priority (from task doc)
- **M1** — Change of Circumstances screen rebuild — Cursor has built a 4-step CoC flow (mostly complete)
- **M2** — MR screen rebuild — collapsible, descriptor-by-descriptor, PA4 report prominent
- **M3** — Appeals screen rebuild — Cursor has started AppealsScreen.tsx

---

## Working rules
- Simple English, full files not snippets
- `npx tsc --noEmit` then `npx vite build` before every commit
- No .backup files, no "AI" in user-facing copy — say "PIPpal"
- Mobile-first, teal-700 primary, stone-50 backgrounds
- Max 12 files in /api/ folder (Vercel Hobby)
- Push to main → Vercel auto-deploys
- Cursor is also working on this repo — always `git pull origin main` before starting

