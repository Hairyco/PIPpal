import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, ChevronDown, ChevronUp, Info, CheckCircle2, Circle, Check, Home, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext, type MedProfile } from './AppContext';
import { getQuestionFlow, FlowAnswers, FrequencyLevel } from '../data/questionFlowData';
import { PIP_QUESTIONS, type PIPQuestion } from '../pipQuestions';

type Step = 1 | 2 | 3 | 4 | 5;

const FREQUENCIES: { id: FrequencyLevel; label: string; sublabel: string }[] = [
  { id: 'never',     label: 'Never',     sublabel: '' },
  { id: 'rarely',    label: 'Rarely',    sublabel: 'Less than 1 day a week' },
  { id: 'sometimes', label: 'Sometimes', sublabel: '1–3 days a week' },
  { id: 'often',     label: 'Often',     sublabel: '4–6 days a week' },
  { id: 'most_days', label: 'Most days', sublabel: '7 days a week' },
];

/** Same columns for header + rows so labels and radios stay aligned on all screen sizes */
const FREQ_GRID_TEMPLATE = 'minmax(0,1fr) repeat(5, minmax(2.75rem, 1fr))' as const;

/** Set `true` to restore "Ask for more help" on question intro (step 1). */
const SHOW_ASK_MORE_HELP_SECTION = false;

function AskMoreHelpSection({ pipQ, medProfile }: { pipQ: PIPQuestion; medProfile: MedProfile }) {
  const [openHelpIdx, setOpenHelpIdx] = useState<number | null>(null);
  const userConditions = medProfile.conditions.map((c: any) => c.name.toLowerCase());
  const explainers = pipQ.conditionExplainers || [];
  const sorted = [...explainers].sort((a, b) => {
    const aMatch = a.conditions.some((c: string) => userConditions.some((u: string) => u.includes(c.toLowerCase()) || c.toLowerCase().includes(u)));
    const bMatch = b.conditions.some((c: string) => userConditions.some((u: string) => u.includes(c.toLowerCase()) || c.toLowerCase().includes(u)));
    return aMatch === bMatch ? 0 : aMatch ? -1 : 1;
  });

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">Ask for more help</p>
      <div className="flex flex-wrap gap-2">
        {sorted.slice(0, 4).map((ce, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenHelpIdx(openHelpIdx === i ? null : i)}
            className={`text-xs font-medium rounded-full px-3 py-1.5 border transition-all active:scale-95 ${openHelpIdx === i ? 'bg-teal-600 text-white border-teal-600' : 'text-teal-700 bg-teal-50 border-teal-100 hover:bg-teal-100'}`}
          >
            How does this affect {ce.conditions[0]}?
          </button>
        ))}
      </div>
      {openHelpIdx !== null && (() => {
        const ce = sorted[openHelpIdx];
        return ce ? (
          <div className="mt-3 pt-3 border-t border-stone-100">
            <p className="text-sm text-stone-700 leading-relaxed">{ce.text}</p>
            {ce.example && <p className="text-xs text-stone-400 italic mt-1">&quot;{ce.example}&quot;</p>}
          </div>
        ) : null;
      })()}
    </div>
  );
}

function GeneratingOverlay({ onSkip }: { onSkip: () => void }) {
  const [showStuck, setShowStuck] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowStuck(true), 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-stone-50 z-50 px-8">
      <div className="flex flex-col items-center gap-6 max-w-xs text-center">
        <div className="w-16 h-16 bg-teal-700 rounded-2xl flex items-center justify-center shadow-lg">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-bold text-stone-900 text-xl mb-2">Building your answer...</h2>
          <p className="text-sm text-stone-500 leading-relaxed">PIPpal is writing your personalised claim answer using everything you've told us.</p>
        </div>
        <p className="text-[11px] text-stone-400">This takes a few seconds</p>
        {showStuck && (
          <button
            onClick={onSkip}
            className="text-xs text-stone-400 hover:text-teal-600 underline underline-offset-2 transition-colors"
          >
            Page stuck? Tap to continue
          </button>
        )}
      </div>
    </div>
  );
}

