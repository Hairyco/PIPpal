import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, Info, CheckCircle2, Circle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from './AppContext';
import { getQuestionFlow, FlowAnswers, FrequencyLevel } from '../data/questionFlowData';
import { PIP_QUESTIONS } from '../pipQuestions';

type Step = 1 | 2 | 3 | 4 | 5;

const FREQUENCIES: { id: FrequencyLevel; label: string; sublabel: string }[] = [
  { id: 'never',     label: 'Never',     sublabel: '' },
  { id: 'rarely',    label: 'Rarely',    sublabel: 'Less than 1 day a week' },
  { id: 'sometimes', label: 'Sometimes', sublabel: '1–3 days a week' },
  { id: 'often',     label: 'Often',     sublabel: '4–6 days a week' },
  { id: 'most_days', label: 'Most days', sublabel: '7 days a week' },
];

export function QuestionFlow() {
  const { selectedQuestionId, navigateTo, goBack, saveAnswer, setQ1Result, medProfile, setAssistantQuestion } = useAppContext();
  const questionId = selectedQuestionId || 'q1';
  const config = getQuestionFlow(questionId);
  const pipQ = PIP_QUESTIONS.find(q => q.id === questionId);

  const [step, setStep] = useState<Step>(1);
  const [showExplained, setShowExplained] = useState(true);
  const [showDescriptors, setShowDescriptors] = useState(false);
  const [openHelpIdx, setOpenHelpIdx] = useState<number | null>(null);
  const [showFullExample, setShowFullExample] = useState(false);
  const [personalExample, setPersonalExample] = useState<string | null>(null);
  const [personalExplainer, setPersonalExplainer] = useState<string | null>(null);
  const [loadingExample, setLoadingExample] = useState(false);
  const [answers, setAnswers] = useState<FlowAnswers>({
    selectedDifficulties: [],
    frequencies: {},
    supportTypes: [],
    impacts: [],
    additionalDetail: '',
  });

  useEffect(() => {
    if (!medProfile?.conditions?.length || !config) return;
    const conditions = medProfile.conditions.map((c: any) => c.name).join(', ');
    console.log('[PIPpal] Personalising for conditions:', conditions);

    // Personalised example answer
    setLoadingExample(true);
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Write a 2-3 sentence first-person example answer for PIP activity: "${config?.title}". The person has: ${conditions}. Show how those exact conditions affect this activity on worst days. Include frequency and real impact. Start with "I". Return ONLY the example.`,
        conversationHistory: [],
        medProfile: { conditions: medProfile.conditions },
      }),
    })
      .then(r => r.json())
      .then(d => {
        console.log('[PIPpal] Example API response:', d);
        if (d.reply) setPersonalExample(d.reply.trim());
      })
      .catch(e => console.error('[PIPpal] Example API error:', e))
      .finally(() => setLoadingExample(false));

    // Personalised explainer
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Rewrite this PIP question explainer for someone with: ${conditions}. Original: "${config.explained}". Rules: Under 60 words. Reference their conditions by name. Warm plain English. Return ONLY the rewritten text.`,
        conversationHistory: [],
        medProfile: { conditions: medProfile.conditions },
      }),
    })
      .then(r => r.json())
      .then(d => {
        console.log('[PIPpal] Explainer API response:', d);
        if (d.reply) setPersonalExplainer(d.reply.trim());
      })
      .catch(e => console.error('[PIPpal] Explainer API error:', e));
  }, [questionId, medProfile.conditions.length]);

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
      finishQuestion();
    } else {
      // Skip step 3 if no difficulties selected
      if (step === 2 && totalDifficulties === 0) {
        goToStep(4);
      } else {
        goToStep((step + 1) as Step);
      }
    }
  }

  // ─── FINISH ────────────────────────────────────────────────────────────────

  function finishQuestion() {
    const descriptor = config!.calculateDescriptor(answers);
    saveAnswer(questionId, `Descriptor ${descriptor}`);

    // Build a result for ResultCard
    const d = pipQ?.descriptors.find(d => d.code === descriptor);
    setQ1Result({
      descriptor,
      points: d?.points ?? 0,
      label: d?.text ?? '',
      text: buildDraftText(descriptor),
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
          {step > 1 && totalDifficulties > 0 && (
            <span className="shrink-0 text-[11px] font-bold text-white bg-teal-600 rounded-full px-2.5 py-1">
              {totalDifficulties} selected
            </span>
          )}
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
          <div className="px-5 py-5 space-y-4 pb-32">
            <QuestionCard />

            {/* This question explained — always expanded */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-bold text-amber-900 text-sm">This question explained</span>
                </div>
              </div>
              <p className="px-4 py-4 text-sm text-amber-800 leading-relaxed">
                {personalExplainer || config.explained}
              </p>
            </div>

            {/* Ask for more help — inline expand, no assistant */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">Ask for more help</p>
              <div className="flex flex-wrap gap-2">
                {config.helpQuestions.map((q, i) => (
                  <button
                    key={q}
                    onClick={() => setOpenHelpIdx(openHelpIdx === i ? null : i)}
                    className={`text-xs font-medium rounded-full px-3 py-1.5 border transition-all active:scale-95 ${openHelpIdx === i ? 'bg-teal-600 text-white border-teal-600' : 'text-teal-700 bg-teal-50 border-teal-100 hover:bg-teal-100'}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
              {openHelpIdx !== null && pipQ?.conditionExplainers[openHelpIdx] && (
                <div className="mt-3 pt-3 border-t border-stone-100">
                  <p className="text-sm text-stone-700 leading-relaxed">{pipQ.conditionExplainers[openHelpIdx].text}</p>
                  {pipQ.conditionExplainers[openHelpIdx].example && (
                    <p className="text-xs text-stone-400 italic mt-1">"{pipQ.conditionExplainers[openHelpIdx].example}"</p>
                  )}
                </div>
              )}
            </div>

            {/* Example answer */}
            <div className="bg-stone-50 rounded-2xl border border-stone-100 p-4">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">
                {personalExample ? 'Example based on your conditions' : 'Example answer'}
              </p>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                  <span className="text-teal-700 text-xs font-bold">
                    {personalExample
                      ? medProfile?.conditions?.[0]?.name?.[0]?.toUpperCase() || 'Y'
                      : config.exampleAnswer.name[0]}
                  </span>
                </div>
                <span className="text-xs font-semibold text-stone-700">
                  {personalExample
                    ? medProfile.conditions.map((c: any) => c.name).join(' · ')
                    : `${config.exampleAnswer.name}, ${config.exampleAnswer.age} · ${config.exampleAnswer.label}`}
                </span>
              </div>
              {loadingExample ? (
                <div className="space-y-1.5">
                  <div className="h-3 bg-stone-200 rounded animate-pulse w-full" />
                  <div className="h-3 bg-stone-200 rounded animate-pulse w-4/5" />
                  <div className="h-3 bg-stone-200 rounded animate-pulse w-3/5" />
                </div>
              ) : (
                <p className={`text-sm text-stone-600 leading-relaxed italic ${!showFullExample ? 'line-clamp-3' : ''}`}>
                  "{personalExample ?? config.exampleAnswer.quote}"
                </p>
              )}
              {!loadingExample && (
                <button onClick={() => setShowFullExample(!showFullExample)} className="text-xs text-teal-600 font-semibold mt-1">
                  {showFullExample ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Start button */}
        <div className="px-5 pb-8 pt-4 bg-white border-t border-stone-100 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
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
              <h2 className="font-black text-lg leading-tight">What makes this hard for you?</h2>
              <p className="text-teal-200 text-sm mt-1.5 leading-relaxed">Pick everything that rings true — even on your worst days.</p>
            </div>

            {/* What you are scored on — descriptors */}
            {pipQ && (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setShowDescriptors(s => !s)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                >
                  <p className="text-sm font-bold text-stone-900">What you are scored on</p>
                  <span className="text-xs font-semibold text-stone-400">{showDescriptors ? '▲ Hide' : '▼ Show'}</span>
                </button>
                {showDescriptors && (
                  <div className="border-t border-stone-100">
                    {pipQ.descriptors.map(d => (
                      <div key={d.code} className="flex items-start gap-3 px-4 py-3 border-b border-stone-50 last:border-0">
                        <span className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center shrink-0 text-[10px] font-bold text-stone-500 mt-0.5">{d.code}</span>
                        <span className="flex-1 text-xs text-stone-600 leading-relaxed">{d.text}</span>
                        <span className={`text-xs font-bold shrink-0 mt-0.5 ${d.points === 0 ? 'text-stone-400' : d.points >= 8 ? 'text-teal-600' : d.points >= 4 ? 'text-blue-600' : 'text-amber-600'}`}>{d.points}pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {config.difficultyCategories.map(cat => (
              <div key={cat.id}>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wide px-1 mb-2">{cat.name}</p>
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
              <p className="text-teal-200 text-sm mt-1.5 leading-relaxed">Think about the past few months. Be honest — there's no wrong answer here.</p>
            </div>

            {/* Frequency grid */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              {/* Header row */}
              <div className="grid border-b border-stone-100" style={{ gridTemplateColumns: '1fr repeat(5, 56px)' }}>
                <div className="p-3" />
                {FREQUENCIES.map(f => (
                  <div key={f.id} className="p-2 text-center border-l border-stone-50">
                    <p className="text-[10px] font-bold text-stone-500 leading-tight">{f.label}</p>
                    {f.sublabel && <p className="text-[9px] text-stone-300 leading-tight mt-0.5 hidden md:block">{f.sublabel}</p>}
                  </div>
                ))}
              </div>

              {/* Difficulty rows */}
              {selectedDiffs.map((diff, i) => (
                <div key={diff.id} className={`grid items-center ${i < selectedDiffs.length - 1 ? 'border-b border-stone-50' : ''}`} style={{ gridTemplateColumns: '1fr repeat(5, 56px)' }}>
                  <p className="px-3 py-3 text-xs text-stone-700 font-medium leading-snug">{diff.text}</p>
                  {FREQUENCIES.map(f => {
                    const selected = answers.frequencies[diff.id] === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setAnswers(prev => ({ ...prev, frequencies: { ...prev.frequencies, [diff.id]: f.id } }))}
                        className="flex items-center justify-center py-3 border-l border-stone-50 hover:bg-teal-50 transition-colors"
                      >
                        {selected
                          ? <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>
                          : <div className="w-5 h-5 rounded-full border-2 border-stone-300" />
                        }
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="bg-teal-50 rounded-xl px-4 py-3 border border-teal-100">
              <p className="text-xs text-teal-800 font-medium">💡 Think about your worst days, not your best. That's what matters for PIP.</p>
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
              <p className="text-xs text-teal-800 font-medium">💡 It's okay if this varies day to day. Choose what's true on most days.</p>
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
              <p className="text-sm font-bold text-stone-900 mb-1">Add more detail <span className="font-normal text-stone-400">(optional)</span></p>
              <p className="text-xs text-stone-500 mb-3">Anything else you want the assessor to understand?</p>
              <textarea
                value={answers.additionalDetail}
                onChange={e => setAnswers(prev => ({ ...prev, additionalDetail: e.target.value.slice(0, charLimit) }))}
                placeholder={`e.g. I often feel anxious using the ${config.title.toLowerCase().split('?')[0].replace('can you ', '')} and worry I'll forget something.`}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-teal-400 focus:border-teal-400 resize-none"
                rows={3}
              />
              <p className="text-right text-xs text-stone-400 mt-1">{answers.additionalDetail.length}/{charLimit}</p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-8 pt-4 bg-white border-t border-stone-100 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
          <button onClick={handleContinue} className="w-full bg-teal-700 text-white py-4 rounded-2xl font-bold text-base hover:bg-teal-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            See my result <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
