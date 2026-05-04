import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';
import { useAppContext } from './AppContext';

interface Message {
  id: string;
  role: 'assessor' | 'user' | 'feedback';
  text: string;
}

const OPENER = `Hello, I'm your mock PIP assessor. This practice session will help you prepare for your real assessment.

I'll ask you questions the way a real assessor would. After each answer, I'll give you coaching feedback — telling you what was strong, what to add, and how to score more points.

Don't worry about being perfect. The goal is to help you feel confident and describe your real experiences clearly.

Let's start. Can you tell me your full name and briefly describe your main health conditions?`;

export function AssessmentMockTest() {
  const { goBack, medProfile, savedAnswers } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assessor', text: OPENER }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<{role: string, content: string}[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const conditions = medProfile?.conditions?.map(c => c.name).join(', ') || 'not specified';
  const answersContext = Object.entries(savedAnswers || {}).slice(0, 6)
    .map(([id, ans]) => `${id}: ${String(ans).slice(0, 150)}`)
    .join('\n');

  const systemPrompt = `You are roleplaying as a PIP assessment health professional for a practice session. Your job is to help the claimant prepare for their real assessment by:

1. Asking questions the way a real assessor would — covering the 12 PIP activities (preparing food, washing, dressing, mobility, communicating, etc.)
2. After each answer, giving SHORT coaching feedback in a [FEEDBACK] section — what was good, what was vague, specific phrases they should add
3. Then asking your next assessor question

The claimant's conditions: ${conditions}
Their saved PIP answers (for context): 
${answersContext}

Key coaching points to reinforce:
- Be specific with times and frequencies (not "sometimes" — say "4 out of 7 days")
- Always describe worst days, not best days
- Mention the impact AFTER doing a task (fatigue, pain, recovery time)
- Don't minimise — describe reality
- Mention any aids, supervision, or prompting needed
- Apply the SAFES rule — Safely, Acceptable standard, Frequently, Enough time, Sustainably

Format each response as:
[FEEDBACK]: (2-3 sentences of coaching on their last answer)
[ASSESSOR]: (your next assessor question)

Keep feedback warm, encouraging and specific. After about 8-10 exchanges, give a final summary of their strongest points and what to focus on in the real assessment.`;

  const send = async () => {
    if (!input.trim() || isThinking) return;
    const userText = input.trim();
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);

    const newHistory = [...conversationHistory, { role: 'user', content: userText }];
    setConversationHistory(newHistory);
    setIsThinking(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          medProfile,
          conversationHistory: newHistory,
          systemOverride: systemPrompt,
        }),
      });
      const data = await response.json();
      const reply = data.reply || '';

      // Parse feedback and assessor parts
      const feedbackMatch = reply.match(/\[FEEDBACK\]:\s*([\s\S]*?)(?:\[ASSESSOR\]|$)/);
      const assessorMatch = reply.match(/\[ASSESSOR\]:\s*([\s\S]*?)$/);

      const feedbackText = feedbackMatch?.[1]?.trim();
      const assessorText = assessorMatch?.[1]?.trim() || reply;

      const newMsgs: Message[] = [];
      if (feedbackText) {
        newMsgs.push({ id: Date.now() + '-fb', role: 'feedback', text: feedbackText });
      }
      if (assessorText) {
        newMsgs.push({ id: Date.now() + '-as', role: 'assessor', text: assessorText });
      }

      setMessages(prev => [...prev, ...newMsgs]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: reply }]);

      // Check if session complete
      if (reply.toLowerCase().includes('final summary') || reply.toLowerCase().includes('well done') && newHistory.length > 14) {
        setSessionComplete(true);
      }
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + '-err', role: 'assessor', text: 'Something went wrong. Please try again.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-50">
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-stone-900 text-base leading-tight">Mock Assessment</h1>
          <p className="text-[11px] text-stone-400">Practice with coaching feedback</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-bold">Live session</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'feedback' ? (
              <div className="max-w-[88%] bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">PIPpal feedback</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">{msg.text}</p>
              </div>
            ) : msg.role === 'assessor' ? (
              <div className="max-w-[88%] bg-white border border-stone-100 shadow-sm rounded-2xl rounded-tl-sm p-3.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Mock Assessor</span>
                </div>
                <p className="text-sm text-stone-700 leading-relaxed">{msg.text}</p>
              </div>
            ) : (
              <div className="max-w-[88%] bg-teal-700 rounded-2xl rounded-tr-sm p-3.5">
                <p className="text-sm text-white leading-relaxed">{msg.text}</p>
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Warning tip */}
      {messages.length === 1 && (
        <div className="mx-4 mb-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 flex gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700">Answer as you would in the real assessment. Don't hold back — describe your worst days honestly.</p>
        </div>
      )}

      {/* Input */}
      {!sessionComplete ? (
        <div className="px-4 py-3 bg-white border-t border-stone-100">
          <div className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Type your answer..."
              rows={2}
              className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-teal-500 transition-colors"
            />
            <button onClick={send} disabled={isThinking || !input.trim()}
              className="w-10 h-10 bg-teal-700 text-white rounded-xl flex items-center justify-center hover:bg-teal-800 disabled:opacity-40 transition-all shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-4 bg-white border-t border-stone-100">
          <button onClick={goBack}
            className="w-full bg-teal-700 text-white py-3.5 rounded-xl font-bold text-base hover:bg-teal-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            Back to Assessment Prep
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
