# PIPpal — Cursor Handoff
**Date:** Tuesday 12 May 2026
**Repo:** https://github.com/Hairyco/PIPpal
**Live:** https://www.pippal.uk
**Owner:** Daley — daley_cutler@hotmail.co.uk

---

## Step 1 — Get running

```bash
git clone https://github.com/Hairyco/PIPpal.git
cd PIPpal
npm install
npm run dev
```

Open http://localhost:5173. Sign in as **daley_cutler@hotmail.co.uk** — this email is auto-granted `hasPaid = true` in Supabase so you see everything.

Create a `.env.local` in the root with the same env vars that are in Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY` (must have credits — 429 error breaks personalisation silently)
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

---

## Step 2 — Critical warning

**Do NOT edit `QuestionWizard.tsx`** — it is dead code. The route `question_wizard` is never called.

The actual question flow is `q1_intro` → **`QuestionFlow.tsx`**. Every question change goes there.

---

## Step 3 — Understand the full user journey

```
HomeScreen
  └─ QuestionIndex (tap a question)
        └─ PersonalisingScreen  ← loading screen, generates content, caches it
              └─ QuestionFlow (q1_intro)  ← 5-step wizard
                    └─ [loading overlay "Building your answer..."]
                          └─ ResultCard (q1_result)  ← draft answer page
                                └─ [Next] → PersonalisingScreen again → next question
```

---

## Step 4 — How personalisation works

When a user taps a question:

1. `PersonalisingScreen` checks Supabase table `condition_content_cache` for key `fibromyalgia+crohns|q1`
2. **Cache hit** → reads explainer + example instantly, stores in sessionStorage, goes to question
3. **Cache miss** → calls OpenAI GPT-4o twice (explainer + example), saves to Supabase, then goes to question
4. `QuestionFlow` reads from sessionStorage on mount — no API calls during the wizard
5. After step 5, `finishQuestion()` calls API to turn wizard selections into a natural-language draft answer
6. ResultCard shows the draft. User can tap detail pills, improve, edit.
7. Tapping "Next" routes back through `PersonalisingScreen` for the next question

**If personalisation breaks:** Check OpenAI account has credits at platform.openai.com/settings/organization/billing

---

## Step 5 — Key files

| File | What it does |
|------|-------------|
| `src/components/QuestionFlow.tsx` | **Main question wizard** — all 5 steps, scoring, draft generation |
| `src/components/PersonalisingScreen.tsx` | Loading screen + Supabase cache + OpenAI content generation |
| `src/components/ResultCard.tsx` | Final answer page — improve, edit, detail pills, next question |
| `src/components/ClaimFlow.tsx` | 7-step new claim wizard |
| `src/components/AssessmentPrepScreen.tsx` | Assessment prep — in-person and telephone tabs |
| `src/components/EligibilityChecker.tsx` | Free eligibility check with email gate |
| `src/components/HomeScreen.tsx` | Dashboard |
| `src/pipQuestions.ts` | All 12 PIP questions, descriptors, condition explainers |
| `src/data/questionFlowData.ts` | Per-question config: difficulties, support options, impacts, `calculateDescriptor()` |
| `src/components/AppContext.tsx` | Global state — `medProfile`, `savedAnswers`, `selectedQuestionId`, `q1Result` |
| `src/App.tsx` | Route switch — `Screen` type → component |
| `api/chat.js` | OpenAI GPT-4o (primary) + Claude fallback. Always returns `{ reply }` |
| `vercel.json` | Cache headers: `index.html` = no-cache, `/assets/*` = immutable |

---

## Step 6 — Supabase tables

| Table | Purpose |
|-------|---------|
| `profiles` | User accounts, `has_paid` flag |
| `medical_profiles` | Conditions, medications, notes per user |
| `pip_answers` | Saved answers per question per user |
| `condition_content_cache` | Personalised explainer + example, keyed by `conditions\|questionId` |

**If `condition_content_cache` table doesn't exist yet**, run this in Supabase SQL editor (https://supabase.com/dashboard/project/pqjmfrnoeflezhdzdijq/sql/new):

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

---

## Step 7 — What needs building next

### Priority 1 — Change of Circumstances screen rebuild
**File to edit:** `src/components/ChangeOfCircumstancesScreen.tsx`
**Route:** `change_of_circumstances` in App.tsx

Rebuild as a collapsible step-by-step flow following the same pattern as `ClaimFlow.tsx`:
- Upload previous form at top (with how to request instructions)
- Step 1: Call DWP — 0800 121 4433, say "I want to report a change of circumstances"
- Step 2: AR1 form sent by DWP — explain what it is and the risk of full reassessment
- Step 3: Fill it in properly — compare before vs now, specific examples, reliability criteria
- Step 4: Send it back — 1 month deadline, can request extension
- Step 5: Assessment — might be phone, face-to-face or paper-based
- Step 6: Decision — can increase, stay same, or reduce. Warn: full reassessment means risk of going down
- Add amber warning box: "Even if you report getting worse, DWP reassesses everything — your award could go down"
- Same teal/stone design, same step header + progress bar pattern as ClaimFlow

### Priority 2 — MR (Mandatory Reconsideration) screen rebuild
**File to edit:** `src/components/MandatoryReconsiderationScreen.tsx`
**Route:** `mandatory_reconsideration` in App.tsx

Collapsible step-by-step flow:
- Upload section at top: decision letter + PA4 assessor report (explain how to request PA4)
- Step 1: Read the decision letter — your points per activity, reasons given
- Step 2: Request MR within 1 month — call 0800 121 4433 or write (writing is better)
- Step 3: Write it descriptor by descriptor — not "I disagree" but "Activity X: they gave me Y, it should be Z because..."
- Include the example MR paragraph: "You awarded me 0 points for planning a journey. This is incorrect. I cannot go out alone due to overwhelming anxiety..."
- Step 4: Add evidence (helpful not essential — explanation matters more)
- Step 5: Wait 2–8 weeks — most MRs don't change decision, don't be discouraged
- Step 6: If unsuccessful — appeal to tribunal, 60-70% win rate, 1 month to appeal

### Priority 3 — Appeals screen rebuild
**File:** create `src/components/AppealsScreen.tsx`, add route `appeals` to App.tsx

- Stats at top: 60-70% win rate at tribunal
- Upload section: decision letter + MR notice (required to appeal)
- Collapsible 7 steps matching the document content
- Key message: tribunal is independent of DWP, feels like a conversation not a court
- Critical tip: answer based on worst days, think reliability not diagnosis

---

## Working rules

- Simple English only
- Full files — never snippets
- `npx tsc --noEmit` then `npx vite build` before every commit
- Never commit `.backup` files
- No "AI" in user-facing copy — always "PIPpal"
- Mobile-first — test at 375px width
- Design: `teal-700` primary, `stone-50` backgrounds
- Vercel Hobby plan — max 12 files in `/api/` folder
- Push to `main` → Vercel auto-deploys

---

## If something isn't showing after a push

Vercel build logs are at: https://vercel.com/hairyco2-1980s-projects/pippal/deployments

`vercel.json` has `Cache-Control: no-cache` on `index.html` so stale HTML should no longer be an issue. If it happens again — check the Vercel deployment page to confirm the latest commit is marked "Current".

---

*Last updated: 12 May 2026*
