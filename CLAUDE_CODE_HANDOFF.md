# PIPpal — Claude Code Handoff
**Date:** 2026-05-06  
**Reason:** Switching from Claude AI to Claude Code to fix persistent issues

---

## Project
- **Repo:** https://github.com/Hairyco/PIPpal
- **Live:** https://www.pippal.uk
- **Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Supabase + Stripe + Vercel
- **Local path:** `C:\Users\daley\pippal`

## How to start
```
cd C:\Users\daley\pippal
git pull origin main
npm run dev
```
Open http://localhost:5173 — sign in with daley_cutler@hotmail.co.uk

---

## TWO OUTSTANDING BUGS — Fix these first

### BUG 1: Descriptor tap does not change chatbot opening message

**What should happen:**
- User is on QuestionIntro page (e.g. Question 1 — Preparing Food)
- They see "What are you scored on? Descriptors" section — always expanded
- Each descriptor row is a tappable button (e.g. "Cannot prepare and cook food — 8pts")
- When they tap one, the chatbot opens and its FIRST message should reference the descriptor they chose
- e.g. "You've said that you cannot prepare and cook food. Let me ask you a few questions to capture this properly for your claim."
- Currently: chatbot always opens with the same generic message regardless of which descriptor was tapped

**Files involved:**
- `src/components/QuestionIntro.tsx` — writes hint to sessionStorage, navigates to q1_chat
- `src/components/QuestionChat.tsx` — should read sessionStorage hint on mount and fire different prompt
- `src/App.tsx` — renders `<QuestionChat key={...} />` — key must change to force remount

**What's been tried (all failed in Claude AI):**
- React context (batching issues)
- useEffect watching descriptorHint (component never remounted)  
- sessionStorage approach (component still not remounting)
- Key prop on QuestionChat using selectedQuestionId + descriptorHint
- Key prop using animKey (local state in App.tsx that increments on every navigation)

**Current approach (committed but unverified):**
```tsx
// App.tsx line ~233
case 'q1_chat': return hasPaid ? <QuestionChat key={`chat-${selectedQuestionId}-${animKey}`} /> : <UpsellScreen />;
```
`animKey` is `useState(0)` in App.tsx that increments via `setAnimKey(k => k+1)` in a useEffect watching `currentScreen`.

```tsx
// QuestionIntro.tsx — descriptor tap handler
onClick={() => {
  setDescriptorHint(d.code);
  sessionStorage.setItem('pippal_descriptor_hint', d.code);
  setQ1Result(null);
  navigateTo('q1_chat');
}}
```

```tsx
// QuestionChat.tsx — mount useEffect
useEffect(() => {
  const hint = sessionStorage.getItem('pippal_descriptor_hint');
  sessionStorage.removeItem('pippal_descriptor_hint');
  if (isQ1) {
    // handle Q1 hint
    return;
  }
  if (hint) {
    fireDescriptorChat(hint);
  } else {
    callAI(`START: ${opener}`, []);
  }
}, []);
```

**Most likely fix needed:** Verify `animKey` actually increments when navigating from `q1_intro` to `q1_chat`. Add a `console.log` to confirm. If not, the key isn't changing and QuestionChat isn't remounting.

---

### BUG 2: Q2-Q12 chat design is different from Q1

**What Q1 looks like (correct):**
- Header: "Q3: Preparing Food" + "PIPpal Assistant" subtitle
- Thin teal progress bar below header  
- Animated score bar: grey dot → "Estimating score..." → updates to "Descriptor B — 2pts" as conversation progresses
- Undo button appears after first answer
- Messages: animated with framer-motion, user bubble = teal-700 rounded-tr-sm, bot bubble = white border shadow rounded-tl-sm
- Options area: bg-stone-100 border-t border-stone-200, uses `.chat-option` CSS class (white card, shadow, teal border on tap)
- Loading: 3 grey bouncing dots

