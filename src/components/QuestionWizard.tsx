import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight } from 'lucide-react';
import { useAppContext } from './AppContext';
import { getQuestion, PIP_QUESTIONS } from '../pipQuestions';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ────────────────────────────────────────────────────────────────────

interface WizardAnswer {
  difficulties: string[];
  frequencies: Record<string, string>; // difficulty -> frequency
  supportNeeded: string[];
  realLifeImpact: string[];
  extraDetail: string;
}

const FREQUENCIES = [
  { key: 'never', label: 'Never', sub: 'Less than\n1 day a week' },
  { key: 'rarely', label: 'Rarely', sub: '1–3 days\na week' },
  { key: 'sometimes', label: 'Sometimes', sub: '4–6 days\na week' },
  { key: 'often', label: 'Often', sub: '7 days\na week' },
  { key: 'most', label: 'Most days', sub: '7 days\na week' },
];

// Per-question difficulty options by category
const DIFFICULTY_OPTIONS: Record<string, { category: string; icon: string; items: string[] }[]> = {
  q1: [
    { category: 'Mental Health', icon: '🧠', items: ['I get overwhelmed cooking', 'I avoid using the hob', 'I forget food is cooking', 'I lose concentration', 'I need reminders or encouragement', 'I get anxious or panicky cooking alone'] },
    { category: 'Physical', icon: '💪', items: ['Standing causes pain or fatigue', 'I struggle chopping ingredients', 'Weak grip or tremors', 'Balance problems', 'I need to sit while preparing food'] },
    { category: 'Cognitive / Neurodivergent', icon: '⚡', items: ['I forget steps', 'I get distracted easily', 'I struggle planning meals', 'I need supervision for safety'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q2: [
    { category: 'Physical', icon: '💪', items: ['I struggle using cutlery', 'I drop cups or spill drinks', 'I cannot cut up food', 'I choke or have swallowing difficulties', 'Weak grip means I need adapted equipment'] },
    { category: 'Mental Health', icon: '🧠', items: ['I forget to eat', 'I need prompting to eat meals', 'Mealtimes cause me distress'] },
    { category: 'Neurodivergent', icon: '⚡', items: ['Textures or smells put me off eating', 'I need routine to eat', 'I get distracted and miss meals'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  default: [
    { category: 'Physical', icon: '💪', items: ['Pain or discomfort limits me', 'Fatigue or exhaustion affects me', 'I have mobility or strength difficulties'] },
    { category: 'Mental Health', icon: '🧠', items: ['Anxiety or distress affects me', 'I need prompting or reminders', 'I avoid this activity'] },
    { category: 'Cognitive', icon: '⚡', items: ['I struggle with concentration', 'I forget steps or instructions', 'I need supervision to stay safe'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
};

const SUPPORT_OPTIONS: Record<string, { icon: string; label: string; sub: string }[]> = {
  q1: [
    { icon: '🔔', label: 'I need reminders or encouragement', sub: 'Someone has to remind or encourage me to cook or eat.' },
    { icon: '🛡️', label: 'I need supervision for safety', sub: 'Someone needs to be nearby to make sure I stay safe.' },
    { icon: '🍴', label: 'I get help with parts of cooking', sub: 'Someone helps me with tasks like chopping, using the hob, etc.' },
    { icon: '🍽️', label: 'I get all my meals prepared by someone else', sub: 'I cannot prepare or cook any meals myself.' },
    { icon: '✅', label: "I don't need help", sub: 'I can prepare and cook without any help.' },
  ],
  default: [
    { icon: '🔔', label: 'I need reminders or prompting', sub: 'Someone reminds or encourages me.' },
    { icon: '🛡️', label: 'I need supervision for safety', sub: 'Someone needs to be nearby.' },
    { icon: '🤝', label: 'I need physical help', sub: 'Someone assists me directly.' },
    { icon: '👤', label: 'Someone does this entirely for me', sub: 'I cannot manage this activity at all.' },
    { icon: '✅', label: "I don't need help", sub: 'I can manage without any help.' },
  ],
};

const REAL_LIFE_OPTIONS: Record<string, { icon: string; label: string; sub: string }[]> = {
  q1: [
    { icon: '🚫', label: 'I avoid cooking', sub: 'I avoid using the hob/oven or making meals.' },
    { icon: '🥡', label: 'I rely on ready meals or takeaways', sub: "It's easier or safer for me." },
    { icon: '⏱️', label: 'It takes me much longer', sub: 'I need breaks or it takes far longer than others.' },
    { icon: '😴', label: 'I become exhausted', sub: 'It leaves me very tired or drained.' },
    { icon: '⚠️', label: "I've had accidents", sub: 'Burns, leaving the hob on, or other incidents.' },
    { icon: '🍽️', label: "I can't always eat properly", sub: "I skip meals or don't eat enough." },
  ],
  default: [
    { icon: '🚫', label: 'I avoid this activity', sub: 'I avoid it when I can.' },
    { icon: '⏱️', label: 'It takes me much longer', sub: 'It takes far longer than for most people.' },
    { icon: '😴', label: 'I become exhausted afterwards', sub: 'It leaves me very tired or drained.' },
    { icon: '😰', label: 'It causes me distress', sub: 'Anxiety, pain or overwhelm during or after.' },
    { icon: '⚠️', label: "I've had accidents or near misses", sub: 'Incidents due to my condition.' },
  ],
};

// ── Main Component ───────────────────────────────────────────────────────────

export function QuestionWizard() {
  const { selectedQuestionId, navigateTo, goBack, medProfile, setDescriptorHint, setQ1Result } = useAppContext();
  const qId = selectedQuestionId || 'q1';
  const question = getQuestion(qId);
  if (!question) return null;

  const isQ1 = qId === 'q1';
  const qNum = isQ1 ? 3 : (question.num + 2);

  const difficultyOptions = DIFFICULTY_OPTIONS[qId] || DIFFICULTY_OPTIONS.default;
  const supportOpts = SUPPORT_OPTIONS[qId] || SUPPORT_OPTIONS.default;
  const realLifeOpts = REAL_LIFE_OPTIONS[qId] || REAL_LIFE_OPTIONS.default;

  const [step, setStep] = useState(1);
  const [customDifficulty, setCustomDifficulty] = useState('');
  const [answers, setAnswers] = useState<WizardAnswer>({
    difficulties: [],
    frequencies: {},
    supportNeeded: [],
    realLifeImpact: [],
    extraDetail: '',
  });

  const totalSteps = 6;

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const toggleDifficulty = (item: string) => {
    setAnswers(prev => ({
      ...prev,
      difficulties: prev.difficulties.includes(item)
        ? prev.difficulties.filter(d => d !== item)
        : [...prev.difficulties, item],
    }));
  };

  const setFrequency = (difficulty: string, freq: string) => {
    setAnswers(prev => ({ ...prev, frequencies: { ...prev.frequencies, [difficulty]: freq } }));
  };

  const toggleSupport = (item: string) => {
    if (item === "I don't need help" || item === "I don't need help") {
      setAnswers(prev => ({ ...prev, supportNeeded: [item] }));
    } else {
      setAnswers(prev => ({
        ...prev,
        supportNeeded: prev.supportNeeded.includes(item)
          ? prev.supportNeeded.filter(s => s !== item)
          : prev.supportNeeded.filter(s => s !== "I don't need help").concat(item),
      }));
    }
  };

  const toggleImpact = (item: string) => {
    setAnswers(prev => ({
      ...prev,
      realLifeImpact: prev.realLifeImpact.includes(item)
        ? prev.realLifeImpact.filter(i => i !== item)
        : [...prev.realLifeImpact, item],
    }));
  };

  const selectedCount = answers.difficulties.length;

  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) return answers.difficulties.length > 0 || customDifficulty.trim().length > 0;
    if (step === 3) return true; // optional
    if (step === 4) return answers.supportNeeded.length > 0;
    if (step === 5) return answers.realLifeImpact.length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(s => s + 1);
    } else {
      // Step 6 is the descriptor selection — navigate to chat
      sessionStorage.setItem('pippal_wizard_answers', JSON.stringify(answers));
      navigateTo('q1_chat');
    }
  };

  const handleBack = () => {
    if (step === 1) {
      goBack();
    } else {
      setStep(s => s - 1);
    }
  };

  const handleDescriptorTap = (code: string) => {
    sessionStorage.setItem('pippal_descriptor_hint', code);
    sessionStorage.setItem('pippal_wizard_answers', JSON.stringify(answers));
    setTimeout(() => sessionStorage.removeItem('pippal_descriptor_hint'), 500);
    setQ1Result(null);
    navigateTo('q1_chat');
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  const progressWidth = `${(step / totalSteps) * 100}%`;

  return (
    <div className="flex flex-col h-full bg-stone-50">

      {/* Header */}
      <div className="bg-white border-b border-stone-100 px-5 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={handleBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">STEP {step} OF {totalSteps}</p>
            <h1 className="font-bold text-stone-900 text-base leading-tight">
              {step === 1 && `Question ${qNum}`}
              {step === 2 && 'Your difficulties'}
              {step === 3 && 'How often do these happen?'}
              {step === 4 && 'Do you need help or supervision?'}
              {step === 5 && 'Real-life impact'}
              {step === 6 && 'How you are scored'}
            </h1>
          </div>
          {step > 1 && selectedCount > 0 && (
            <span className="text-xs font-bold text-white bg-teal-600 px-2.5 py-1 rounded-full">{selectedCount} selected</span>
          )}
        </div>
        {/* Progress bar */}
        <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
          <motion.div className="bg-teal-600 h-full rounded-full" animate={{ width: progressWidth }} transition={{ duration: 0.3 }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-28">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

            {/* ── STEP 1: Question explained ── */}
            {step === 1 && (
              <div className="space-y-4 px-5 pt-5">
                {/* Hero card */}
                <div className="bg-teal-700 rounded-2xl p-5 text-white">
                  <p className="text-[11px] font-bold text-teal-300 uppercase tracking-widest mb-2">DAILY LIVING · ACTIVITY {question.num}</p>
                  <h2 className="font-bold text-xl leading-snug mb-2">{question.headline}</h2>
                  <p className="text-teal-100 text-sm leading-relaxed">{question.subtext}</p>
                </div>

                {/* Explained */}
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-600 text-sm">ⓘ</span>
                    <h3 className="font-bold text-amber-900 text-sm">This question explained</h3>
                  </div>
                  <p className="text-sm text-amber-800 leading-relaxed">{question.defaultExplainer}</p>
                </div>

                {/* Ask for more help pills */}
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
                  <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3">ASK FOR MORE HELP</p>
                  <div className="flex flex-wrap gap-2">
                    {question.conditionExplainers.slice(0, 5).map((ce, i) => (
                      <button key={i} className="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-full hover:bg-teal-100 active:scale-95 transition-all">
                        How does this apply to {ce.conditions[0]}?
                      </button>
                    ))}
                  </div>
                </div>

                {/* Example answer */}
                {question.conditionExplainers[0]?.example && (
                  <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center shrink-0">
                        <span className="text-[10px]">👤</span>
                      </div>
                      <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">EXAMPLE ANSWER</p>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed italic">"{question.conditionExplainers[0].example}"</p>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 2: Difficulties ── */}
            {step === 2 && (
              <div className="px-5 pt-5 space-y-4">
                {/* Hero */}
                <div className="bg-teal-700 rounded-2xl p-4 text-white">
                  <p className="text-[11px] font-bold text-teal-300 uppercase tracking-widest mb-1">DAILY LIVING · ACTIVITY {question.num}</p>
                  <h2 className="font-bold text-lg">Which difficulties apply to you?</h2>
                  <p className="text-teal-100 text-sm mt-1">Select anything that applies — even if it only happens on bad days.</p>
                </div>

                {/* Categories */}
                {difficultyOptions.map((cat, ci) => (
                  <div key={ci} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-50">
                      <span>{cat.icon}</span>
                      <h3 className="font-bold text-stone-900 text-sm">{cat.category}</h3>
                    </div>
                    <div className="divide-y divide-stone-50">
                      {cat.items.map((item, ii) => {
                        const selected = answers.difficulties.includes(item);
                        return (
                          <button key={ii} onClick={() => toggleDifficulty(item)}
                            className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-all active:scale-[0.99] ${selected ? 'bg-teal-50' : 'hover:bg-stone-50'}`}
                          >
                            <span className={`text-sm font-medium ${selected ? 'text-teal-800' : 'text-stone-700'}`}>{item}</span>
                            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-all ${selected ? 'bg-teal-600 border-teal-600' : 'border-stone-300'}`}>
                              {selected && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </button>
                        );
                      })}
                      {cat.category === 'Something else?' && (
                        <div className="px-4 py-3">
                          <input
                            type="text"
                            value={customDifficulty}
                            onChange={e => setCustomDifficulty(e.target.value)}
                            placeholder="e.g. I burn myself often..."
                            className="w-full text-sm text-stone-600 bg-transparent border-none outline-none placeholder-stone-300"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── STEP 3: Frequency ── */}
            {step === 3 && (
              <div className="px-5 pt-5 space-y-4">
                <div className="bg-teal-700 rounded-2xl p-4 text-white">
                  <p className="text-[11px] font-bold text-teal-300 uppercase tracking-widest mb-1">DAILY LIVING · ACTIVITY {question.num}</p>
                  <h2 className="font-bold text-lg">How often do these difficulties happen?</h2>
                  <p className="text-teal-100 text-sm mt-1">Think about the last few months. Choose how often each difficulty happens for you.</p>
                </div>

                {answers.difficulties.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-stone-100 p-5 text-center">
                    <p className="text-stone-400 text-sm">No difficulties selected — tap Back to add some.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                    {/* Header row */}
                    <div className="grid grid-cols-6 border-b border-stone-100 bg-stone-50">
                      <div className="col-span-2 px-3 py-2" />
                      {FREQUENCIES.map(f => (
                        <div key={f.key} className="text-center py-2 px-1">
                          <p className="text-[9px] font-bold text-stone-500 uppercase">{f.label}</p>
                        </div>
                      ))}
                    </div>
                    {/* Rows */}
                    {answers.difficulties.map((diff, di) => (
                      <div key={di} className={`grid grid-cols-6 items-center ${di > 0 ? 'border-t border-stone-50' : ''}`}>
                        <div className="col-span-2 px-3 py-3">
                          <p className="text-xs text-stone-600 leading-snug font-medium">{diff}</p>
                        </div>
                        {FREQUENCIES.map(f => (
                          <button key={f.key} onClick={() => setFrequency(diff, f.key)}
                            className="flex items-center justify-center py-3"
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${answers.frequencies[diff] === f.key ? 'border-teal-600 bg-teal-600' : 'border-stone-300'}`}>
                              {answers.frequencies[diff] === f.key && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-teal-50 rounded-xl p-3 flex items-start gap-2 border border-teal-100">
                  <span className="text-teal-500 text-sm shrink-0">💡</span>
                  <p className="text-xs text-teal-700 leading-relaxed">There's no right or wrong answer. Choose what's true for most days.</p>
                </div>
              </div>
            )}

            {/* ── STEP 4: Support needed ── */}
            {step === 4 && (
              <div className="px-5 pt-5 space-y-4">
                <div className="bg-teal-700 rounded-2xl p-4 text-white">
                  <p className="text-[11px] font-bold text-teal-300 uppercase tracking-widest mb-1">DAILY LIVING · ACTIVITY {question.num}</p>
                  <h2 className="font-bold text-lg">Do you need help or supervision?</h2>
                  <p className="text-teal-100 text-sm mt-1">Think about what support you need for this activity.</p>
                </div>

                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden divide-y divide-stone-50">
                  {supportOpts.map((opt, i) => {
                    const selected = answers.supportNeeded.includes(opt.label);
                    return (
                      <button key={i} onClick={() => toggleSupport(opt.label)}
                        className={`w-full flex items-start gap-3 px-4 py-4 text-left transition-all active:scale-[0.99] ${selected ? 'bg-teal-50' : 'hover:bg-stone-50'}`}
                      >
                        <span className="text-lg shrink-0 mt-0.5">{opt.icon}</span>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${selected ? 'text-teal-900' : 'text-stone-800'}`}>{opt.label}</p>
                          <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{opt.sub}</p>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${selected ? 'bg-teal-600 border-teal-600' : 'border-stone-300'}`}>
                          {selected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="bg-teal-50 rounded-xl p-3 flex items-start gap-2 border border-teal-100">
                  <span className="text-sm shrink-0">💡</span>
                  <p className="text-xs text-teal-700 leading-relaxed">It's okay if your needs change from day to day.</p>
                </div>
              </div>
            )}

            {/* ── STEP 5: Real-life impact ── */}
            {step === 5 && (
              <div className="px-5 pt-5 space-y-4">
                <div className="bg-teal-700 rounded-2xl p-4 text-white">
                  <p className="text-[11px] font-bold text-teal-300 uppercase tracking-widest mb-1">DAILY LIVING · ACTIVITY {question.num}</p>
                  <h2 className="font-bold text-lg">How does this affect you in real life?</h2>
                  <p className="text-teal-100 text-sm mt-1">Tell us what happens because of your difficulties.</p>
                </div>

                <p className="text-sm font-semibold text-stone-700 px-1">Select all that apply.</p>

                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden divide-y divide-stone-50">
                  {realLifeOpts.map((opt, i) => {
                    const selected = answers.realLifeImpact.includes(opt.label);
                    return (
                      <button key={i} onClick={() => toggleImpact(opt.label)}
                        className={`w-full flex items-start gap-3 px-4 py-4 text-left transition-all active:scale-[0.99] ${selected ? 'bg-teal-50' : 'hover:bg-stone-50'}`}
                      >
                        <span className="text-lg shrink-0 mt-0.5">{opt.icon}</span>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${selected ? 'text-teal-900' : 'text-stone-800'}`}>{opt.label}</p>
                          <p className="text-xs text-stone-500 mt-0.5">{opt.sub}</p>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${selected ? 'bg-teal-600 border-teal-600' : 'border-stone-300'}`}>
                          {selected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Add more detail */}
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
                  <p className="text-sm font-semibold text-stone-800 mb-2">Add more detail (optional)</p>
                  <p className="text-xs text-stone-500 mb-3">Anything else you want the assessor to understand?</p>
                  <textarea
                    value={answers.extraDetail}
                    onChange={e => setAnswers(prev => ({ ...prev, extraDetail: e.target.value }))}
                    placeholder="e.g. I often feel anxious using the hob and worry I'll forget it's on."
                    maxLength={500}
                    rows={3}
                    className="w-full text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl p-3 resize-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400"
                  />
                  <p className="text-[11px] text-stone-400 text-right mt-1">{answers.extraDetail.length}/500</p>
                </div>
              </div>
            )}

            {/* ── STEP 6: Descriptors ── */}
            {step === 6 && (
              <div className="px-5 pt-5 space-y-4">
                <div className="bg-teal-700 rounded-2xl p-4 text-white">
                  <p className="text-[11px] font-bold text-teal-300 uppercase tracking-widest mb-1">DAILY LIVING · ACTIVITY {question.num}</p>
                  <h2 className="font-bold text-lg">How you are scored</h2>
                  <p className="text-teal-100 text-sm mt-1">DWP matches your situation to one of these statements. Tap the one that sounds most like you to start your answer.</p>
                </div>

                {/* Summary of what they said */}
                {(answers.difficulties.length > 0 || answers.supportNeeded.length > 0) && (
                  <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-2">Based on what you've told us</p>
                    {answers.difficulties.length > 0 && (
                      <p className="text-xs text-stone-600 mb-1">You experience: <span className="font-semibold text-stone-800">{answers.difficulties.slice(0, 3).join(', ')}{answers.difficulties.length > 3 ? ` and ${answers.difficulties.length - 3} more` : ''}</span></p>
                    )}
                    {answers.supportNeeded.length > 0 && answers.supportNeeded[0] !== "I don't need help" && (
                      <p className="text-xs text-stone-600">Support needed: <span className="font-semibold text-stone-800">{answers.supportNeeded[0]}</span></p>
                    )}
                  </div>
                )}

                {/* Teal CTA banner */}
                <div className="bg-teal-50 border border-teal-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <span className="text-lg">👆</span>
                  <div>
                    <p className="text-sm font-bold text-teal-900">Tap the one that sounds most like you</p>
                    <p className="text-xs text-teal-700 mt-0.5">PIPpal will open and guide your answer around your choice.</p>
                  </div>
                </div>

                {/* Descriptor options */}
                <div className="space-y-2">
                  {question.descriptors.map((d) => (
                    <button
                      key={d.code}
                      onClick={() => handleDescriptorTap(d.code)}
                      className="w-full flex gap-3 text-sm text-left rounded-2xl px-4 py-4 bg-white border-2 border-stone-100 hover:border-teal-300 hover:bg-teal-50 active:scale-[0.98] transition-all group shadow-sm"
                    >
                      <div className="w-7 h-7 rounded-full bg-stone-100 group-hover:bg-teal-100 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                        <span className="font-black text-xs text-stone-500 group-hover:text-teal-700 transition-colors">{d.code}</span>
                      </div>
                      <div className="flex-1 text-stone-600 leading-snug group-hover:text-stone-900 transition-colors">{d.text}</div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`font-bold text-xs ${d.points === 0 ? 'text-stone-400' : d.points >= 8 ? 'text-teal-600' : d.points >= 4 ? 'text-blue-600' : 'text-amber-600'}`}>
                          {d.points}pts
                        </span>
                        <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-teal-500 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => navigateTo('q1_chat')}
                  className="w-full text-center text-xs text-stone-400 hover:text-teal-600 py-2 transition-colors"
                >
                  Not sure which applies? Start the chat and PIPpal will help →
                </button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav — only show for steps 1-5 */}
      {step < 6 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 px-5 py-4 flex gap-3 max-w-2xl mx-auto">
          {step > 1 && (
            <button onClick={handleBack} className="flex items-center gap-2 px-5 py-3.5 rounded-xl border-2 border-stone-200 text-stone-600 font-semibold text-sm hover:bg-stone-50 active:scale-[0.98] transition-all">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 flex items-center justify-center gap-2 bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-teal-800 active:scale-[0.98] transition-all disabled:opacity-40 shadow-sm"
          >
            {step === 5 ? 'See how you score' : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
