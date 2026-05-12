import React, { useState, useEffect } from 'react';
import { RefreshCw, RotateCcw, Edit3, Sparkles, Check, X, Save, ChevronRight } from 'lucide-react';
import { useAppContext } from './AppContext';
import { motion } from 'framer-motion';
import { getQuestion, PIP_QUESTIONS } from '../pipQuestions';

// ── Descriptor data ──────────────────────────────────────────────────────────

const descriptorData: Record<string, { points: number; heading: string; text: string; why: string }> = {
  A: {
    points: 0,
    heading: 'No difficulty preparing food',
    text: "I can prepare and cook a simple meal unaided. I do not experience significant difficulties or risks when cooking.",
    why: 'Based on your answers, you can plan, prepare and cook a simple meal without help.',
  },
  B: {
    points: 2,
    heading: 'Needs an aid or appliance to cook',
    text: "I <span class='bg-teal-100 text-teal-900 px-1 rounded'>need to use aids and appliances</span> to prepare a simple meal. <span class='bg-amber-100 text-amber-900 px-1 rounded'>On most days</span>, I experience <span class='bg-purple-100 text-purple-900 px-1 rounded'>pain and difficulty gripping</span>. I rely on <span class='bg-blue-100 text-blue-900 px-1 rounded'>adapted utensils and a perching stool</span> to cook safely.",
    why: 'You indicated you need aids like adapted utensils or appliances to cook safely.',
  },
  C: {
    points: 2,
    heading: 'Can only use a microwave',
    text: "I <span class='bg-teal-100 text-teal-900 px-1 rounded'>cannot cook using a conventional cooker</span> but can use a microwave. <span class='bg-amber-100 text-amber-900 px-1 rounded'>Every time I cook</span>, I experience <span class='bg-purple-100 text-purple-900 px-1 rounded'>severe fatigue and pain</span> standing at the stove. I rely entirely on <span class='bg-blue-100 text-blue-900 px-1 rounded'>the microwave</span> to prepare hot meals.",
    why: 'You indicated you cannot safely use a conventional cooker but can manage a microwave.',
  },
  D: {
    points: 2,
    heading: 'Needs prompting to prepare food',
    text: "I <span class='bg-teal-100 text-teal-900 px-1 rounded'>need prompting to prepare or cook a simple meal</span>. <span class='bg-amber-100 text-amber-900 px-1 rounded'>On the majority of days</span>, I experience <span class='bg-purple-100 text-purple-900 px-1 rounded'>severe lack of motivation and forgetfulness</span>. I rely on <span class='bg-blue-100 text-blue-900 px-1 rounded'>my partner to remind and encourage me</span> to eat.",
    why: 'You indicated you need someone to remind or prompt you to prepare meals.',
  },
  E: {
    points: 4,
    heading: 'Needs supervision or assistance',
    text: "I <span class='bg-teal-100 text-teal-900 px-1 rounded'>need supervision or assistance to prepare or cook a simple meal</span>. <span class='bg-amber-100 text-amber-900 px-1 rounded'>Whenever I try to cook</span>, I am at <span class='bg-purple-100 text-purple-900 px-1 rounded'>high risk of burning myself or leaving the stove on</span>. I must have <span class='bg-blue-100 text-blue-900 px-1 rounded'>another person with me in the kitchen</span> to stay safe.",
    why: 'You indicated you need someone to supervise or assist you when preparing food.',
  },
  F: {
    points: 8,
    heading: 'Cannot prepare and cook food',
    text: "I <span class='bg-teal-100 text-teal-900 px-1 rounded'>cannot prepare and cook food</span>. <span class='bg-amber-100 text-amber-900 px-1 rounded'>Every day</span>, I am <span class='bg-purple-100 text-purple-900 px-1 rounded'>completely unable to manage any aspect of cooking</span>. I rely entirely on <span class='bg-blue-100 text-blue-900 px-1 rounded'>others to prepare all my meals</span>.",
    why: 'You indicated you are completely unable to prepare or cook food.',
  },
};

// ── Component ────────────────────────────────────────────────────────────────

