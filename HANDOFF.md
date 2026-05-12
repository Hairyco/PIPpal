# PIPpal — Session Handoff
**Date:** Tuesday 12 May 2026
**Repo:** https://github.com/Hairyco/PIPpal
**Live:** https://www.pippal.uk

---

## How to start
```bash
git clone https://github.com/Hairyco/PIPpal.git
cd PIPpal
npm install
npm run dev
```
Open http://localhost:5173 and sign in with daley_cutler@hotmail.co.uk (auto-granted paid access)

---

## Critical discovery this session
**QuestionWizard.tsx is NOT the rendered component.**
The question flow routes `q1_intro` → `QuestionFlow.tsx` (594 lines).
`QuestionWizard.tsx` exists but is only routed to `question_wizard` which is never called.
**All question flow changes must go in `QuestionFlow.tsx`.**

---

## What was fixed today

### QuestionFlow.tsx — confirmed working
- Step 1: "This question explained" always expanded (amber card, not white)
- Step 1: Help pills now open inline below — no longer open PIPpal assistant
- Step 2: "What you are scored on" collapsed section added — plain toggle, no animation library
- Personalised example answer: API called on mount with user's conditions
- Personalised explainer: separate API call rewrites the amber card text for user's conditions
- Example card now shows user's condition names instead of "Alex, 41"

---

## Outstanding issues

### 1. Personalisation not using correct conditions
**Symptom:** User set Fibromyalgia + Crohn's disease but example still showed anxiety/chronic pain
**Investigation:** Code is correct — `medProfile.conditions.map(c => c.name).join(', ')` should work
**Debug added:** Console.log `[PIPpal] Personalising for conditions: X` on mount
**Fix attempted:** Added `medProfile.conditions.length` to useEffect dependency array
**Next step in Claude Code:**
1. Run `npm run dev`
2. Open a question
3. Check browser console for `[PIPpal] Personalising for conditions:`
4. If it shows wrong/empty conditions — medProfile isn't loaded yet. Fix: move API call inside a separate useEffect that watches `medProfile.conditions` specifically
5. If it shows correct conditions — API is receiving them but GPT is ignoring the prompt. Strengthen the prompt.

### 2. "What you are scored on" section (step 2) — not confirmed visible
**Status:** Code is in QuestionFlow.tsx step 2 (correct file this time)
**Verify in Claude Code:** Run locally, go to question step 2, confirm white card appears below teal hero

---

## Key files
| File | Purpose |
|------|---------|
| `src/components/QuestionFlow.tsx` | **THE actual question flow — all changes go here** |
| `src/components/QuestionWizard.tsx` | Unused/wrong file — ignore |
| `src/components/ResultCard.tsx` | Answer result screen |
| `src/components/ClaimFlow.tsx` | 7-step new claim wizard |
| `src/components/AssessmentPrepScreen.tsx` | Assessment prep (in-person/telephone tabs) |
| `src/components/EligibilityChecker.tsx` | Free assessment with email gate |
| `src/components/HomeScreen.tsx` | Home dashboard |
| `src/pipQuestions.ts` | 12 PIP questions, descriptors, explainers, condition explainers |
| `src/data/questionFlowData.ts` | Flow config per question (difficulties, support, impacts) |
| `src/components/AppContext.tsx` | Global state — medProfile, Screen type |
| `src/App.tsx` | Route switch |
| `api/chat.js` | OpenAI GPT-4o + Claude fallback — returns `{ reply }` |
| `vercel.json` | Cache headers — index.html no-cache, assets immutable |

---

## QuestionFlow.tsx structure
```
Step 1: Question explained + help pills + personalised example
Step 2: Which difficulties (categorised buttons) + "What you are scored on" collapsed
Step 3: How often (frequency per difficulty)
Step 4: Support/supervision needed
Step 5: Real-life impact + free text
→ calculateDescriptor(answers) → setQ1Result → navigateTo('q1_result')
```

---

## Pending task list

### From jobs.docx (partially done)
- [ ] Condition-specific question content — personalisation (in progress, see issue 1 above)
- [ ] Assessment prep tabs — IN-PERSON and TELEPHONE — committed, needs verification
- [ ] Email gate on free assessment — verify blur/reveal works end to end
- [ ] Help pills open inline — DONE in QuestionFlow.tsx
- [ ] Step 2 mobile checkbox alignment — DONE (checkbox left of text)

### New tasks
- [ ] Remove console.log once personalisation confirmed working
- [ ] Extend personalisation to steps 2-5 difficulty options (sort by user conditions)
- [ ] QuestionWizard.tsx — either delete or wire up properly (currently dead code)

---

## Tech stack
- React 18 + TypeScript + Vite + Tailwind CSS
- Supabase (auth, profiles, answers, news)
- Stripe £8.99 one-time
- Vercel Hobby (12 API function limit)
- OpenAI GPT-4o primary, Claude claude-sonnet-4-6 fallback
- API returns `{ reply }` for standard mode, `{ structured }` for button mode

## Env vars (Vercel)
- `ANTHROPIC_API_KEY` ✓
- `OPENAI_API_KEY` ✓ (set by Daley)
- `VITE_SUPABASE_URL` ✓
- `VITE_SUPABASE_ANON_KEY` ✓
- `STRIPE_SECRET_KEY` ✓
- `SUPABASE_SERVICE_ROLE_KEY` ✓
- `RESEND_API_KEY` ✓

## Agency rules
- Simple English only
- Full files not snippets
- Test locally before pushing
- `npx tsc --noEmit` then `npx vite build` before every commit
- No .backup files
- No "AI" in user-facing copy
- Mobile-first
- Teal/stone/Inter design system