**What Q2+ currently shows (wrong):**
- Different header format
- Different/missing score bar
- Different option button styling
- Different loading state
- Raw JSON sometimes visible (Claude API returning markdown fences)

**Files involved:**
- `src/components/QuestionChat.tsx`
- The `if (!isQ1)` block starting around line 583 should be identical to Q1 render but using `question?.shortTitle` etc. dynamically

**Current committed code:** The `if (!isQ1)` block has been rewritten to match Q1's structure but it's not reflecting on the live site — possibly because the browser is caching the old bundle.

**Action:** Run `npm run dev` locally and test Q2 directly. If it looks wrong locally too, fix the `if (!isQ1)` block to exactly mirror Q1's JSX. If it looks right locally, the issue is browser caching on the live site (do a hard refresh Ctrl+Shift+R).

---

## Key files

| File | Purpose |
|------|---------|
| `src/components/QuestionChat.tsx` | Main chat UI — Q1 hardcoded flow + Q2-12 AI flow |
| `src/components/QuestionIntro.tsx` | Question intro page with descriptor tap buttons |
| `src/App.tsx` | Screen router — QuestionChat key prop here |
| `src/components/AppContext.tsx` | Global state — descriptorHint, selectedQuestionId, animKey |
| `api/chat.js` | Vercel serverless — OpenAI GPT-4o with Claude fallback |

---

## How the Q1 chat works (hardcoded)
Q1 (Preparing Food) has a completely hardcoded conversation tree in QuestionChat.tsx:
- Steps: q1 → q2a/q2b → q_anxiety/detail_b → detail_c/d/e/f → result
- `renderOptions()` function returns JSX based on `currentStep` state
- Score updates via `getScoreInfo()` which reads `currentStep`
- This is NOT AI-driven — it's a decision tree

## How Q2-12 chat works (AI-driven)
- On mount, calls `callAI('START: <opener>', [])` 
- API returns `{ structured: { message, options, result } }`
- Options rendered as buttons, user taps → sent back to AI → repeat
- When AI returns `result: "B"` → calls `finishChat("B")` → saves answer → navigates to result

## API chat.js
- Uses OpenAI GPT-4o if `OPENAI_API_KEY` env var set
- Falls back to Claude (Haiku for button mode, Sonnet for standard) if no OpenAI key
- NOTE: `OPENAI_API_KEY` is NOT yet set in Vercel — so it's using Claude fallback
- Claude sometimes returns JSON wrapped in ```json ``` fences — strip these before parsing
- Current strip: `.replace(/```json\s*/g, '').replace(/```/g, '').trim()`

---

## Other completed work this session (all live)
- Points estimator on HomeScreen — taps to question index
- £8.99 limited time pricing throughout
- 100% success rate (was 94%)
- News screen: articles grouped by date (Today/Yesterday/date)
- Descriptor tappable buttons on QuestionIntro — teal CTA banner
- Descriptors Guide page — plain English, accessible from HomeScreen + QuestionIndex
- Tagline changed to "PIP claims. Made easy."
- Admin email auto-granted hasPaid
- Q2+ JSON fence stripping fix

---

## Vercel env vars needed
- `ANTHROPIC_API_KEY` ✓ set
- `VITE_SUPABASE_URL` ✓ set  
- `VITE_SUPABASE_ANON_KEY` ✓ set
- `STRIPE_SECRET_KEY` ✓ set
- `SUPABASE_SERVICE_ROLE_KEY` ✓ set
- `RESEND_API_KEY` ✓ set
- `OPENAI_API_KEY` ✗ NOT SET — add this to use GPT-4o

## Design system
Upload `b022fca3-da66-4bdf-983c-a00801bc4499.zip` for Magic Patterns reference.
- Primary: teal-700 (#0f766e)
- CTA: orange-500
- Background: stone-50
- Font: Inter
- Cards: bg-white rounded-2xl border border-stone-100 shadow-sm