// Apply highlights to plain text (used for wizard-generated answers)
function addHighlightsToPlain(text: string): string {
  let out = text.replace(
    /\b(every day|most days|often|daily|frequently|on bad days|whenever|all the time|regularly|the majority of days|most of the time|several days a week)\b/gi,
    '<span class="bg-amber-100 text-amber-900 px-1 rounded">$1</span>'
  );
  out = out.replace(
    /\b(someone|another person|my (?:partner|carer|family|husband|wife)|supervision|assistance|help|reminders?|prompting|aid|appliance|adapted|microwave|perching stool|grab rail)\b/gi,
    '<span class="bg-blue-100 text-blue-900 px-1 rounded">$1</span>'
  );
  out = out.replace(
    /\b(pain|exhausted|exhaustion|fatigue|anxious|anxiety|distress|overwhelmed|unsafe|danger|risk|unable|cannot|can\'t|struggle|difficult|impossible|burns?|accidents?)\b/gi,
    '<span class="bg-purple-100 text-purple-900 px-1 rounded">$1</span>'
  );
  const firstSentenceEnd = out.indexOf('. ');
  if (firstSentenceEnd > 0) {
    out = '<span class="bg-teal-100 text-teal-900 px-1 rounded">' + out.slice(0, firstSentenceEnd) + '</span>' + out.slice(firstSentenceEnd);
  }
  return out;
}

export function ResultCard() {
  const {
    q1Result,
    setQ1Result,
    selectedQuestionId,
    setSelectedQuestionId,
    navigateTo,
    goBack,
    saveAnswer,
    getSavedAnswer,
    hasPaid,
    medProfile,
  } = useAppContext();

  const qId = selectedQuestionId || 'q1';
  const question = getQuestion(qId);
  const descriptor = q1Result?.descriptor || 'A';
  const data = descriptorData[descriptor] || descriptorData['A'];

  // Use the AI-generated text from the wizard if available, otherwise use template
  const generatedText = q1Result?.text || '';
  const initialText = generatedText
    ? addHighlightsToPlain(generatedText)
    : data.text;

  const [highlightsOn, setHighlightsOn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState<string | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [answerHistory, setAnswerHistory] = useState<string[]>([]);
  const [detailSuggestions, setDetailSuggestions] = useState<string[]>([]);
  const [addedDetails, setAddedDetails] = useState<Set<string>>(new Set());
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const VOICES = [
    {
      key: 'factual',
      label: 'Formal & factual',
      desc: 'Clear and straight to the point. Good if you want to sound precise and confident.',
      example: '"On most days I cannot use the hob. I use a microwave only."',
    },
    {
      key: 'descriptive',
      label: 'Detailed & personal',
      desc: 'Paints a real picture for the assessor — shows exactly what it feels like on a bad day.',
      example: '"When my anxiety is bad I stand at the hob and forget what I\'m doing. I\'ve left the gas on twice."',
    },
    {
      key: 'everyday',
      label: 'Plain and personal',
      desc: 'Warm and natural — like explaining it to a friend. Honest and easy to relate to.',
      example: '"Most days I just can\'t face cooking. The pain gets too much and I end up not eating properly."',
    },
  ];

  // Save answer on mount
  useEffect(() => {
    if (q1Result?.descriptor) {
      saveAnswer(qId, `Descriptor ${q1Result.descriptor}`);
    }
  }, [q1Result?.descriptor]);

  const displayText = editedText ?? initialText;

  const handleEdit = () => {
    if (!isEditing) {
      // Strip HTML for editing
      const stripped = displayText.replace(/<[^>]+>/g, '');
      setEditedText(stripped);
    } else {
      // Save plain text edit
      saveAnswer(qId, editedText || displayText.replace(/<[^>]+>/g, ''));
    }
    setIsEditing(e => !e);
  };

  const handleRedo = () => {
    setQ1Result(null);
    navigateTo('q1_intro');
  };

  const handleImprove = () => {
    if (!hasPaid) { navigateTo('upsell'); return; }
    setShowVoicePicker(true);
  };

  const handleImproveWithVoice = async (voice: string) => {
    setShowVoicePicker(false);
    setIsImproving(true);
    // Save current answer to history before overwriting
    setAnswerHistory(prev => [...prev, editedText ?? initialText]);
    try {
      const conditions = medProfile.conditions.map((c: any) => c.name).join(', ') || 'not specified';
      const wizardAnswers = (() => {
        try { return JSON.parse(sessionStorage.getItem('pippal_wizard_answers') || '{}'); } catch { return {}; }
      })();
      const difficulties = wizardAnswers.difficulties?.join(', ') || '';
      const support = wizardAnswers.supportNeeded?.join(', ') || '';
      const impact = wizardAnswers.realLifeImpact?.join(', ') || '';

      const voiceInstruction = voice === 'descriptive'
        ? 'Write in a descriptive, personal style — put the assessor in the moment. Use specific examples and show real impact on daily life.'
        : voice === 'everyday'
        ? 'Write in natural, everyday language — honest and straightforward, like explaining to a friend. Avoid formal or clinical phrasing. It should sound like a real person talking.'
        : 'Write in a formal, factual style — clear direct statements, no emotion, just the facts of what the person can and cannot do.';

      const currentText = (editedText || displayText).replace(/<[^>]+>/g, '').trim();
      const isUserEdited = !!editedText;
      const tappedDetails = addedDetails.size > 0 ? `\nThe claimant tapped these specific details to include — they MUST appear in the improved answer:\n${[...addedDetails].map(d => `- ${d}`).join('\n')}` : '';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `You are improving a PIP claim answer. ${isUserEdited ? 'The claimant has edited this answer themselves — be very faithful to their version. Strengthen the wording and add a small amount of supporting detail, but do NOT rewrite or change what they have said.' : 'Improve this answer to make it stronger and more natural.'}

Current answer to improve:
"${currentText}"
${tappedDetails}

Person's conditions: ${conditions}
Difficulties they selected: ${difficulties}
Support they need: ${support}
Real-life impact: ${impact}

Voice: ${voiceInstruction}

Rules:
- Write 4-6 sentences — enough to feel like a complete, genuine answer
- First person ("I...")
- Sound like a real person, not a form — natural and honest
- Include frequency (most days / every day / often / rarely manage)
- Include what support or help is needed
- Include at least one specific real-life consequence
- Do NOT use bureaucratic phrases like "I experience difficulties with" or "I am unable to"
- Do NOT add anything they have not indicated
- ${isUserEdited ? 'Stay very close to what the claimant wrote — they know their situation best' : 'Make it compelling and specific'}
- ${addedDetails.size > 0 ? `CRITICAL: The following tapped details MUST be woven into the answer: ${[...addedDetails].join(', ')}` : 'Be specific and genuine'}

Return ONLY the answer text — no preamble.`,
          medProfile: { conditions: medProfile.conditions, medications: '', notes: '' },
          conversationHistory: [],
          userId: null,
        }),
      });
      const res = await response.json();
      const improved = (res.reply || res.generated || '').trim();
      if (improved) {
        // Add highlights to the improved plain text
        const highlighted = addHighlights(improved);
        setEditedText(highlighted);
        saveAnswer(qId, improved);
      }
    } catch (e) { /* silent */ }
    setIsImproving(false);
  };
  const addHighlights = (text: string): string => {
    // Frequency words — amber
    let out = text.replace(
      /\b(every day|most days|often|daily|frequently|on bad days|whenever|all the time|regularly|the majority of days|most of the time)\b/gi,
      '<span class="bg-amber-100 text-amber-900 px-1 rounded">$1</span>'
    );
    // Support/aid — blue
    out = out.replace(
      /\b(someone|another person|my (partner|carer|family|husband|wife)|supervision|assistance|help|reminders?|prompting|aid|appliance|adapted|microwave|perching stool|grab rail)\b/gi,
      '<span class="bg-blue-100 text-blue-900 px-1 rounded">$1</span>'
    );
    // Impact — purple
    out = out.replace(
      /\b(pain|exhausted|exhaustion|fatigue|anxious|anxiety|distress|overwhelmed|unsafe|danger|risk|unable|cannot|can't|struggle|difficult)\b/gi,
      '<span class="bg-purple-100 text-purple-900 px-1 rounded">$1</span>'
    );
    // What they can/cannot do — teal (first sentence typically)
    const firstSentenceEnd = out.indexOf('. ');
    if (firstSentenceEnd > 0) {
      out = '<span class="bg-teal-100 text-teal-900 px-1 rounded">' + out.slice(0, firstSentenceEnd) + '</span>' + out.slice(firstSentenceEnd);
    }
    return out;
  };

  const handleNextQuestion = () => {
    const allIds = PIP_QUESTIONS.map(q => q.id);
    const currentIndex = allIds.indexOf(qId);
    const nextId = allIds[currentIndex + 1];
    if (nextId) {
      setSelectedQuestionId(nextId);
      setQ1Result(null);
      navigateTo('personalising'); // goes through loading screen → generates personalised content → q1_intro
    } else {
      navigateTo('question_index');
    }
  };

  const pointsColor = data.points >= 8 ? 'text-teal-700' : data.points >= 4 ? 'text-blue-600' : data.points >= 2 ? 'text-amber-600' : 'text-stone-500';

  // Generate personalised detail suggestions on mount
  useEffect(() => {
    if (!question) return;
    const conditions = medProfile.conditions.map((c: any) => c.name).join(', ') || 'not specified';
    setLoadingSuggestions(true);
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Generate 6-8 short, specific detail suggestions for a PIP claim answer about "${question.title}" for someone with: ${conditions}.

Each suggestion should be a brief phrase (3-7 words) describing a real-life difficulty that could strengthen their answer.

Examples for "Preparing food": "Leaving the hob on", "Burning food regularly", "Only managing ready meals", "Forgetting to eat", "Needing reminders to cook", "Panic attacks in the kitchen"

Make them specific to ${conditions} and directly relevant to ${question.title}.

Return ONLY a JSON array of strings, no markdown, no explanation. Example: ["Phrase one", "Phrase two"]`,
        conversationHistory: [],
        medProfile: { conditions: medProfile.conditions },
      }),
    })
      .then(r => r.json())
      .then(d => {
        try {
          const text = (d.reply || '').replace(/```json\n?|```/g, '').trim();
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) setDetailSuggestions(parsed.slice(0, 8));
        } catch { /* use fallback */ }
      })
      .catch(() => {})
      .finally(() => setLoadingSuggestions(false));
  }, [qId]);

  // Append a detail to the draft answer
  const handleAddDetail = (detail: string) => {
    if (addedDetails.has(detail)) return;
    setAddedDetails(prev => new Set([...prev, detail]));
    const current = (editedText || displayText).replace(/<[^>]+>/g, '').trim();
    const appended = `${current} ${detail.endsWith('.') ? detail : detail + '.'}`;
    setEditedText(appended);
    saveAnswer(qId, appended);
  };

  return (
    <div className="flex flex-col h-full bg-stone-50">

      {/* Saved banner */}
      <div className="bg-stone-100 border-b border-stone-200 px-5 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-stone-500">
          <Check className="w-3.5 h-3.5 text-teal-500" />
          Your conversation is saved
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
      </div>

      <div className="flex-1 overflow-y-auto pb-28 space-y-3 px-4 pt-4">

        {/* Question hero */}
        <div className="bg-teal-700 rounded-2xl p-4 text-white">
          <p className="text-teal-300 text-[10px] font-bold uppercase tracking-widest mb-1">
            {question?.category === 'Mobility' ? 'Mobility' : 'Daily Living'} · Activity {question?.num}
          </p>
          <h2 className="font-bold text-lg leading-tight">{question?.title || qId.toUpperCase()}</h2>
          <p className="text-teal-200 text-xs mt-1">{question?.subtext}</p>
        </div>

        {/* Descriptor hero */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-center"
        >
          <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest mb-2">DESCRIPTOR {descriptor}</p>
          <div className="flex items-baseline justify-center gap-2 mb-1">
            <span className={`text-5xl font-black ${pointsColor}`}>{data.points}</span>
            <span className={`text-xl font-bold ${pointsColor}`}>pts</span>
          </div>
          <p className={`font-bold text-base ${pointsColor}`}>{data.heading}</p>
        </motion.div>

        {/* Draft Answer */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-50">
            <h3 className="font-bold text-stone-900 text-sm">Your draft answer</h3>
            <div className="flex items-center gap-2">
              {/* Highlight toggle */}
              <button
                onClick={() => setHighlightsOn(h => !h)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${highlightsOn ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-stone-500 border-stone-200'}`}
              >
                ✏️ {highlightsOn ? 'On' : 'Off'}
              </button>
              <button
                onClick={handleEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-stone-200 text-stone-600 hover:bg-stone-50 transition-all"
              >
                {isEditing ? <><Save className="w-3 h-3" /> Save</> : <><Edit3 className="w-3 h-3" /> Edit</>}
              </button>
            </div>
          </div>

          <div className="px-4 py-4">
            {isEditing ? (
              <textarea
                value={editedText?.replace(/<[^>]+>/g, '') || ''}
                onChange={e => setEditedText(e.target.value)}
                className="w-full text-sm text-stone-700 leading-relaxed bg-stone-50 border border-stone-200 rounded-xl p-3 min-h-[120px] resize-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400"
                autoFocus
              />
            ) : (
              <p
                className="text-sm text-stone-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: highlightsOn ? displayText : displayText.replace(/<[^>]+>/g, '') }}
              />
            )}
          </div>

          {/* Highlight legend */}
          {highlightsOn && !isEditing && (
            <div className="px-4 pb-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-400 shrink-0" />
                <span className="text-[11px] text-stone-500">What you can/cannot do</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
                <span className="text-[11px] text-stone-500">Aid or support relied on</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <span className="text-[11px] text-stone-500">Frequency / how often</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0" />
                <span className="text-[11px] text-stone-500">Emotional/physical impact</span>
              </div>
            </div>
          )}
        </div>

        {/* Why this meets the descriptor */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-4 py-4">
          <h3 className="font-bold text-stone-900 text-sm mb-2">Why this counts</h3>
          <p className="text-sm text-stone-600 leading-relaxed">{data.why}</p>
        </div>

        {/* Helpful details to include */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-4 py-4">
          <h3 className="font-bold text-stone-900 text-sm mb-1">Helpful details to include</h3>
          <p className="text-xs text-stone-400 mb-3">Tap anything that's true for you — it gets added to your answer.</p>
          {loadingSuggestions ? (
            <div className="flex gap-2 flex-wrap">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 bg-stone-100 rounded-full animate-pulse" style={{ width: `${80 + i * 15}px` }} />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {detailSuggestions.map((detail, i) => {
                const added = addedDetails.has(detail);
                return (
                  <button
                    key={i}
                    onClick={() => handleAddDetail(detail)}
                    disabled={added}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full border transition-all active:scale-95 ${
                      added
                        ? 'bg-teal-600 text-white border-teal-600 cursor-default'
                        : 'text-stone-700 bg-stone-50 border-stone-200 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700'
                    }`}
                  >
                    {added ? '✓ ' : '+ '}{detail}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Linked Conditions */}
        {medProfile.conditions.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-4 py-4">
            <h3 className="font-bold text-stone-900 text-sm mb-3">Linked Conditions</h3>
            <div className="flex flex-wrap gap-2">
              {medProfile.conditions.map((c: any, i: number) => (
                <span key={i} className="text-xs font-medium text-stone-600 bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-full">
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer tip */}
        <p className="text-xs text-stone-500 text-center leading-relaxed px-4 py-2">
          <span className="font-bold text-stone-700">You're doing brilliantly.</span> A clear, honest answer like this gives your claim the best possible chance.
        </p>

      </div>

      {/* Voice picker modal */}
      {showVoicePicker && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center p-4" onClick={() => setShowVoicePicker(false)}>
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg p-5 space-y-3"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-bold text-stone-900 text-base">How would you like your answer to sound?</h3>
            <p className="text-sm text-stone-500">PIPpal will rewrite it in the style you choose — pick whichever feels most like you.</p>
            {VOICES.map(v => (
              <button
                key={v.key}
                onClick={() => handleImproveWithVoice(v.key)}
                className="w-full text-left p-4 rounded-xl border-2 border-stone-100 hover:border-teal-300 hover:bg-teal-50 active:scale-[0.98] transition-all"
              >
                <p className="font-bold text-stone-900 text-sm mb-1">{v.label}</p>
                <p className="text-xs text-stone-500 mb-2">{v.desc}</p>
                <p className="text-xs text-stone-400 italic">{v.example}</p>
              </button>
            ))}
            <button onClick={() => setShowVoicePicker(false)} className="w-full text-center text-sm text-stone-400 py-2 hover:text-stone-600">
              Cancel
            </button>
          </motion.div>
        </div>
      )}

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 px-4 py-3 max-w-2xl mx-auto">
        {/* Previous answer row */}
        {answerHistory.length > 0 && (
          <button
            onClick={() => {
              const prev = [...answerHistory];
              const last = prev.pop()!;
              setAnswerHistory(prev);
              setEditedText(last);
              saveAnswer(qId, last.replace(/<[^>]+>/g, ''));
            }}
            className="w-full flex items-center justify-center gap-2 text-xs text-stone-500 hover:text-purple-600 transition-colors py-2 mb-1 border border-stone-100 rounded-xl hover:bg-stone-50"
          >
            <RotateCcw className="w-3 h-3" />
            Use {answerHistory.length === 1 ? 'original' : 'previous'} answer
          </button>
        )}
        {/* Main actions */}
        <div className="flex gap-2">
          <button
            onClick={handleRedo}
            className="flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl border-2 border-stone-200 text-stone-500 font-semibold text-sm hover:bg-stone-50 active:scale-[0.98] transition-all"
            title="Start over"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleImprove}
            disabled={isImproving}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border-2 border-purple-200 bg-purple-50 text-purple-700 font-semibold text-sm hover:bg-purple-100 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isImproving ? (
              <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isImproving ? 'Improving...' : 'Improve answer'}
          </button>
          <button
            onClick={handleNextQuestion}
            className="flex-1 flex items-center justify-center gap-1.5 bg-teal-700 text-white py-3 rounded-xl font-semibold text-sm hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