export function QuestionFlow() {
  const { selectedQuestionId, navigateTo, goBack, saveAnswer, saveAnswerDetails, setQ1Result, medProfile, cocMode, cocPreviousAnswers, cocFormType, cocDocumentType, cocAssessorNotes, cocPreviousPoints } = useAppContext();

  const hasPip2Answer = (qid: string) => !!(cocPreviousAnswers[qid] && (cocDocumentType === 'pip2_only' || cocDocumentType === 'both'));
  const hasAssessorNote = (qid: string) => !!(cocAssessorNotes[qid] && (cocDocumentType === 'pa4_only' || cocDocumentType === 'both'));

  const prevAnswerLabel =
    cocDocumentType === 'pa4_only'
      ? 'What the assessor noted'
      : cocDocumentType === 'award_only'
        ? 'What your award letter says'
        : 'Your previous answer';

  const prevAnswerGoal =
    cocDocumentType === 'pa4_only'
      ? 'The assessor wrote this — not you. Your answer should be in your own words and go further than what they recorded.'
      : cocDocumentType === 'award_only'
        ? 'This is what DWP decided last time — your new answer should explain what has changed or got harder since then, in your own words.'
        : cocFormType === 'ar1'
          ? 'DWP has this on file. Only describe what has changed or got worse since this was written.'
          : 'Your goal: write something stronger and more specific than this.';
  const questionId = selectedQuestionId || 'q1';
  const config = getQuestionFlow(questionId);
  const pipQ = PIP_QUESTIONS.find(q => q.id === questionId);

  const [step, setStep] = useState<Step>(1);
  // Expanded by default on mobile, collapsed on desktop
  const [showDescriptors, setShowDescriptors] = useState(false);
  const [showFullExample, setShowFullExample] = useState(true);
  const [questionExplainedOpen, setQuestionExplainedOpen] = useState(() => {
    try {
      return !(
        import.meta.env.DEV &&
        new URLSearchParams(window.location.search).get('screenshot') === 'coc_compare'
      );
    } catch {
      return true;
    }
  });
  const [loadingExample] = useState(false);

  // Read pre-generated content from sessionStorage (set by PersonalisingScreen)
  const [personalExample, setPersonalExample] = useState<string | null>(
    () => sessionStorage.getItem(`pippal_example_${questionId}`) || null
  );
  const [personalExplainer, setPersonalExplainer] = useState<string | null>(
    () => sessionStorage.getItem(`pippal_explainer_${questionId}`) || null
  );
  const [isPersonalising, setIsPersonalising] = useState(false);
  const [personalisedJustNow, setPersonalisedJustNow] = useState(false);

  async function rePersonalise() {
    if (!config || isPersonalising) return;
    const conditions = medProfile?.conditions?.map((c: any) => c.name) || [];
    if (!conditions.length) return;
    const conditionNames = conditions.join(', ');
    setIsPersonalising(true);
    setPersonalisedJustNow(false);
    try {
      const [explainerRes, exampleRes] = await Promise.all([
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Write a warm, friendly explanation for a PIP question for someone with: ${conditionNames}.

The activity is: "${config.title}"
Original DWP description: "${config.explained}"

Write 3-4 short sentences that:
1. Explain in plain English what DWP is REALLY asking
2. Reassure them — they don't need to be severely physically disabled to score points. Mental health, fatigue, brain fog, needing help — all count
3. Tell them specifically how ${conditionNames} is relevant to THIS activity
4. Hint that PIPpal will write the answer for them — they just need to describe how they feel day to day

Tone: warm, plain British English, encouraging. Under 80 words. Return ONLY the explanation text.`,
            conversationHistory: [],
            medProfile: { conditions: medProfile.conditions },
          }),
        }),
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Write a 2-3 sentence first-person example answer for PIP activity: "${config.title}". The person has: ${conditionNames}. Show how those exact conditions affect this activity on worst days. Include frequency and real impact. Start with "I". Return ONLY the example.`,
            conversationHistory: [],
            medProfile: { conditions: medProfile.conditions },
          }),
        }),
      ]);
      if (explainerRes.ok && exampleRes.ok) {
        const [ed, exd] = await Promise.all([explainerRes.json(), exampleRes.json()]);
        const explainer = ed.reply?.trim();
        const example = exd.reply?.trim();
        if (explainer) { setPersonalExplainer(explainer); sessionStorage.setItem(`pippal_explainer_${questionId}`, explainer); }
        if (example) { setPersonalExample(example); sessionStorage.setItem(`pippal_example_${questionId}`, example); }
        setPersonalisedJustNow(true);
      }
    } catch { /* silently fail */ }
    setIsPersonalising(false);
  }

  const [answers, setAnswers] = useState<FlowAnswers>({
    selectedDifficulties: [],
    frequencies: {},
    supportTypes: [],
    impacts: [],
    additionalDetail: '',
  });

  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (
      import.meta.env.DEV &&
      new URLSearchParams(window.location.search).get('screenshot') === 'coc_compare'
    ) {
      return;
    }
    setQuestionExplainedOpen(true);
  }, [questionId]);

  if (!config) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-stone-50 p-8">
        <p className="text-stone-500">Question not found.</p>
        <button onClick={goBack} className="mt-4 text-teal-600 font-semibold">Go back</button>
      </div>
    );
  }

  const totalDifficulties = answers.selectedDifficulties.length;

  // ─── STEP NAVIGATION ───────────────────────────────────────────────────────

  function goToStep(n: Step) {
    setStep(n);
    window.scrollTo(0, 0);
  }

  function handleBack() {
    if (step === 1) goBack();
    else goToStep((step - 1) as Step);
  }

  function handleContinue() {
    if (step === 5) {
      setGenerating(true);
      finishQuestion().finally(() => setGenerating(false));
    } else {
      if (step === 2 && totalDifficulties === 0) {
        goToStep(4);
      } else {
        goToStep((step + 1) as Step);
      }
    }
  }

  // ─── FINISH ────────────────────────────────────────────────────────────────

  async function finishQuestion() {
    const descriptor = config!.calculateDescriptor(answers);
    saveAnswer(questionId, `Descriptor ${descriptor}`);

    // Persist selected difficulty texts for Your answers prep / exports
    const allDiff = config!.difficultyCategories.flatMap(c => c.difficulties);
    const difficultyTexts = answers.selectedDifficulties
      .map(id => allDiff.find(d => d.id === id)?.text)
      .filter((t): t is string => Boolean(t));

    const d = pipQ?.descriptors.find(d => d.code === descriptor);
    const nothingSelected = answers.selectedDifficulties.length === 0;

    // If nothing was selected, leave the draft blank — no answer to generate
    let finalText = '';
    if (!nothingSelected) {
      const rawDraft = buildDraftText(descriptor);
      const conditions = medProfile.conditions.map((c: any) => c.name).join(', ') || 'not specified';

      const prevPts = cocPreviousPoints[questionId];
      const prevAns = cocPreviousAnswers[questionId]?.trim();
      const pa4Line = cocAssessorNotes[questionId]?.trim();
      const cocBlock =
        cocMode === true
          ? `

CHANGE OF CIRCUMSTANCES — mandatory:
${prevPts != null ? `- Previous recorded points for this activity: ${prevPts}. Descriptor now: ${descriptor} (${d?.points ?? '?'} pts). Explain worsening since then.` : '- Previous activity points unknown — contrast honestly with prior wording below.'}
${prevAns ? `- On-file wording: "${prevAns.slice(0, 2400)}${prevAns.length > 2400 ? '…' : ''}"` : ''}
${pa4Line ? `- Assessor PA4 wording: "${pa4Line.slice(0, 2400)}${pa4Line.length > 2400 ? '…' : ''}" — correct or extend where their notes were thin or outdated.` : ''}

You MUST briefly reference what was on file before, then show what is harder, less reliable, or less safe NOW. Never imply improvement overall.
`
          : '';

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `You are helping a UK PIP claimant write one section of their PIP2 form. Rewrite the structured notes below as a natural first-person answer — how a real person would describe their life, not a form.

Activity being assessed: "${config!.title}"
Claimant's conditions: ${conditions}
Structured notes (do NOT copy these word-for-word): ${rawDraft}
Qualifying descriptor: ${descriptor} — "${d?.text}"
${cocBlock}
Requirements:
- 3–5 sentences, written in first person
- Start with a specific, concrete example of what happens (e.g. "Most mornings I..." or "When I try to...")
- Use plain everyday British English — no jargon, no formal phrases
- Describe their worst or typical bad days, not their best
- Include how often the difficulties happen
- Mention any help, supervision, or aids they need
- Include real-life impact (e.g. relying on ready meals, needing someone present)
- Sound like the person wrote it themselves — honest, human, specific
${cocMode ? '- Tie explicitly to earlier on-file or assessor wording where provided, then show deterioration clearly.' : ''}

Do NOT start with "I experience difficulties", "I am unable to", or the activity name.
Do NOT invent anything not in the notes above.
Return ONLY the final answer text — no preamble, no labels, no explanation.`,
            conversationHistory: [],
            medProfile: { conditions: medProfile.conditions },
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.reply) finalText = data.reply.trim();
        }
      } catch { /* fall through to rawDraft */ }

      // Fallback: use the raw draft but strip the robotic opener
      if (!finalText) {
        finalText = rawDraft
          .replace(/^I experience difficulties with [^,]+, specifically: /i, 'I struggle with ')
          .replace(/These difficulties occur /i, 'This happens ');
      }
    }

    saveAnswerDetails(questionId, { difficulties: difficultyTexts, answerText: finalText || undefined });

    setQ1Result({
      descriptor,
      points: d?.points ?? 0,
      label: d?.text ?? '',
      text: finalText,
      confidence: 'high',
      messages: [],
    });

    navigateTo('q1_result');
  }

  function buildDraftText(descriptor: string): string {
    const { selectedDifficulties, frequencies, supportTypes, impacts, additionalDetail } = answers;
    const allDiff = config!.difficultyCategories.flatMap(c => c.difficulties);
    const diffTexts = selectedDifficulties
      .map(id => allDiff.find(d => d.id === id)?.text)
      .filter(Boolean);

    const freqParts = selectedDifficulties
      .filter(id => frequencies[id] && frequencies[id] !== 'never')
      .map(id => {
        const text = allDiff.find(d => d.id === id)?.text?.toLowerCase();
        const freq = frequencies[id];
        const freqLabel = FREQUENCIES.find(f => f.id === freq)?.label?.toLowerCase();
        return `${text} (${freqLabel})`;
      });

    const supportTexts = supportTypes
      .filter(id => id !== config!.noHelpId)
      .map(id => config!.supportOptions.find(o => o.id === id)?.title)
      .filter(Boolean);

    const impactTexts = impacts
      .map(id => config!.impactOptions.find(o => o.id === id)?.title)
      .filter(Boolean);

    let draft = '';
    if (diffTexts.length > 0) {
      draft += `I experience difficulties with ${config!.title.toLowerCase()}, specifically: ${diffTexts.join(', ')}.`;
    }
    if (freqParts.length > 0) {
      draft += ` These difficulties occur ${freqParts.slice(0, 2).join(' and ')}.`;
    }
    if (supportTexts.length > 0) {
      draft += ` ${supportTexts.join('. ')}.`;
    }
    if (impactTexts.length > 0) {
      draft += ` As a result: ${impactTexts.join(', ')}.`;
    }
    if (additionalDetail.trim()) {
      draft += ` ${additionalDetail.trim()}`;
    }
    if (!draft) {
      draft = `I am able to ${config!.title.toLowerCase()} without significant difficulty.`;
    }
    return draft.trim();
  }

  // ─── DIFFICULTY TOGGLE ─────────────────────────────────────────────────────

  function toggleDifficulty(id: string) {
    setAnswers(prev => {
      const has = prev.selectedDifficulties.includes(id);
      return {
        ...prev,
        selectedDifficulties: has
          ? prev.selectedDifficulties.filter(d => d !== id)
          : [...prev.selectedDifficulties, id],
      };
    });
  }

  // ─── SUPPORT TOGGLE ────────────────────────────────────────────────────────

  function toggleSupport(id: string) {
    setAnswers(prev => {
      const noHelpId = config!.noHelpId;
      if (id === noHelpId) {
        return { ...prev, supportTypes: [noHelpId] };
      }
      const filtered = prev.supportTypes.filter(s => s !== noHelpId);
      const has = filtered.includes(id);
      return {
        ...prev,
        supportTypes: has ? filtered.filter(s => s !== id) : [...filtered, id],
      };
    });
  }

  // ─── IMPACT TOGGLE ─────────────────────────────────────────────────────────

  function toggleImpact(id: string) {
    setAnswers(prev => {
      const has = prev.impacts.includes(id);
      return {
        ...prev,
        impacts: has ? prev.impacts.filter(i => i !== id) : [...prev.impacts, id],
      };
    });
  }

  // ─── SHARED HEADER ─────────────────────────────────────────────────────────

  const questionLabel = config.activityType === 'daily'
    ? `DAILY LIVING ACTIVITY ${config.activityNum}`
    : `MOBILITY ACTIVITY ${config.activityNum}`;

  const stepTitle = ['', "Let's begin", "What's hard for you?", 'How often?', 'Do you need support?', 'Day-to-day impact'][step];

  const liveDescriptor = config.calculateDescriptor(answers);
  const livePoints = pipQ?.descriptors.find(d => d.code === liveDescriptor)?.points ?? 0;

  function Header() {
    return (
      <div className="bg-white border-b border-stone-100 sticky top-0 z-20">
        <div className="px-5 py-3 flex items-center gap-3">
          <button onClick={handleBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider">Step {step} of 5</p>
            <p className="font-bold text-stone-900 text-sm truncate">{stepTitle}</p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => {
                sessionStorage.setItem('pippal_resume', JSON.stringify({ questionId, step, title: config!.title }));
                navigateTo('home');
              }}
              className="flex items-center gap-1 text-[11px] font-semibold text-stone-400 hover:text-teal-600 transition-colors px-2 py-1 rounded-lg hover:bg-teal-50"
              title="Go to dashboard"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── QUESTION CARD (shown on all steps) ────────────────────────────────────

  function QuestionCard({ compact = false }) {
    return (
      <div className="bg-teal-700 rounded-2xl p-5 text-white">
        <p className="text-teal-300 text-[10px] font-bold uppercase tracking-widest mb-2">{questionLabel}</p>
        <h2 className={`font-black leading-tight text-white ${compact ? 'text-base' : 'text-xl'}`}>{config!.title}</h2>
        {!compact && (
          <p className="text-teal-200 text-sm mt-1.5 leading-relaxed">{config!.subtitle}</p>
        )}
      </div>
    );
  }

  // ─── STEP 1: INTRO ─────────────────────────────────────────────────────────

  if (step === 1) {
    return (
      <div className="flex flex-col h-full bg-stone-50">
        <Header />
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="px-5 py-5 space-y-4 pb-4">
            <QuestionCard />

            {/* This question explained — expanded by default (CoC can collapse to focus on documents) */}
            <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-stone-50 gap-2">
                {cocMode ? (
                  <button
                    type="button"
                    onClick={() => setQuestionExplainedOpen(o => !o)}
                    className="flex items-center gap-2 min-w-0 flex-1 text-left rounded-lg -mx-1 px-1 py-0.5 hover:bg-stone-50 transition-colors"
                  >
                    <Info className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="font-bold text-stone-900 text-sm">This question explained</span>
                    {questionExplainedOpen ? (
                      <ChevronUp className="w-4 h-4 text-stone-400 shrink-0 ml-auto" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-400 shrink-0 ml-auto" />
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Info className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="font-bold text-stone-900 text-sm">This question explained</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={rePersonalise}
                  disabled={isPersonalising}
                  className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border transition-all disabled:opacity-50 shrink-0 ${
                    !isPersonalising && (personalExplainer || personalisedJustNow)
                      ? 'text-teal-600 bg-teal-50 border-teal-200 hover:bg-teal-100'
                      : 'text-stone-400 hover:text-teal-600 border-stone-200 hover:border-teal-300'
                  }`}
                >
                  {isPersonalising ? (
                    <div className="w-2.5 h-2.5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                  ) : (personalExplainer || personalisedJustNow) ? (
                    <CheckCircle2 className="w-2.5 h-2.5" />
                  ) : (
                    <Sparkles className="w-2.5 h-2.5" />
                  )}
                  {isPersonalising ? 'Personalising...' : (personalExplainer || personalisedJustNow) ? 'Personalised' : 'Personalise'}
                </button>
              </div>
              {(!cocMode || questionExplainedOpen) && (
                <p className="px-4 py-4 text-sm text-stone-700 leading-relaxed">
                  {personalExplainer || config.explained}
                </p>
              )}
            </div>

            {SHOW_ASK_MORE_HELP_SECTION && pipQ && (
              <AskMoreHelpSection pipQ={pipQ} medProfile={medProfile} />
            )}

            {/* Previous answer (CoC mode); example answer shown for everyone */}
            {cocMode && (
              <div className="space-y-2">
                {/* PIP2 — claimant's own words (shown unless pa4_only) */}
                {cocDocumentType !== 'pa4_only' && cocDocumentType !== 'award_only' && (
                  <div className={`rounded-2xl p-4 border ${cocFormType === 'ar1' ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <p className={`text-[11px] font-bold uppercase tracking-widest ${cocFormType === 'ar1' ? 'text-purple-500' : 'text-blue-500'}`}>{prevAnswerLabel}</p>
                      {cocFormType === 'ar1' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-800">describe the change</span>}
                    </div>
                    {hasPip2Answer(questionId) ? (
                      <>
                        <div className={`border-l-4 pl-3 ${cocFormType === 'ar1' ? 'border-purple-300' : 'border-blue-300'}`}>
                          <p className={`text-sm leading-relaxed italic ${cocFormType === 'ar1' ? 'text-purple-900' : 'text-blue-900'}`}>"{cocPreviousAnswers[questionId]}"</p>
                        </div>
                        <p className={`text-[11px] font-semibold mt-2 ${cocFormType === 'ar1' ? 'text-purple-700' : 'text-blue-600'}`}>{prevAnswerGoal}</p>
                      </>
                    ) : (
                      <p className={`text-sm italic ${cocFormType === 'ar1' ? 'text-purple-400' : 'text-blue-400'}`}>No previous answer found for this activity — build a fresh one below.</p>
                    )}
                  </div>
                )}
                {cocDocumentType === 'award_only' && (
                  <div className="rounded-2xl p-4 border bg-indigo-50 border-indigo-200">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">{prevAnswerLabel}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">DWP decision</span>
                    </div>
                    {cocPreviousAnswers[questionId] ? (
                      <>
                        <div className="border-l-4 border-indigo-300 pl-3">
                          <p className="text-sm leading-relaxed italic text-indigo-950">"{cocPreviousAnswers[questionId]}"</p>
                        </div>
                        <p className="text-[11px] font-semibold mt-2 text-indigo-800">{prevAnswerGoal}</p>
                      </>
                    ) : (
                      <p className="text-sm italic text-indigo-400">Nothing read for this activity from your letter — build your answer fresh below.</p>
                    )}
                  </div>
                )}
                {/* PA4-only primary card (no PIP2 uploaded) */}
                {cocDocumentType === 'pa4_only' && (
                  <div className="rounded-2xl p-4 border bg-amber-50 border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600">What the assessor noted</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">assessor's view</span>
                    </div>
                    {cocPreviousAnswers[questionId] ? (
                      <>
                        <div className="border-l-4 border-amber-300 pl-3">
                          <p className="text-sm leading-relaxed italic text-amber-900">"{cocPreviousAnswers[questionId]}"</p>
                        </div>
                        <p className="text-[11px] font-semibold mt-2 text-amber-700">The assessor wrote this — not you. Answer in your own words and go further than what they recorded.</p>
                      </>
                    ) : (
                      <p className="text-sm italic text-amber-400">No assessor observation recorded for this activity — build your answer fresh below.</p>
                    )}
                  </div>
                )}
                {/* PA4 secondary card (shown when both were uploaded) */}
                {hasAssessorNote(questionId) && (
                  <div className="rounded-2xl p-4 border bg-amber-50 border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600">What the assessor noted</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">PA4 report</span>
                    </div>
                    <div className="border-l-4 border-amber-300 pl-3">
                      <p className="text-sm leading-relaxed italic text-amber-900">"{cocAssessorNotes[questionId]}"</p>
                    </div>
                    <p className="text-[11px] font-semibold mt-2 text-amber-700">Use this to understand where you scored low — and make sure your new answer addresses it directly.</p>
                  </div>
                )}
              </div>
            )}
            <div className="rounded-2xl border border-teal-100 bg-teal-50/40 p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                    <span className="text-teal-700 text-xs font-bold">
                      {personalExample
                        ? medProfile?.conditions?.[0]?.name?.[0]?.toUpperCase() || 'Y'
                        : config.exampleAnswer.name[0]}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest leading-none">
                      {personalExample ? 'Example based on your conditions' : 'Example answer'}
                    </p>
                    <p className="text-xs font-semibold text-stone-600 mt-0.5 truncate">
                      {personalExample
                        ? medProfile.conditions.map((c: any) => c.name).join(' · ')
                        : `${config.exampleAnswer.name}, ${config.exampleAnswer.age} · ${config.exampleAnswer.label}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={rePersonalise}
                  disabled={isPersonalising}
                  className={`flex items-center gap-1 text-[10px] font-bold bg-white border px-2 py-1 rounded-full transition-all disabled:opacity-50 shrink-0 ${
                    !isPersonalising && (personalExample || personalisedJustNow)
                      ? 'text-teal-600 border-teal-300 hover:bg-teal-50'
                      : 'text-stone-400 hover:text-teal-600 border-teal-200 hover:border-teal-300'
                  }`}
                >
                  {isPersonalising ? (
                    <div className="w-2.5 h-2.5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                  ) : (personalExample || personalisedJustNow) ? (
                    <CheckCircle2 className="w-2.5 h-2.5" />
                  ) : (
                    <Sparkles className="w-2.5 h-2.5" />
                  )}
                  {isPersonalising ? 'Personalising...' : (personalExample || personalisedJustNow) ? 'Personalised' : 'Personalise'}
                </button>
              </div>
              <div className="border-l-4 border-teal-300 pl-3">
                {loadingExample ? (
                  <div className="space-y-1.5">
                    <div className="h-3 bg-teal-100 rounded animate-pulse w-full" />
                    <div className="h-3 bg-teal-100 rounded animate-pulse w-4/5" />
                    <div className="h-3 bg-teal-100 rounded animate-pulse w-3/5" />
                  </div>
                ) : (
                  <p className="text-sm text-stone-600 leading-relaxed italic">
                    "{personalExample ?? config.exampleAnswer.quote}"
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Start button */}
        <div className="px-5 pb-6 pt-3 bg-white border-t border-stone-100 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
          <button
            onClick={() => goToStep(2)}
            className="w-full bg-teal-700 text-white py-4 rounded-2xl font-bold text-base hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm"
          >
            Let's get started
          </button>
        </div>
      </div>
    );
  }

  // ─── STEP 2: SELECT DIFFICULTIES ───────────────────────────────────────────

  if (step === 2) {
    return (
      <div className="flex flex-col h-full bg-stone-50">
        <Header />
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="px-5 py-4 space-y-4 pb-32">
            <div className="bg-teal-700 rounded-2xl p-5 text-white">
              <p className="text-teal-300 text-[10px] font-bold uppercase tracking-widest mb-1">{questionLabel}</p>
              <h2 className="font-black text-lg leading-tight">
                {!cocMode ? 'What makes this hard for you?' : cocFormType === 'ar1' ? 'What has changed since your last assessment?' : 'How has this got harder?'}
              </h2>
              <p className="text-teal-200 text-sm mt-1.5 leading-relaxed">
                {!cocMode
                  ? 'Select everything that applies — tick all that are true, even on your worst days. The more difficulties you select that are genuine, the higher your score can be.'
                  : cocFormType === 'ar1'
                    ? 'Select only what has changed or got worse since your last form. If something is the same as before, skip it — DWP already has that information.'
                    : 'Select everything that applies now — even if it was true before. Focus on what\'s got worse or more frequent since your last assessment.'}
              </p>
            </div>

            {/* Previous answer reference — CoC mode only */}
            {cocMode && (
              <div className="space-y-2">
                {/* PIP2 reference (not shown when pa4_only) */}
                {cocDocumentType !== 'pa4_only' && cocDocumentType !== 'award_only' && (
                  <div className={`rounded-2xl p-4 border ${cocFormType === 'ar1' ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${cocFormType === 'ar1' ? 'text-purple-500' : 'text-blue-500'}`}>{prevAnswerLabel}</p>
                      {cocFormType === 'ar1' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-800">only describe the change</span>}
                    </div>
                    {hasPip2Answer(questionId) ? (
                      <p className={`text-sm leading-relaxed italic line-clamp-3 ${cocFormType === 'ar1' ? 'text-purple-900' : 'text-blue-900'}`}>"{cocPreviousAnswers[questionId]}"</p>
                    ) : (
                      <p className={`text-sm italic ${cocFormType === 'ar1' ? 'text-purple-400' : 'text-blue-400'}`}>No previous answer found — select what applies now.</p>
                    )}
                  </div>
                )}
                {cocDocumentType === 'award_only' && (
                  <div className="rounded-2xl p-4 border bg-indigo-50 border-indigo-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">{prevAnswerLabel}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">DWP decision</span>
                    </div>
                    {cocPreviousAnswers[questionId] ? (
                      <p className="text-sm leading-relaxed italic line-clamp-3 text-indigo-950">"{cocPreviousAnswers[questionId]}"</p>
                    ) : (
                      <p className="text-sm italic text-indigo-400">Nothing read from your letter — select what applies now.</p>
                    )}
                  </div>
                )}
                {/* PA4-only primary reference */}
                {cocDocumentType === 'pa4_only' && (
                  <div className="rounded-2xl p-4 border bg-amber-50 border-amber-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">What the assessor noted</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">assessor's view</span>
                    </div>
                    {cocPreviousAnswers[questionId] ? (
                      <p className="text-sm leading-relaxed italic line-clamp-3 text-amber-900">"{cocPreviousAnswers[questionId]}"</p>
                    ) : (
                      <p className="text-sm italic text-amber-400">No assessor observation — select what applies now.</p>
                    )}
                  </div>
                )}
                {/* PA4 secondary reference when both uploaded */}
                {hasAssessorNote(questionId) && (
                  <div className="rounded-2xl p-3 border bg-amber-50 border-amber-200">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Assessor's view</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">PA4</span>
                    </div>
                    <p className="text-xs leading-relaxed italic line-clamp-2 text-amber-900">"{cocAssessorNotes[questionId]}"</p>
                  </div>
                )}
              </div>
            )}

            {/* What you are scored on — highlights live matching descriptor */}
            {pipQ && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setShowDescriptors(s => !s)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                >
                  <div>
                    <p className="text-sm font-bold text-stone-900">What you are scored on</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {livePoints > 0 && (
                        <p className="text-xs text-teal-600 font-medium">This question: {livePoints}pts</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-stone-400">{showDescriptors ? '▲ Hide' : '▼ Show'}</span>
                </button>
                {showDescriptors && (
                  <div className="border-t border-stone-100">
                    {pipQ.descriptors.map(d => {
                      const isMatch = liveDescriptor === d.code && livePoints > 0;
                      return (
                        <div key={d.code} className={`flex items-start gap-3 px-4 py-3 border-b border-stone-50 last:border-0 transition-all ${isMatch ? 'bg-teal-50' : ''}`}>
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 transition-all ${isMatch ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-500'}`}>{d.code}</span>
                          <span className={`flex-1 text-xs leading-relaxed transition-all ${isMatch ? 'text-teal-900 font-semibold' : 'text-stone-600'}`}>{d.text}</span>
                          <span className={`text-xs font-bold shrink-0 mt-0.5 ${d.points === 0 ? 'text-stone-400' : isMatch ? 'text-teal-600' : 'text-stone-400'}`}>{d.points}pts</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {cocMode && (
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide px-1">
                {cocFormType === 'ar1' ? "What's changed since your last form?" : "What's got worse or more frequent?"}
              </p>
            )}

            {config.difficultyCategories.map(cat => (
              <div key={cat.id}>
                {!cocMode && <p className="text-xs font-bold text-stone-500 uppercase tracking-wide px-1 mb-2">{cat.name}</p>}
                <div className="space-y-2">
                  {cat.difficulties.map(diff => {
                    const selected = answers.selectedDifficulties.includes(diff.id);
                    return (
                      <button
                        key={diff.id}
                        onClick={() => toggleDifficulty(diff.id)}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-all active:scale-[0.98] font-medium text-sm ${
                          selected
                            ? `${cat.selectedBg} ${cat.selectedText} border-transparent shadow-sm`
                            : 'bg-white text-stone-800 border-stone-150 shadow-sm hover:border-stone-300'
                        }`}
                      >
                        <span>{diff.text}</span>
                        {selected && <Check className="w-4 h-4 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Something else */}
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide px-1 mb-2">Something else?</p>
              <input
                type="text"
                placeholder="e.g. I burn myself often..."
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-teal-400 focus:border-teal-400 shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="px-5 pb-8 pt-4 bg-white border-t border-stone-100 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
          <button onClick={handleContinue} className="w-full bg-teal-700 text-white py-4 rounded-2xl font-bold text-base hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ─── STEP 3: FREQUENCY ─────────────────────────────────────────────────────

  if (step === 3) {
    const selectedDiffs = config.difficultyCategories
      .flatMap(c => c.difficulties)
      .filter(d => answers.selectedDifficulties.includes(d.id));

    return (
      <div className="flex flex-col h-full bg-stone-50">
        <Header />
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="px-5 py-4 pb-32 space-y-4">
            <div className="bg-teal-700 rounded-2xl p-5 text-white">
              <p className="text-teal-300 text-[10px] font-bold uppercase tracking-widest mb-1">{questionLabel}</p>
              <h2 className="font-black text-lg leading-tight">How often does this happen?</h2>
              <p className="text-teal-200 text-sm mt-1.5 leading-relaxed">Your frequency answers directly affect your score. "Often" or "always" tells the assessor this is a persistent, recurring problem — not a one-off.</p>
            </div>

            {/* What you are scored on — always visible steps 3-5 */}
            {pipQ && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setShowDescriptors(s => !s)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                >
                  <div>
                    <p className="text-sm font-bold text-stone-900">What you are scored on</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {livePoints > 0 && (
                        <p className="text-xs text-teal-600 font-medium">This question: {livePoints}pts</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-stone-400">{showDescriptors ? '▲ Hide' : '▼ Show'}</span>
                </button>
                {showDescriptors && (
                  <div className="border-t border-stone-100">
                    {pipQ.descriptors.map(d => {
                      const isMatch = liveDescriptor === d.code && livePoints > 0;
                      return (
                        <div key={d.code} className={`flex items-start gap-3 px-4 py-3 border-b border-stone-50 last:border-0 transition-all ${isMatch ? 'bg-teal-50' : ''}`}>
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 transition-all ${isMatch ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-500'}`}>{d.code}</span>
                          <span className={`flex-1 text-xs leading-relaxed transition-all ${isMatch ? 'text-teal-900 font-semibold' : 'text-stone-600'}`}>{d.text}</span>
                          <span className={`text-xs font-bold shrink-0 mt-0.5 ${d.points === 0 ? 'text-stone-400' : isMatch ? 'text-teal-600' : 'text-stone-400'}`}>{d.points}pts</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Frequency grid — items-start keeps radios lined up with first line when labels wrap */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              {/* Header row */}
              <div className="grid items-start gap-0 border-b border-stone-100" style={{ gridTemplateColumns: FREQ_GRID_TEMPLATE }}>
                <div className="p-3 min-h-[2.75rem]" aria-hidden />
                {FREQUENCIES.map(f => (
                  <div key={f.id} className="p-2 pt-3 pb-2 text-center border-l border-stone-50 min-h-[2.75rem] flex flex-col items-center justify-start gap-0.5">
                    <p className="text-[10px] font-bold text-stone-500 leading-tight break-words hyphens-auto max-w-full px-0.5">{f.label}</p>
                    {f.sublabel && <p className="text-[9px] text-stone-400 leading-tight hidden sm:block">{f.sublabel}</p>}
                  </div>
                ))}
              </div>

              {/* Difficulty rows */}
              {selectedDiffs.map((diff, i) => (
                <div
                  key={diff.id}
                  className={`grid items-start gap-0 ${i < selectedDiffs.length - 1 ? 'border-b border-stone-50' : ''}`}
                  style={{ gridTemplateColumns: FREQ_GRID_TEMPLATE }}
                >
                  <p className="px-3 py-3 pr-2 text-xs text-stone-700 font-medium leading-snug self-start">{diff.text}</p>
                  {FREQUENCIES.map(f => {
                    const selected = answers.frequencies[diff.id] === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setAnswers(prev => ({ ...prev, frequencies: { ...prev.frequencies, [diff.id]: f.id } }))}
                        className="flex items-start justify-center pt-3 pb-3 min-h-[2.75rem] border-l border-stone-50 hover:bg-teal-50 active:bg-teal-100/80 transition-colors touch-manipulation"
                      >
                        <span className="inline-flex shrink-0 mt-0.5" aria-hidden>
                          {selected
                            ? <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>
                            : <div className="w-5 h-5 rounded-full border-2 border-stone-300 bg-white" />
                          }
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="bg-teal-50 rounded-xl px-4 py-3 border border-teal-100">
              {cocMode && cocFormType === 'ar1' ? (
                <p className="text-xs text-teal-800 font-medium">If this difficulty has got <strong>more frequent</strong> since your last form, select a higher frequency than before — even if it was already a problem. The increase in frequency is exactly what the AR1 wants to capture.</p>
              ) : cocMode ? (
                <p className="text-xs text-teal-800 font-medium">Answer based on how things are <strong>now</strong>, not how they were when you last filled in the form. If something has got worse, reflect that here — more frequent means a stronger answer.</p>
              ) : (
                <p className="text-xs text-teal-800 font-medium">Always answer based on your worst days, not your best. PIP is assessed on whether you can do something <strong>reliably, safely, and repeatedly</strong> — if you can only manage on good days, that's not reliable. "Often" means more than half the time. "Always" means every time. Both carry significant weight with an assessor.</p>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 pb-8 pt-4 bg-white border-t border-stone-100 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
          <button onClick={handleContinue} className="w-full bg-teal-700 text-white py-4 rounded-2xl font-bold text-base hover:bg-teal-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ─── STEP 4: SUPPORT NEEDED ────────────────────────────────────────────────

  if (step === 4) {
    return (
      <div className="flex flex-col h-full bg-stone-50">
        <Header />
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="px-5 py-4 pb-32 space-y-4">
            <div className="bg-teal-700 rounded-2xl p-5 text-white">
              <p className="text-teal-300 text-[10px] font-bold uppercase tracking-widest mb-1">{questionLabel}</p>
              <h2 className="font-black text-lg leading-tight">Does anyone help you with this?</h2>
              <p className="text-teal-200 text-sm mt-1.5 leading-relaxed">Even needing someone nearby, or just to remind you, counts.</p>
            </div>

            {/* What you are scored on */}
            {pipQ && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setShowDescriptors(s => !s)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                >
                  <div>
                    <p className="text-sm font-bold text-stone-900">What you are scored on</p>
                    {liveDescriptor && (
                      <p className="text-xs text-teal-600 font-medium mt-0.5">Currently: Descriptor {liveDescriptor} · {livePoints}pts</p>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-stone-400">{showDescriptors ? '▲ Hide' : '▼ Show'}</span>
                </button>
                {showDescriptors && (
                  <div className="border-t border-stone-100">
                    {pipQ.descriptors.map(d => {
                      const isMatch = liveDescriptor === d.code;
                      return (
                        <div key={d.code} className={`flex items-start gap-3 px-4 py-3 border-b border-stone-50 last:border-0 transition-all ${isMatch ? 'bg-teal-50' : ''}`}>
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 transition-all ${isMatch ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-500'}`}>{d.code}</span>
                          <span className={`flex-1 text-xs leading-relaxed transition-all ${isMatch ? 'text-teal-900 font-semibold' : 'text-stone-600'}`}>{d.text}</span>
                          <span className={`text-xs font-bold shrink-0 mt-0.5 ${d.points === 0 ? 'text-stone-400' : 'text-teal-600'}`}>{d.points}pts</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              {config.supportOptions.map(opt => {
                const selected = answers.supportTypes.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleSupport(opt.id)}
                    className={`w-full flex items-start gap-3 px-4 py-4 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                      selected
                        ? 'bg-teal-50 border-teal-300 shadow-sm'
                        : 'bg-white border-stone-150 shadow-sm hover:border-stone-300'
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-colors ${
                      selected ? 'bg-teal-600 border-teal-600' : 'border-stone-300'
                    }`}>
                      {selected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${selected ? 'text-teal-900' : 'text-stone-900'}`}>{opt.title}</p>
                      <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{opt.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-teal-50 rounded-xl px-4 py-3 border border-teal-100">
              {cocMode && cocFormType === 'ar1' ? (
                <p className="text-xs text-teal-800 font-medium">If you now need <strong>more help</strong> than before — or need help for the first time — select it. Even a small increase in the support you need is relevant and should be declared on the AR1.</p>
              ) : cocMode ? (
                <p className="text-xs text-teal-800 font-medium">Select any support you need <strong>now</strong> — including things you've started needing since your last assessment. If someone has stepped in more, or you've had to start using an aid, that change matters.</p>
              ) : (
                <p className="text-xs text-teal-800 font-medium">If you need any help — even just someone being nearby for safety, reminding you, or stepping in occasionally — select it. Needing supervision or prompting counts just as much as needing physical help. Assessors look for whether you can do this <strong>alone, safely, and consistently</strong>. If the answer is no, that's relevant.</p>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 pb-8 pt-4 bg-white border-t border-stone-100 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
          <button onClick={handleContinue} className="w-full bg-teal-700 text-white py-4 rounded-2xl font-bold text-base hover:bg-teal-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ─── STEP 5: REAL-LIFE IMPACT ──────────────────────────────────────────────

  if (generating) {
    return (
      <GeneratingOverlay
        onSkip={() => navigateTo('q1_result')}
      />
    );
  }

  if (step === 5) {
    const charLimit = 500;
    return (
      <div className="flex flex-col h-full bg-stone-50">
        <Header />
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="px-5 py-4 pb-32 space-y-4">
            <div className="bg-teal-700 rounded-2xl p-5 text-white">
              <p className="text-teal-300 text-[10px] font-bold uppercase tracking-widest mb-1">{questionLabel}</p>
              <h2 className="font-black text-lg leading-tight">How does this really affect your life?</h2>
              <p className="text-teal-200 text-sm mt-1.5 leading-relaxed">Be specific — real examples make a real difference to your claim.</p>
            </div>

            {/* What you are scored on */}
            {pipQ && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setShowDescriptors(s => !s)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                >
                  <div>
                    <p className="text-sm font-bold text-stone-900">What you are scored on</p>
                    {liveDescriptor && (
                      <p className="text-xs text-teal-600 font-medium mt-0.5">Currently: Descriptor {liveDescriptor} · {livePoints}pts</p>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-stone-400">{showDescriptors ? '▲ Hide' : '▼ Show'}</span>
                </button>
                {showDescriptors && (
                  <div className="border-t border-stone-100">
                    {pipQ.descriptors.map(d => {
                      const isMatch = liveDescriptor === d.code;
                      return (
                        <div key={d.code} className={`flex items-start gap-3 px-4 py-3 border-b border-stone-50 last:border-0 transition-all ${isMatch ? 'bg-teal-50' : ''}`}>
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 transition-all ${isMatch ? 'bg-teal-600 text-white' : 'bg-stone-100 text-stone-500'}`}>{d.code}</span>
                          <span className={`flex-1 text-xs leading-relaxed transition-all ${isMatch ? 'text-teal-900 font-semibold' : 'text-stone-600'}`}>{d.text}</span>
                          <span className={`text-xs font-bold shrink-0 mt-0.5 ${d.points === 0 ? 'text-stone-400' : 'text-teal-600'}`}>{d.points}pts</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <p className="text-sm font-semibold text-stone-600 px-1">Select all that apply.</p>

            <div className="space-y-2">
              {config.impactOptions.map(opt => {
                const selected = answers.impacts.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleImpact(opt.id)}
                    className={`w-full flex items-start gap-3 px-4 py-4 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                      selected
                        ? 'bg-teal-50 border-teal-300 shadow-sm'
                        : 'bg-white border-stone-150 shadow-sm hover:border-stone-300'
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-colors ${
                      selected ? 'bg-teal-600 border-teal-600' : 'border-stone-300'
                    }`}>
                      {selected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${selected ? 'text-teal-900' : 'text-stone-900'}`}>{opt.title}</p>
                      <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{opt.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Optional detail */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <p className="text-sm font-bold text-stone-900 mb-1">Anything else? <span className="font-normal text-stone-400">(optional)</span></p>
              <p className="text-xs text-stone-500 mb-3">
                {cocMode && cocFormType === 'ar1'
                  ? 'Use this to describe a specific change — a new diagnosis, a recent incident, or something a doctor or carer has said. The more concrete the better.'
                  : cocMode
                    ? 'Add anything that shows how things are worse now — a recent incident, a new medication, something a professional has said, or a change in your daily routine.'
                    : 'PIPpal writes the answer for you using what you\'ve told us. Add anything specific you want included — a particular incident, a doctor\'s comment, or something that happens regularly.'}
              </p>
              <textarea
                value={answers.additionalDetail}
                onChange={e => setAnswers(prev => ({ ...prev, additionalDetail: e.target.value.slice(0, charLimit) }))}
                placeholder={
                  cocMode && cocFormType === 'ar1'
                    ? 'e.g. Since my last assessment my consultant increased my medication. I now need my partner to help me every morning where before I could manage alone.'
                    : cocMode
                      ? 'e.g. My pain has increased significantly since my last form. My GP referred me to a specialist in January — I wasn\'t doing that before.'
                      : 'e.g. Last week I left the hob on twice. My GP told me it\'s not safe for me to cook unsupervised.'
                }
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-teal-400 focus:border-teal-400 resize-none"
                rows={3}
              />
              <p className="text-right text-xs text-stone-400 mt-1">{answers.additionalDetail.length}/{charLimit}</p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-8 pt-4 bg-white border-t border-stone-100 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
          <button onClick={handleContinue} disabled={generating} className="w-full bg-teal-700 text-white py-4 rounded-2xl font-bold text-base hover:bg-teal-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70">
            {generating ? (
              <>
                <div className="flex gap-1">
                  {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay:`${i*150}ms`}} />)}
                </div>
                Building your answer...
              </>
            ) : (
              <>See my result <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
