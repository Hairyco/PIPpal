import React, { useEffect, useState } from 'react';
import { useAppContext } from './AppContext';
import { supabase } from '../supabaseClient';
import { getQuestionFlow } from '../data/questionFlowData';

// Normalise conditions to a consistent cache key
function buildCacheKey(conditions: string[], questionId: string): string {
  const normalised = conditions
    .map(c => c.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'))
    .sort()
    .join('+');
  return `${normalised}|${questionId}`;
}

export function PersonalisingScreen() {
  const { navigateTo, selectedQuestionId, medProfile, savedAnswers } = useAppContext();
  const questionId = selectedQuestionId || 'q1';

  useEffect(() => {
    let navigated = false;
    const safeNavigate = () => {
      if (!navigated) {
        navigated = true;
        navigateTo('q1_intro');
      }
    };

    // Safety net — always navigate after 10 seconds no matter what
    const safetyTimer = setTimeout(safeNavigate, 10000);

    const run = async () => {
      try {
        const conditions = medProfile?.conditions?.map((c: any) => c.name) || [];
        const conditionNames = conditions.join(', ');
        const config = getQuestionFlow(questionId);

        // No conditions or no config — nothing to personalise
        if (!conditions.length || !config) return;

        const cacheKey = buildCacheKey(conditions, questionId);

        // 1. Check cache first — wrapped in try/catch so a missing table never stalls
        try {
          const { data: cached } = await supabase
            .from('condition_content_cache')
            .select('explainer, example, hit_count')
            .eq('cache_key', cacheKey)
            .single();

          if (cached) {
            console.log('[PIPpal] Cache HIT for', cacheKey, `(served ${cached.hit_count + 1} times)`);
            sessionStorage.setItem(`pippal_explainer_${questionId}`, cached.explainer);
            sessionStorage.setItem(`pippal_example_${questionId}`, cached.example);
            supabase.from('condition_content_cache')
              .update({ hit_count: cached.hit_count + 1, updated_at: new Date().toISOString() })
              .eq('cache_key', cacheKey)
              .then(() => {});
            return;
          }
        } catch {
          // Table may not exist yet or network failed — skip cache, go straight to generation
        }

        // 2. Cache miss — generate from API
        console.log('[PIPpal] Cache MISS for', cacheKey, '— generating...');

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
1. Explain in plain English what DWP is REALLY asking (not the jargon version)
2. Reassure them — they do NOT need to be severely physically disabled to score points. Mental health, fatigue, brain fog, needing help, taking longer — all count
3. Tell them specifically how ${conditionNames} is relevant to THIS activity
4. Hint that we will write the answer for them — they just need to tell us how they feel day to day

Tone: like a knowledgeable friend giving them a cheat code before a test. Warm, plain English, encouraging. Under 80 words. Return ONLY the explanation text.`,
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

          const [explainerData, exampleData] = await Promise.all([
            explainerRes.json(),
            exampleRes.json(),
          ]);

          const explainer = explainerData.reply?.trim() || config.explained;
          const example = exampleData.reply?.trim() || config.exampleAnswer?.quote || '';

          sessionStorage.setItem(`pippal_explainer_${questionId}`, explainer);
          sessionStorage.setItem(`pippal_example_${questionId}`, example);

          // Save to Supabase cache (fire and forget)
          supabase.from('condition_content_cache').insert({
            cache_key: cacheKey,
            question_id: questionId,
            conditions_key: conditions.map((c: string) => c.toLowerCase().trim()).sort().join('+'),
            explainer,
            example,
          }).then(() => {
            console.log('[PIPpal] Cached to Supabase:', cacheKey);
          });

        } catch (e) {
          console.error('[PIPpal] Personalisation API error:', e);
          // API failed — QuestionFlow will fall back to default content
        }
      } catch (e) {
        console.error('[PIPpal] Personalisation unexpected error:', e);
      }
    };

    // Wait for BOTH the work and the minimum display time before navigating
    const minWait = new Promise<void>(resolve => setTimeout(resolve, 3000));
    Promise.all([run(), minWait])
      .catch(() => {})
      .finally(() => {
        clearTimeout(safetyTimer);
        safeNavigate();
      });

    return () => {
      clearTimeout(safetyTimer);
      navigated = true; // prevent navigation if component unmounts early
    };
  }, []);

  const completedCount = Object.keys(savedAnswers).length;
  const totalQuestions = 12;
  const currentQuestionNum = parseInt(questionId.replace('q', '')) || 1;
  const progressPct = Math.round((completedCount / totalQuestions) * 100);
  const flowPreview = getQuestionFlow(questionId);
  const barWidthPct = completedCount === 0 ? 6 : Math.max(progressPct, 10);

  const preparingMessages = [
    'Personalising your next question...',
    'Reading your conditions...',
    'Tailoring the example to you...',
    'Almost ready...',
  ];
  const [msgIndex, setMsgIndex] = useState(0);
  const [showStuck, setShowStuck] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setMsgIndex(i => Math.min(i + 1, preparingMessages.length - 1));
    }, 900);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowStuck(true), 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-stone-50 via-white to-stone-50 px-6 z-50">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm text-center">

        <div className="relative shrink-0">
          <div className="absolute -inset-6 rounded-full bg-teal-400/15 blur-2xl" aria-hidden />
          <div className="relative w-[4.5rem] h-[4.5rem] bg-teal-700 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-teal-900/15 ring-4 ring-white">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 bg-white/95 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 160}ms` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Completed confirmation — shown from Q2 onwards */}
        {completedCount > 0 && (
          <div className="bg-teal-50 border border-teal-100 rounded-2xl px-5 py-3 w-full">
            <p className="text-sm font-bold text-teal-800">
              ✓ Question {completedCount} complete
            </p>
            <p className="text-xs text-teal-600 mt-0.5">
              {completedCount} of {totalQuestions} activities done — {totalQuestions - completedCount} remaining
            </p>
          </div>
        )}

        <div className="space-y-2 px-1">
          <h2 className="font-bold text-stone-900 text-xl leading-snug tracking-tight">{preparingMessages[msgIndex]}</h2>
          {flowPreview ? (
            <p className="text-sm text-stone-500 leading-relaxed">
              Up next: <span className="font-semibold text-stone-800">{flowPreview.title}</span>
            </p>
          ) : (
            <p className="text-sm text-stone-500 leading-relaxed">
              Preparing question {currentQuestionNum} of {totalQuestions}
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-[260px] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-stone-400">
            <span>Claim progress</span>
            <span className="tabular-nums text-teal-700">{completedCount}/{totalQuestions}</span>
          </div>
          <div className="h-2 rounded-full bg-stone-200/90 overflow-hidden ring-1 ring-stone-200/60">
            <div
              className="h-full rounded-full bg-teal-600 transition-all duration-700 ease-out"
              style={{ width: `${Math.min(barWidthPct, 100)}%` }}
            />
          </div>
        </div>

        {medProfile?.conditions && medProfile.conditions.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center max-w-xs">
            {medProfile.conditions.map((c: any, i: number) => (
              <span
                key={i}
                className="text-[11px] font-medium text-teal-800/90 bg-teal-50/80 border border-teal-100/80 px-2.5 py-1 rounded-full"
              >
                {c.name}
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-stone-400">Usually just a moment</p>

        {showStuck && (
          <button
            onClick={() => navigateTo('q1_intro')}
            className="text-xs text-stone-400 hover:text-teal-600 underline underline-offset-2 transition-colors"
          >
            Page stuck? Tap to continue
          </button>
        )}
      </div>
    </div>
  );
}
