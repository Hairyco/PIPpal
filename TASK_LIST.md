
## Task List — Added 11 May 2026

### PENDING — Descriptors collapsed section steps 2-5
- Not showing despite 4x pushes — browser cache suspected
- Code confirmed correct (grep shows 4 instances in QuestionWizard.tsx)
- Revisit when cache issue resolved

### Task 1 — Condition-specific question content
- When medical profile is saved, all question explanations should reference the user's specific conditions
- If they have anxiety + chronic back pain: question text, explainers, examples tailored to those conditions
- Tapped conditions (pills) AND free-typed conditions should both be used
- The "This question explained" amber card text should be reworded for their conditions
- NOTE: Save this last — needs API configuration
- Reminder: configure OpenAI prompt to personalise per condition

### Task 2 — Assessment prep: two sections
- Split into In-Person Assessment and Telephone Assessment
- Add disclaimer: claimants can request telephone if anxiety/depression would cause distress
- Wire up properly with existing assessment content

### Task 3 — Free assessment email gate
- Free users must provide email before seeing score result (100% style)
- Result should be blurred/revealed after email submitted
- Remove PIP diary section at the bottom of eligibility checker result
- Verify this flow is working end to end

### Task 4 — Ask for more help pills (Step 1)
- When user taps "What does this mean?" or similar pill on question intro
- Should open an explanation box inline below — NOT open PIPpal assistant
- Smooth expand/collapse under the pill

### Task 5 — Step 3 mobile checkbox alignment
- Tick boxes not aligning on mobile
- Find alternative layout — consider full-width tappable rows instead of grid

---

## Tasks from Chat_bot_claimant_walkthrough.docx — 12 May 2026

### HIGH PRIORITY

#### H1 — Form names + downloads link on every screen
- At top of New Claim, MR, Appeals, Change of Circumstances: show the relevant form name (PIP2, AR1, SSCS1, PA4)
- Add link to downloads folder
- Add info on how to request forms (e.g. request PA4 assessor report to estimate points)

#### H2 — New Claim Step 1 restructure
- Setup for someone who knows nothing
- Structure: What is PIP → How do I apply → What you need to do next
- Remove duplicate info
- Keep layout but rethink order

#### H3 — New Claim Step 2 — make key point shorter and friendlier
- Most important thing to understand: shorter, warmer, more direct

#### H4 — New Claim Step 3 — mobile column alignment (still broken)
- Checkboxes still not aligning on mobile — find a different approach entirely
- Improve the tip at the bottom

#### H5 — Steps 2-5 of questions — add "What you are scored on" dropdown to ALL questions Q1-Q12
- Currently only on Q1 — carry through to all 12

#### H6 — All question flow changes carry through Q1-Q12
- Personalised explainer, example, help pills, live score, descriptor highlight
- All applied to every question not just Q1

#### H7 — New Claim Step 4 — remove "real examples matter most" contradiction
- Rewrite so it doesn't imply claimant writes the answer
- We gather info and do the work

#### H8 — Step 5 — add loading screen between See My Results and final answer
- Already partially done — verify it's working

#### H9 — Final answer page — Improve answer should be longer
- Current improve response is too short
- Should feel like a full, real answer a person would write

#### H10 — Final answer page — better layout for redo/improve/next
- When user selects Improve: show previous answer option
- Better UI for switching between versions

#### H11 — Final answer page — if user edits then clicks Improve
- Should be faithful to their edit but add detail/strengthen wording
- Not completely rewrite what they put

### MEDIUM PRIORITY

#### M1 — Change of Circumstances — full redesign
- Upload previous form at top (with how to request instructions)
- Collapsible steps
- New content as per document (6 steps with AR1 form info)
- Warning: reassessment covers everything, risk of going down

#### M2 — MR (Mandatory Reconsideration) — full redesign  
- Collapsible steps
- Add upload documents section
- Reference uploads throughout
- Include "Get your PA4 report first" prominently
- New content as per document (6 steps, descriptor-by-descriptor approach)

#### M3 — Appeals — full redesign
- Keep statistics at top
- Upload decision letter/MR at top
- Collapsible steps
- New content as per document (7 steps, tribunal prep focus)

#### M4 — Change of Circumstances/MR/Appeals — same step-by-step format as New Claim

### ALREADY DONE (from this doc, verify)
- Assessment prep: in-person and telephone tabs ✓
- Free assessment email gate ✓
- Help pills open inline ✓
- Step 3 mobile alignment (partially — still needs work per H4)

