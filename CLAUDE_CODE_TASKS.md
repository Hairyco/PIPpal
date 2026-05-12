# PIPpal — Task List for Claude Code
**Created: 11 May 2026**
**Repo:** https://github.com/Hairyco/PIPpal
**Live:** https://www.pippal.uk
**Stack:** React 18 + TypeScript + Vite + Tailwind + Supabase + Vercel

---

## CRITICAL: Cache Issue Fixed
`vercel.json` now has `Cache-Control: no-cache` on `index.html` and `immutable` on `/assets/*`.
This should prevent the stale HTML issue going forward. If changes still don't show — check Vercel build logs first.

---

## PENDING TASKS (not yet confirmed working due to cache)

### P1 — Descriptors collapsed section on Steps 2–5
**File:** `src/components/QuestionWizard.tsx`
**What:** A collapsed "How you will be scored" card should appear below the hero card on steps 2, 3, 4 and 5 of the question wizard. Tap to expand and see official descriptors with points.
**Status:** Code is in the file (confirmed via grep — 4 instances of "How you will be scored") but user cannot see it due to cache issue.
**Verify:** Run `npm run dev`, go to any question → step 2. Should see white card "How you will be scored" below teal hero. Tap to expand descriptors.

### P2 — Assessment prep: In-Person / Telephone tabs
**File:** `src/components/AssessmentPrepScreen.tsx`
**What:** Two tabs at top: 🏥 In-Person and 📞 Telephone. Telephone tab has 7 prep tips. Disclaimer above both tabs about requesting telephone assessment for anxiety/depression.
**Status:** Code committed but not confirmed visible.

### P3 — Eligibility checker: remove PIP diary section
**File:** `src/components/EligibilityChecker.tsx`
**What:** Remove the green PIP Diary teaser card from the result page.
**Status:** Code committed but not confirmed visible.

### P4 — Help pills open inline (Step 1 of question wizard)
**File:** `src/components/QuestionWizard.tsx`
**What:** Tapping "How does this apply to [condition]?" pill should open explanation inline below — NOT open PIPpal assistant. Smooth expand/collapse.
**Status:** Code committed but not confirmed visible.

### P5 — Step 2 checkbox alignment on mobile
**File:** `src/components/QuestionWizard.tsx`
**What:** Checkbox moved to LEFT of text (not right). Uses `flex flex-row items-center gap-3`. Should align cleanly on mobile.
**Status:** Code committed but not confirmed visible.

---

## NEW TASKS (to build)

### N1 — Condition-specific question content ⚠️ DO LAST
**What:** When medical profile is saved, the "This question explained" amber card text and examples on step 1 of the wizard should be reworded for the user's specific conditions.
- If they have anxiety + chronic back pain → explainer references both
- Tapped pill conditions AND free-typed conditions should both be used
- Needs OpenAI API call to personalise the explainer text dynamically
**Note:** Configure the prompt carefully. This is the most complex task.

### N2 — Free assessment email gate verification
**File:** `src/components/EligibilityChecker.tsx`
**What:** Verify that free (not logged in) users must provide email before seeing the score result. Result should be blurred until email submitted. Check the `showEmailGate` logic is working correctly end to end.

### N3 — Step 3 mobile layout (alternative to checkboxes)
**File:** `src/components/QuestionWizard.tsx` — Step 3 (frequency/how often)
**What:** The frequency dropdowns on step 3 are not displaying well on mobile. Try a different approach — maybe pill buttons (Never / Rarely / Most days / Every day) displayed horizontally under each difficulty item.

### N4 — Question wizard: condition-aware difficulty options
**File:** `src/components/QuestionWizard.tsx` — `DIFFICULTY_OPTIONS`
**What:** Currently all 12 questions have tailored difficulty lists. But the items shown should also filter/prioritise based on the user's saved conditions. E.g. if user has anxiety, mental health items should appear first.

---

## COMPLETED THIS SESSION (11 May 2026)

