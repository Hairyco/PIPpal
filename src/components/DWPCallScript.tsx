// Reusable DWP call script component
// Replaces every "call DWP" instruction with a personalised script
import React, { useState } from 'react';
import { Phone, ChevronDown, Copy, Check } from 'lucide-react';
import { useAppContext } from './AppContext';

type CallType = 'new_claim' | 'update' | 'chasing' | 'extension' | 'telephone_assessment';

const CALL_CONFIGS: Record<CallType, { number: string; label: string; description: string }> = {
  new_claim: {
    number: '0800 917 2222',
    label: 'Open a new PIP claim',
    description: 'PIP new claims line — free to call',
  },
  update: {
    number: '0800 121 4433',
    label: 'Report a change or get an update',
    description: 'PIP enquiry line for existing claims',
  },
  chasing: {
    number: '0800 121 4433',
    label: 'Chase your decision or speak to a case manager',
    description: 'PIP enquiry line — ask for a case manager',
  },
  extension: {
    number: '0800 121 4433',
    label: 'Request more time to return your form',
    description: 'Usually granted — ask for 2 extra weeks',
  },
  telephone_assessment: {
    number: '0800 917 2222',
    label: 'Request a telephone assessment',
    description: 'Call as early as possible after registering',
  },
};

const SCRIPTS: Record<CallType, (name: string, conditions: string) => string[]> = {
  new_claim: (name, conditions) => [
    `"Hello, I'd like to start a new PIP claim please."`,
    `"My name is ${name}."`,
    `"My conditions are: ${conditions}."`,
    `"I would like to request a telephone assessment rather than face-to-face if possible, as attending in person would cause me significant distress."`,
    `"Could you confirm the date you're opening my claim? I'd like to note it down as payments are backdated to today."`,
  ],
  update: (name, conditions) => [
    `"Hello, I'm calling to report a change of circumstances on my existing PIP claim."`,
    `"My name is ${name} and my conditions are: ${conditions}."`,
    `"My condition has worsened since my last assessment and I believe my needs have increased."`,
    `"I would like to report this change formally. Could you tell me what happens next?"`,
  ],
  chasing: (name, _) => [
    `"Hello, I'm calling to get an update on my PIP claim. My name is ${name}."`,
    `"Could you tell me what stage my claim is at and when I can expect a decision?"`,
    `"Could I please be put through to a case manager? I'd like to ask them to send a note to the case worker handling my claim."`,
    `"Could you give me my assessor reference number so I can track progress?"`,
  ],
  extension: (name, _) => [
    `"Hello, I'm calling about my PIP2 form. My name is ${name}."`,
    `"I've received the form but I need more time to complete it properly due to my health condition."`,
    `"Could I please request a 2-week extension to the return deadline?"`,
    `"Could you confirm the new deadline date and send it to me in writing?"`,
  ],
  telephone_assessment: (name, conditions) => [
    `"Hello, I've recently started a PIP claim and I'd like to request a telephone assessment."`,
    `"My name is ${name}. My conditions include: ${conditions}."`,
    `"Attending an assessment centre in person would cause me significant distress due to my condition."`,
    `"I understand this is at the assessor's discretion — but I'd like to formally request it please."`,
  ],
};

interface DWPCallScriptProps {
  type: CallType;
}

export function DWPCallScript({ type }: DWPCallScriptProps) {
  const { user, medProfile } = useAppContext();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const config = CALL_CONFIGS[type];
  const name = user?.name || 'your name';
  const conditions = medProfile?.conditions?.map(c => c.name).join(', ') || 'my conditions';
  const script = SCRIPTS[type](name, conditions);

  const copyScript = () => {
    navigator.clipboard?.writeText(script.join('\n\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-stone-50 transition-colors"
      >
        <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
          <Phone className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-stone-900 text-sm">What to say on the call</p>
          <p className="text-xs text-stone-500">{config.label}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-stone-100 pt-3 space-y-3">
          <a href={`tel:${config.number.replace(/ /g, '')}`}
            className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors">
            <Phone className="w-4 h-4" />
            {config.number} — Tap to call
          </a>

          <p className="text-xs font-bold text-stone-600">Your personalised script:</p>
          <div className="space-y-2">
            {script.map((line, i) => (
              <div key={i} className="bg-stone-50 rounded-xl px-3 py-2.5 flex gap-2">
                <span className="text-[10px] font-bold text-stone-400 shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm text-stone-700 leading-relaxed italic">{line}</p>
              </div>
            ))}
          </div>

          <button onClick={copyScript}
            className="w-full bg-stone-100 text-stone-700 py-2.5 rounded-xl font-bold text-sm hover:bg-stone-200 transition-colors flex items-center justify-center gap-1.5">
            {copied ? <><Check className="w-4 h-4 text-emerald-600" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy script</>}
          </button>
          <p className="text-[10px] text-stone-400 text-center">Script uses your name and conditions. Adapt as needed.</p>
        </div>
      )}
    </div>
  );
}
