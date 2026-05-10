import React, { useState, useEffect } from 'react';
import { RefreshCw, Edit3, Sparkles, Check, X, Save, ChevronRight } from 'lucide-react';
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

  const [highlightsOn, setHighlightsOn] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState<string | null>(null);
  const [isImproving, setIsImproving] = useState(false);

  // Save answer on mount
  useEffect(() => {
    if (q1Result?.descriptor) {
      saveAnswer(qId, `Descriptor ${q1Result.descriptor}`);
    }
  }, [q1Result?.descriptor]);

  const displayText = editedText ?? data.text;

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

  const handleImprove = async () => {
    if (!hasPaid) { navigateTo('upsell'); return; }
    setIsImproving(true);
    try {
      const conditions = medProfile.conditions.map((c: any) => c.name).join(', ') || 'not specified';
      const wizardAnswers = (() => {
        try { return JSON.parse(sessionStorage.getItem('pippal_wizard_answers') || '{}'); } catch { return {}; }
      })();
      const difficulties = wizardAnswers.difficulties?.join(', ') || '';
      const support = wizardAnswers.supportNeeded?.join(', ') || '';
      const impact = wizardAnswers.realLifeImpact?.join(', ') || '';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Write a concise PIP descriptor answer (2-3 sentences MAX) for descriptor ${descriptor}: "${data.heading}".

Person's conditions: ${conditions}
Difficulties they selected: ${difficulties}
Support they need: ${support}
Real-life impact: ${impact}

Rules:
- 2-3 sentences ONLY — no more
- First person ("I...")
- Specific and factual
- Mention frequency (most days / every day / often)
- Mention impact or support needed
- No preamble, no explanation — just the answer text

Return ONLY the answer text.`,
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

  // Add colour highlights to plain text answer
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
      navigateTo('q1_intro');
    } else {
      navigateTo('question_index');
    }
  };

  const pointsColor = data.points >= 8 ? 'text-teal-700' : data.points >= 4 ? 'text-blue-600' : data.points >= 2 ? 'text-amber-600' : 'text-stone-500';

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

        {/* Descriptor hero */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-center"
        >
          <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest mb-2">DESCRIPTOR {descriptor}</p>
          <div className="flex items-baseline justify-center gap-2 mb-1">
            <span className={`text-5xl font-black ${pointsColor}`}>{data.points}</span>
            <span className={`text-xl font-bold ${pointsColor}`}>pts</span>
          </div>
          <p className={`font-bold text-lg ${pointsColor}`}>{data.heading}</p>
        </motion.div>

        {/* Draft Answer */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-50">
            <h3 className="font-bold text-stone-900 text-sm">Draft Answer</h3>
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
          <h3 className="font-bold text-stone-900 text-sm mb-2">Why this meets the descriptor</h3>
          <p className="text-sm text-stone-600 leading-relaxed">{data.why}</p>
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
          <span className="font-bold text-stone-700">A well-documented claim makes all the difference.</span> Take your time and describe your worst days — that's what assessors need to see.
        </p>

      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 px-4 py-4 flex gap-2 max-w-2xl mx-auto">
        <button
          onClick={handleRedo}
          className="flex items-center gap-1.5 px-4 py-3 rounded-xl border-2 border-stone-200 text-stone-600 font-semibold text-sm hover:bg-stone-50 active:scale-[0.98] transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Redo
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
          {isImproving ? 'Improving...' : 'Improve'}
        </button>
        <button
          onClick={handleNextQuestion}
          className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 text-white py-3 rounded-xl font-semibold text-sm hover:bg-orange-600 active:scale-[0.98] transition-all shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          Next Question
        </button>
      </div>

    </div>
  );
}
