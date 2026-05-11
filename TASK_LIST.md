
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
