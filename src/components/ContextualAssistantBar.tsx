// Contextual assistant bar — shows at bottom of each inner screen
// Pre-loaded with context for that specific page
import React, { useState } from 'react';
import { MessageSquare, ChevronRight, X } from 'lucide-react';
import { useAppContext } from './AppContext';

interface ContextualAssistantBarProps {
  prompt: string;       // pre-filled question/context for the assistant
  label: string;        // short label shown on the bar
  sublabel?: string;    // optional secondary text
}

export function ContextualAssistantBar({ prompt, label, sublabel }: ContextualAssistantBarProps) {
  const { navigateTo, setAssistantQuestion, setAssistantContext } = useAppContext();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const openAssistant = () => {
    setAssistantContext(prompt);
    setAssistantQuestion(prompt);
    navigateTo('home');
  };

  return (
    <div className="sticky bottom-0 px-4 py-3 bg-white border-t border-stone-100 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center shrink-0">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <button onClick={openAssistant} className="flex-1 text-left">
          <p className="font-bold text-stone-900 text-sm leading-tight">{label}</p>
          {sublabel && <p className="text-xs text-stone-400 mt-0.5">{sublabel}</p>}
        </button>
        <button onClick={openAssistant}
          className="bg-teal-700 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-teal-800 transition-colors flex items-center gap-1 shrink-0">
          Ask PIPpal <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setDismissed(true)} className="text-stone-300 hover:text-stone-500 shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
