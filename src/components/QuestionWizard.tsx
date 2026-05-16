import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
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
    { category: 'Mental Health', icon: '🧠', items: ['I get overwhelmed or panicky in the kitchen', 'I avoid using the hob or oven', 'I forget food is cooking and leave it on', 'I lose concentration mid-cook', 'I need someone to remind me to eat', 'I get anxious cooking alone'] },
    { category: 'Physical', icon: '💪', items: ['Standing at the cooker causes pain', 'I struggle to grip or lift pans', 'Tremors or weak hands make it unsafe', 'I need to sit down to cook', 'Fatigue stops me finishing meals'] },
    { category: 'Cognitive / Neurodivergent', icon: '⚡', items: ['I forget the steps involved in cooking', 'I get distracted and things go wrong', 'I struggle to plan what to cook', 'I need someone with me for safety'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q2: [
    { category: 'Physical', icon: '💪', items: ['I struggle to use cutlery', 'I drop cups or spill drinks regularly', 'I cannot cut up my own food', 'I choke or have swallowing difficulties', 'I need adapted cutlery or equipment'] },
    { category: 'Mental Health', icon: '🧠', items: ['I forget to eat without being reminded', 'I need prompting to get through meals', 'Eating causes me distress or anxiety'] },
    { category: 'Cognitive / Neurodivergent', icon: '⚡', items: ['Textures or smells make eating impossible', 'I get distracted and leave meals unfinished', 'I need a strict routine around food'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q3: [
    { category: 'Memory & Prompting', icon: '🧠', items: ['I forget to take my medication', 'I need reminders to manage my treatment', 'I have missed doses that caused harm', 'I cannot be trusted to manage it alone'] },
    { category: 'Physical', icon: '💪', items: ['I struggle to open packaging', 'I cannot administer injections or patches myself', 'My treatment takes significant time each day', 'I need help preparing equipment'] },
    { category: 'Mental Health', icon: '🌿', items: ['My condition affects my ability to engage with treatment', 'I need supervision when taking medication', 'Managing my treatment causes me distress'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q4: [
    { category: 'Physical', icon: '💪', items: ['I cannot get in or out of the bath or shower safely', 'I need to use a shower seat or grab rails', 'I cannot reach all parts of my body', 'Standing in the shower is too painful', 'Drying myself is difficult or impossible'] },
    { category: 'Mental Health', icon: '🧠', items: ['I go days without washing because of my condition', 'I need prompting to wash regularly', 'Washing causes me distress or anxiety'] },
    { category: 'Cognitive / Neurodivergent', icon: '⚡', items: ['Sensory issues with water or products', 'I need prompting through each step of washing', 'I forget to wash without reminders'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q5: [
    { category: 'Physical', icon: '💪', items: ['I cannot always get to the toilet in time', 'Getting on or off the toilet is difficult', 'I cannot clean myself properly afterwards', 'I have bladder or bowel accidents', 'I need aids or equipment to manage'] },
    { category: 'Bowel / Bladder', icon: '⚠️', items: ['Urgency means I cannot always make it', 'My condition is unpredictable day to day', 'I have to plan everything around toilet access', 'I manage a stoma or catheter'] },
    { category: 'Cognitive / Mental Health', icon: '🧠', items: ['I need prompting to use the toilet', 'I sometimes do not recognise the need to go', 'Psychological barriers affect my toilet use'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q6: [
    { category: 'Physical', icon: '💪', items: ['I cannot do up buttons or zips', 'Getting socks or shoes on is very difficult', 'Raising my arms to dress causes pain', 'Bending to dress my lower body is impossible', 'Fatigue means dressing wipes me out'] },
    { category: 'Mental Health', icon: '🧠', items: ['I need prompting to get dressed each day', 'Some days I cannot get dressed at all', 'Getting dressed causes me distress'] },
    { category: 'Cognitive / Neurodivergent', icon: '⚡', items: ['Certain fabrics cause sensory distress', 'I need help choosing appropriate clothing', 'I struggle with the steps involved in dressing'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q7: [
    { category: 'Speech & Processing', icon: '🗣️', items: ['I sometimes cannot speak at all', 'People struggle to understand me', 'I struggle to process what people say', 'I need extra time to respond in conversation', 'I need a communication aid'] },
    { category: 'Mental Health / Anxiety', icon: '🧠', items: ['Anxiety stops me being able to speak', 'I freeze or lose words when stressed', 'I need someone to speak on my behalf'] },
    { category: 'Neurodivergent', icon: '⚡', items: ['I find verbal communication exhausting', 'I misunderstand what people mean', 'I respond in ways others find inappropriate'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q8: [
    { category: 'Reading Difficulties', icon: '📖', items: ['I cannot read standard print', 'I need large print or audio formats', 'I misread things regularly', 'Reading takes me much longer than others', 'I need someone to read things to me'] },
    { category: 'Mental Health / Cognitive', icon: '🧠', items: ['Brain fog means I cannot take in what I read', 'I need to read things multiple times to understand', 'I need someone to explain letters and documents'] },
    { category: 'Neurodivergent', icon: '⚡', items: ['Dyslexia affects my reading significantly', 'I struggle with complex or formal language', 'Written information does not make sense to me'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q9: [
    { category: 'Anxiety / Mental Health', icon: '🧠', items: ['Social situations cause me panic or severe distress', 'I avoid all interactions with strangers', 'I need someone with me in any social situation', 'I cannot engage with people I do not know'] },
    { category: 'Neurodivergent', icon: '⚡', items: ['I misread social cues and situations', 'Group settings are overwhelming for me', 'I respond in ways that cause problems', 'Social interaction exhausts me'] },
    { category: 'Mental Health Conditions', icon: '🌿', items: ['I withdraw from all social contact', 'Paranoia affects my ability to engage with others', 'My condition makes social situations unsafe'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q10: [
    { category: 'Mental Health', icon: '🧠', items: ['I forget to pay bills and manage accounts', 'I make impulsive financial decisions I regret', 'Someone else manages my money for me', 'I cannot engage with money tasks on bad days'] },
    { category: 'Cognitive', icon: '⚡', items: ['Understanding the value of money is difficult', 'I am vulnerable to financial exploitation', 'I cannot budget reliably without help', 'I need someone to check my decisions'] },
    { category: 'Practical Difficulties', icon: '💳', items: ['Online banking is beyond me', 'I cannot manage direct debits or standing orders', 'I need support with any financial paperwork'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q11: [
    { category: 'Anxiety / Mental Health', icon: '🧠', items: ['I cannot leave the house alone', 'Travelling causes panic or overwhelming distress', 'I need someone with me whenever I go out', 'I can only travel on familiar routes I know well'] },
    { category: 'Navigation', icon: '🗺️', items: ['I get lost even on familiar routes', 'I cannot plan a journey to somewhere new', 'Unexpected changes to my route cause crisis', 'I need an orientation aid to travel'] },
    { category: 'Physical / Sensory', icon: '💪', items: ['Public transport is inaccessible for me', 'Sensory overwhelm on public transport stops me', 'I cannot travel alone due to safety risks'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  q12: [
    { category: 'Pain & Fatigue', icon: '💪', items: ['Pain stops me after a short distance', 'Fatigue means I cannot walk far reliably', 'I need to stop and rest frequently', 'I use a walking stick, frame or wheelchair', 'Walking the same distance again is impossible'] },
    { category: 'Breathlessness', icon: '🫁', items: ['I become breathless very quickly', 'My heart or breathing condition limits my walking', 'I cannot walk far without health risks'] },
    { category: 'Safety & Other', icon: '⚠️', items: ['I cannot walk outside alone safely', 'Falls risk limits how far I can go', 'Anxiety or panic stops me leaving the house'] },
    { category: 'Something else?', icon: '✏️', items: [] },
  ],
  default: [
    { category: 'Physical', icon: '💪', items: ['Pain or discomfort limits me', 'Fatigue stops me managing reliably', 'I have strength or mobility difficulties'] },
    { category: 'Mental Health', icon: '🧠', items: ['Anxiety or distress affects this activity', 'I need prompting or reminders', 'I avoid this activity when I can'] },
    { category: 'Cognitive', icon: '⚡', items: ['I struggle to concentrate', 'I forget steps or instructions', 'I need supervision to stay safe'] },
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
  const {
    selectedQuestionId,
    navigateTo,
    goBack,
    medProfile,
    setDescriptorHint,
    setQ1Result,
    cocMode,
    cocPreviousAnswers,
    cocAssessorNotes,
    cocPreviousPoints,
  } = useAppContext();
  const qId = selectedQuestionId || 'q1';
  const question = getQuestion(qId);

  const [step, setStep] = useState(1);
  const [showDescriptors, setShowDescriptors] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [explainerOpen] = useState(true);
  const [openHelpPill, setOpenHelpPill] = useState<number | null>(null);
  const [personalisedExplainer, setPersonalisedExplainer] = useState<string | null>(null);
  const [loadingExplainer, setLoadingExplainer] = useState(false);
  const [customDifficulty, setCustomDifficulty] = useState('');
  const [answers, setAnswers] = useState<WizardAnswer>({
    difficulties: [],
    frequencies: {},
    supportNeeded: [],
    realLifeImpact: [],
    extraDetail: '',
  });

  const conditions = medProfile.conditions.map((c: any) => c.name).join(', ');

  // Generate personalised explainer on mount if conditions exist
  React.useEffect(() => {
    if (!conditions || !question) return;
    setLoadingExplainer(true);
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Rewrite this PIP question explainer specifically for someone with: ${conditions}.

Activity: "${question.title}"
Original explainer: "${question.defaultExplainer}"

Rules:
- Keep it under 60 words
- Reference their specific conditions by name
- Explain how THEIR conditions relate to THIS activity
- Warm, plain English — like a knowledgeable friend explaining
- First person framing where possible ("Because you have...")
- Do NOT add new PIP rules or invent information
- Return ONLY the rewritten explainer text, nothing else`,
        medProfile: { conditions: medProfile.conditions, medications: '', notes: '' },
        conversationHistory: [],
        userId: null,
      }),
    })
    .then(r => r.json())
    .then(d => {
      const text = (d.reply || d.generated || '').trim();
      if (text) setPersonalisedExplainer(text);
    })
    .catch(() => undefined)
    .finally(() => setLoadingExplainer(false));
  }, [qId, conditions, question, medProfile.conditions]);

  if (!question) return null;

  const isQ1 = qId === 'q1';
  const qNum = isQ1 ? 3 : (question.num + 2);

  const difficultyOptions = DIFFICULTY_OPTIONS[qId] || DIFFICULTY_OPTIONS.default;
  const supportOpts = SUPPORT_OPTIONS[qId] || SUPPORT_OPTIONS.default;
  const realLifeOpts = REAL_LIFE_OPTIONS[qId] || REAL_LIFE_OPTIONS.default;

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
    }
    // Step 6 is descriptors — navigation handled by handleDescriptorTap
  };

  const handleBack = () => {
    if (step === 1) {
      goBack();
    } else {
      setStep(s => s - 1);
    }
  };

  const handleDescriptorTap = async (code: string) => {
    const descriptor = question?.descriptors.find(d => d.code === code);
    if (!descriptor) return;

    setGenerating(true);
    sessionStorage.setItem('pippal_wizard_answers', JSON.stringify(answers));

    // Build frequency summary
    const freqSummary = answers.difficulties
      .map(d => {
        const f = answers.frequencies[d];
        const freqLabel = f === 'most' ? 'every day' : f === 'often' ? 'most days' : f === 'sometimes' ? 'several days a week' : f === 'rarely' ? 'occasionally' : '';
        return freqLabel ? `${d} (${freqLabel})` : d;
      })
      .join(', ');

    const supportList = answers.supportNeeded.filter(s => s !== "I don't need help").join(', ');
    const impactList = answers.realLifeImpact.join(', ');
    const conditions = medProfile.conditions.map((c: any) => c.name).join(', ') || 'not specified';
    const extraDetail = answers.extraDetail || '';

    const prevPts = cocPreviousPoints[qId];
    const prevAns = cocPreviousAnswers[qId]?.trim();
    const pa4Line = cocAssessorNotes[qId]?.trim();

    let cocInstructions = '';
    if (cocMode) {
      cocInstructions = `

CHANGE OF CIRCUMSTANCES — mandatory content rules:
${prevPts != null ? `- Previous official points recorded for this activity on file: ${prevPts}. Draft descriptor carries ${descriptor.points} points (${code}). Frame the answer around deterioration or worsening needs since then, not improvement.` : '- Previous activity points were not read from documents — still write vs what appears on file below as "before", and emphasise worsening since then.'}
${prevAns ? `- Previous answer / wording on form or letter for this activity (address this directly — quote briefly or paraphrase accurately):\n"${prevAns.slice(0, 2400)}${prevAns.length > 2400 ? '…' : ''}"` : '- No previous answer text on file for this activity — reference assessor notes if present, otherwise focus on worsening since last award.'}
${pa4Line ? `- Assessor PA4 wording for this activity (respond to this where it is wrong, thin, or no longer true):\n"${pa4Line.slice(0, 2400)}${pa4Line.length > 2400 ? '…' : ''}"` : ''}

You MUST:
1. Start by tying to what was on file (previous answer and/or assessor wording above) — then state clearly what is harder, more frequent, or less safe NOW.
2. Never suggest their condition or functioning has improved overall.
3. Match descriptor ${code}: "${descriptor.text}" using their selections below and reliability (safe, acceptable, often enough, reasonable time, sustainable).
`;
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Write a PIP descriptor answer for the activity "${question?.title}" matching descriptor ${code}: "${descriptor.text}".

The claimant has told us:
- Conditions: ${conditions}
- Difficulties they experience: ${freqSummary}
- Support or supervision they need: ${supportList || 'none stated'}
- Real-life impact: ${impactList || 'none stated'}
${extraDetail ? `- Additional detail: ${extraDetail}` : ''}
${cocInstructions}
Write ${cocMode ? '3-5' : '2-3'} sentences in first person that:
1. State what they cannot do or need help with (matching descriptor ${code})
2. Include how often this happens using their frequency data
3. Mention the specific support or supervision needed
4. Reference the real-life impact
${cocMode ? '5. Explicitly contrasts "before" (on-file / assessor) with worse or harder "now"' : ''}

Be specific and use the claimant's own information. No preamble. Return ONLY the answer text.`,
          medProfile: { conditions: medProfile.conditions, medications: '', notes: '' },
          conversationHistory: [],
          userId: null,
        }),
      });
      const res = await response.json();
      const answerText = (res.reply || res.generated || '').trim();

      setQ1Result({
        descriptor: code,
        text: answerText || descriptor.text,
        points: descriptor.points,
      });
      navigateTo('q1_result');
    } catch {
      // Fallback to basic result without AI text
      setQ1Result({ descriptor: code, points: descriptor.points, text: '' });
      navigateTo('q1_result');
    }
    setGenerating(false);
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

                {/* Explained — always expanded, personalised if conditions saved */}
                <div className="bg-amber-50 border border-amber-100 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-amber-100">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-600 text-sm">ⓘ</span>
                      <h3 className="font-bold text-amber-900 text-sm">This question explained</h3>
                    </div>
                    {conditions && (
                      <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
                        {loadingExplainer ? 'Personalising…' : 'Personalised for you'}
                      </span>
                    )}
                  </div>
                  <div className="px-4 py-4">
                    {loadingExplainer ? (
                      <div className="space-y-2">
                        <div className="h-3 bg-amber-200 rounded animate-pulse w-full" />
                        <div className="h-3 bg-amber-200 rounded animate-pulse w-4/5" />
                        <div className="h-3 bg-amber-200 rounded animate-pulse w-3/5" />
                      </div>
                    ) : (
                      <p className="text-sm text-amber-800 leading-relaxed">
                        {personalisedExplainer || question.defaultExplainer}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ask for more help pills — inline expand, prioritised by user conditions */}
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
                  <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3">ASK FOR MORE HELP</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(() => {
                      // Show condition-matched explainers first
                      const userConditions = medProfile.conditions.map((c: any) => c.name?.toLowerCase() || '');
                      const sorted = [...question.conditionExplainers].sort((a, b) => {
                        const aMatch = a.conditions.some((c: string) => userConditions.some((u: string) => u.includes(c.toLowerCase()) || c.toLowerCase().includes(u)));
                        const bMatch = b.conditions.some((c: string) => userConditions.some((u: string) => u.includes(c.toLowerCase()) || c.toLowerCase().includes(u)));
                        return aMatch === bMatch ? 0 : aMatch ? -1 : 1;
                      });
                      return sorted.slice(0, 5).map((ce, i) => (
                        <button
                          key={i}
                          onClick={() => setOpenHelpPill(openHelpPill === i ? null : i)}
                          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all active:scale-95 ${openHelpPill === i ? 'bg-teal-600 text-white border-teal-600' : 'text-teal-700 bg-teal-50 border-teal-100 hover:bg-teal-100'}`}
                        >
                          How does this apply to {ce.conditions[0]}?
                        </button>
                      ));
                    })()}
                  </div>
                  <AnimatePresence>
                    {openHelpPill !== null && (() => {
                      const userConditions = medProfile.conditions.map((c: any) => c.name?.toLowerCase() || '');
                      const sorted = [...question.conditionExplainers].sort((a, b) => {
                        const aMatch = a.conditions.some((c: string) => userConditions.some((u: string) => u.includes(c.toLowerCase()) || c.toLowerCase().includes(u)));
                        const bMatch = b.conditions.some((c: string) => userConditions.some((u: string) => u.includes(c.toLowerCase()) || c.toLowerCase().includes(u)));
                        return aMatch === bMatch ? 0 : aMatch ? -1 : 1;
                      });
                      const ce = sorted[openHelpPill];
                      return ce ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t border-stone-100 space-y-2">
                            <p className="text-sm text-stone-700 leading-relaxed">{ce.text}</p>
                            {ce.example && (
                              <p className="text-xs text-stone-400 italic leading-relaxed">"{ce.example}"</p>
                            )}
                          </div>
                        </motion.div>
                      ) : null;
                    })()}
                  </AnimatePresence>
                </div>

                {/* Previous answer (CoC mode) OR example answer (new claim) */}
                {cocMode ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center shrink-0">
                        <span className="text-[10px]">📋</span>
                      </div>
                      <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest">YOUR PREVIOUS ANSWER</p>
                    </div>
                    {cocPreviousAnswers[qId] ? (
                      <p className="text-sm text-blue-900 leading-relaxed">"{cocPreviousAnswers[qId]}"</p>
                    ) : (
                      <p className="text-sm text-blue-400 italic">No previous answer for this activity — build a fresh one below.</p>
                    )}
                    {cocPreviousAnswers[qId] && (
                      <p className="text-[11px] text-blue-600 font-semibold mt-2">
                        Your goal: write something stronger and more specific than this.
                      </p>
                    )}
                  </div>
                ) : (
                  question.conditionExplainers[0]?.example && (
                    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center shrink-0">
                          <span className="text-[10px]">👤</span>
                        </div>
                        <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">EXAMPLE ANSWER</p>
                      </div>
                      <p className="text-sm text-stone-600 leading-relaxed italic">"{question.conditionExplainers[0].example}"</p>
                    </div>
                  )
                )}
              </div>
            )}

            {/* ── STEP 2: Difficulties ── */}
            {step === 2 && (
              <div className="px-5 pt-5 space-y-4">
                {/* Hero */}
                <div className="bg-teal-700 rounded-2xl p-4 text-white">
                  <p className="text-[11px] font-bold text-teal-300 uppercase tracking-widest mb-1">DAILY LIVING · ACTIVITY {question.num}</p>
                  <h2 className="font-bold text-lg">{cocMode ? 'How has this got harder?' : 'Which difficulties apply to you?'}</h2>
                  <p className="text-teal-100 text-sm mt-1">
                    {cocMode
                      ? 'Select everything that applies NOW — even if it was an issue before too. Think about what\'s got worse or more frequent.'
                      : 'Select anything that applies — even if it only happens on bad days.'}
                  </p>
                </div>

                {/* What you are scored on — simple toggle, no animation library */}
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setShowDescriptors(s => !s)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                  >
                    <p className="text-sm font-bold text-stone-900">What you are scored on</p>
                    <span className="text-stone-400 text-xs font-semibold">{showDescriptors ? '▲ Hide' : '▼ Show'}</span>
                  </button>
                  {showDescriptors && (
                    <div className="border-t border-stone-100">
                      {question.descriptors.map(d => (
                        <div key={d.code} className="flex items-start gap-3 px-4 py-3 border-b border-stone-50 last:border-0">
                          <span className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center shrink-0 text-[10px] font-bold text-stone-500 mt-0.5">{d.code}</span>
                          <span className="flex-1 text-xs text-stone-600 leading-relaxed">{d.text}</span>
                          <span className={`text-xs font-bold shrink-0 mt-0.5 ${d.points === 0 ? 'text-stone-400' : d.points >= 8 ? 'text-teal-600' : d.points >= 4 ? 'text-blue-600' : 'text-amber-600'}`}>{d.points}pts</span>
                        </div>
                      ))}
                    </div>
                  )}
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
                            className={`w-full flex flex-row items-center gap-3 px-4 py-3.5 text-left transition-all active:scale-[0.99] ${selected ? 'bg-teal-50' : 'hover:bg-stone-50'}`}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-all ${selected ? 'bg-teal-600 border-teal-600' : 'border-stone-300'}`}>
                              {selected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`text-sm font-medium flex-1 ${selected ? 'text-teal-800' : 'text-stone-700'}`}>{item}</span>
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

            {/* Step 3: Frequency — dropdown per difficulty */}
            {answers.difficulties.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-stone-100 p-5 text-center">
                    <p className="text-stone-400 text-sm">No difficulties selected — tap Back to add some.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden divide-y divide-stone-50">
                    {answers.difficulties.map((diff, di) => (
                      <div key={di} className="px-4 py-3.5">
                        <p className="text-sm font-medium text-stone-700 mb-2 leading-snug">{diff}</p>
                        <select
                          value={answers.frequencies[diff] || ''}
                          onChange={e => setFrequency(diff, e.target.value)}
                          className={`w-full text-sm font-semibold rounded-xl border px-3 py-2.5 bg-white focus:ring-1 focus:ring-teal-400 focus:border-teal-400 ${answers.frequencies[diff] ? 'text-teal-700 border-teal-300 bg-teal-50' : 'text-stone-500 border-stone-200'}`}
                        >
                          <option value="" disabled>How often does this happen?</option>
                          <option value="never">Never</option>
                          <option value="rarely">Rarely — 1 or 2 days a week</option>
                          <option value="sometimes">Sometimes — most days</option>
                          <option value="often">Often — most days</option>
                          <option value="most">Every day</option>
                        </select>
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
                  <p className="text-teal-100 text-sm mt-1">Select anything below that reflects your experience when this is difficult for you.</p>
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
                      disabled={generating}
                      className="w-full flex gap-3 text-sm text-left rounded-2xl px-4 py-4 bg-white border-2 border-stone-100 hover:border-teal-300 hover:bg-teal-50 active:scale-[0.98] transition-all group shadow-sm disabled:opacity-50"
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

                {generating && (
                  <div className="flex items-center justify-center gap-3 py-4 bg-teal-50 rounded-2xl border border-teal-100">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay:`${i*150}ms`}} />)}
                    </div>
                    <p className="text-sm text-teal-700 font-medium">Building your answer from your responses…</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    sessionStorage.setItem('pippal_wizard_answers', JSON.stringify(answers));
                    setQ1Result(null);
                    navigateTo('q1_chat');
                  }}
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