### ✅ Question Wizard — 6-step flow
- Step 1: Question explained (always expanded), help pills, example answer
- Step 2: Which difficulties (categorised checkboxes, all 12 questions have tailored lists)
- Step 3: How often (dropdown per difficulty)
- Step 4: Support/supervision needed
- Step 5: Real-life impact + 500 char free text
- Step 6: Descriptor tap → generates personalised answer from ALL wizard data

### ✅ Wizard → Draft Answer (skip chatbot)
- Descriptor tap calls API with difficulties+frequencies+support+impact
- Generates 2-3 sentence personalised answer
- Colour highlights applied automatically
- Goes straight to result screen

### ✅ ResultCard redesign
- Amber hero: DESCRIPTOR X, pts, heading
- Highlighted draft answer (toggle on/off)
- Colour legend
- Voice picker modal: Formal & factual / Descriptive & detailed / Plain and personal
- Answer history stack — revert to previous/original
- Improve uses wizard answers for context
- Join our community removed

### ✅ New Claim — 7-step ClaimFlow
- Step 1: What is PIP, stats, 6-month warning, key tips, no-diagnosis diary button, disclaimer
- Step 2: How scoring works, 4 reliability criteria, GOV.UK link, 12 activities with descriptors
- Step 3: Medical profile
- Step 4: Tips before questions + CTA to question index
- Step 5: Evidence suggestions (dynamic by condition)
- Step 6: Review + PIP2 download section
- Step 7: Done + what happens next

### ✅ PIP Rates updated to 2026/27
- Daily Living Standard: £76.70/week
- Daily Living Enhanced: £114.60/week
- Mobility Standard: £30.30/week
- Mobility Enhanced: £80.00/week
- Maximum: ~£843/month

### ✅ Landing page
- Eligibility banner restored with share button, 64k stat
- No-diagnosis text: "You do not need a formal diagnosis"
- Age chart built then removed on request
- Duplicate eligibility link removed
- Free calculators link updated

### ✅ Jobs batch fixes
- Navbar Eligibility scrolls to #what-is-pip
- How does scoring work removed from QuestionIndex
- Duplicate pts removed from question cards
- News dates black, sort by date toggle
- HTML entities decoded in news titles
- Urgency banner: Read latest news link
- Points Estimator NavCard + upload screen
- Stats grid centred with 64k stat
- ChatGPT → PIPpal in UI copy

---

## KEY FILES
| File | Purpose |
|------|---------|
| `src/components/QuestionWizard.tsx` | 6-step question wizard (main file to work on) |
| `src/components/ResultCard.tsx` | Answer result screen |
| `src/components/ClaimFlow.tsx` | 7-step new claim wizard |
| `src/components/AssessmentPrepScreen.tsx` | Assessment prep (in-person/telephone tabs) |
| `src/components/EligibilityChecker.tsx` | Free assessment with email gate |
| `src/components/HomeScreen.tsx` | Home dashboard |
| `src/pipQuestions.ts` | All 12 PIP questions, descriptors, explainers |
| `src/components/AppContext.tsx` | Global state, Screen type |
| `src/App.tsx` | Route switch |
| `api/chat.js` | OpenAI GPT-4o + Claude fallback |
| `vercel.json` | Deployment config, CSP, cache headers |

## TECH STACK
- React 18 + TypeScript + Vite + Tailwind CSS
- Supabase (auth, profiles, answers)
- Stripe (£8.99 one-time payment)
- Vercel Hobby plan (12 API function limit)
- OpenAI GPT-4o (primary) + Claude fallback
- GitHub: Hairyco/PIPpal

## ADMIN
- Email: daley_cutler@hotmail.co.uk (auto-granted hasPaid)
- Backup branch: `backup/pre-question-redesign`

## WORKING RULES
- Simple English only
- Full files not snippets
- Test locally with `npm run dev` before pushing
- TypeScript check: `npx tsc --noEmit`
- Build check: `npx vite build`
- Never commit .backup files
- Max 12 API files (Vercel Hobby limit)
- No "AI" in user-facing copy
