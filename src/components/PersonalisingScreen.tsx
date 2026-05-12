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
  const { navigateTo, selectedQuestionId, medProfile } = useAppContext();
  const questionId = selectedQuestionId || 'q1';

  useEffect(() => {
    const run = async () => {
      const conditions = medProfile?.conditions?.map((c: any) => c.name) || [];
      const conditionNames = conditions.join(', ');
      const config = getQuestionFlow(questionId);

      // No conditions — skip straight through
      if (!conditions.length || !config) {
        navigateTo('q1_intro');
        return;
      }

      const cacheKey = buildCacheKey(conditions, questionId);

      // 1. Check cache first
      const { data: cached } = await supabase
        .from('condition_content_cache')
        .select('explainer, example, hit_count')
        .eq('cache_key', cacheKey)
        .single();

      if (cached) {
        // Cache hit — store in sessionStorage and navigate
        console.log('[PIPpal] Cache HIT for', cacheKey, `(served ${cached.hit_count + 1} times)`);
        sessionStorage.setItem(`pippal_explainer_${questionId}`, cached.explainer);
        sessionStorage.setItem(`pippal_example_${questionId}`, cached.example);

        // Increment hit count (fire and forget)
        supabase.from('condition_content_cache')
          .update({ hit_count: cached.hit_count + 1, updated_at: new Date().toISOString() })
          .eq('cache_key', cacheKey)
          .then(() => {});

        navigateTo('q1_intro');
        return;
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

        // Store in sessionStorage for QuestionFlow to read
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
        console.error('[PIPpal] Personalisation error:', e);
        // On error just proceed — QuestionFlow will use defaults
      }

      navigateTo('q1_intro');
    };

    // Minimum display time — feels intentional, not rushed
    const minWait = new Promise(resolve => setTimeout(resolve, 3500));
    Promise.all([run(), minWait]).then(() => {});
  }, []);

  const messages = [
    'Personalising your questions...',
    'Reading your conditions...',
    'Tailoring the examples to you...',
    'Almost ready...',
  ];
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setMsgIndex(i => Math.min(i + 1, messages.length - 1));
    }, 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-stone-50 px-8 z-50">
      <div className="flex flex-col items-center gap-6 max-w-xs text-center">

        {/* PIPpal logo mark */}
        <div className="w-16 h-16 bg-teal-700 rounded-2xl flex items-center justify-center shadow-lg">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2.5 h-2.5 bg-white rounded-full animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-bold text-stone-900 text-xl mb-2">{messages[msgIndex]}</h2>
          <p className="text-sm text-stone-500 leading-relaxed">
            PIPpal is preparing a personalised walkthrough based on your conditions.
          </p>
        </div>

        {/* Condition pills */}
        {medProfile?.conditions?.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {medProfile.conditions.map((c: any, i: number) => (
              <span key={i} className="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-full">
                {c.name}
              </span>
            ))}
          </div>
        )}

        <p className="text-[11px] text-stone-400">This only takes a few seconds</p>
      </div>
    </div>
  );
}
