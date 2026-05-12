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
  const [message, setMessage] = useState('Personalising your questions...');
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
      setMessage('Tailoring the questions to your conditions...');
      console.log('[PIPpal] Cache MISS for', cacheKey, '— generating...');

      try {
        const [explainerRes, exampleRes] = await Promise.all([
          fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: `Rewrite this PIP question explainer for someone with: ${conditionNames}. Original: "${config.explained}". Rules: Under 60 words. Reference their conditions by name. Warm plain English. Return ONLY the rewritten text.`,
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

    run();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-stone-50 px-8">
      <div className="flex flex-col items-center gap-6 max-w-xs text-center">
        {/* Animated dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-3 h-3 bg-teal-600 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>

        <div>
          <h2 className="font-bold text-stone-900 text-lg mb-2">{message}</h2>
          <p className="text-sm text-stone-500 leading-relaxed">
            We're tailoring the examples and explanations to your specific conditions.
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
      </div>
    </div>
  );
}
