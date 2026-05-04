// Reusable SAR email generator component
// Replaces every "make a Subject Access Request" instruction
import React, { useState } from 'react';
import { Mail, Copy, Check, ChevronDown } from 'lucide-react';
import { useAppContext } from './AppContext';

interface SAREmailGeneratorProps {
  context: 'pa4' | 'pip2' | 'full'; // what records to request
}

const TEMPLATES = {
  pa4: {
    label: 'Request your PA4 assessment report',
    subject: 'Subject Access Request — PIP Assessment Report (PA4)',
    records: 'a copy of my PIP Assessment Report (PA4) — the report written by the health professional who assessed me',
  },
  pip2: {
    label: 'Request your previous PIP2 form and assessor report',
    subject: 'Subject Access Request — PIP2 Form and Assessment Report',
    records: 'copies of: (1) my completed PIP2 "How Your Disability Affects You" form, (2) my PIP Assessment Report (PA4), and (3) the DWP decision maker\'s report',
  },
  full: {
    label: 'Request all PIP records',
    subject: 'Subject Access Request — All PIP Claim Records',
    records: 'all records held about my PIP claim, including: my PIP2 form, my assessment report (PA4), the decision maker\'s report, and all correspondence',
  },
};

export function SAREmailGenerator({ context }: SAREmailGeneratorProps) {
  const { user } = useAppContext();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [niNumber, setNiNumber] = useState('');

  const template = TEMPLATES[context];
  const name = user?.name || '[YOUR FULL NAME]';
  const dob = '[YOUR DATE OF BIRTH]';
  const ni = niNumber || '[YOUR NATIONAL INSURANCE NUMBER]';

  const emailBody = `To Whom It May Concern,

I am writing to make a Subject Access Request under the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.

Please provide me with ${template.records} relating to my PIP claim.

My details are as follows:
Full name: ${name}
Date of birth: ${dob}
National Insurance number: ${ni}

I understand you are required to respond within one calendar month of receiving this request.

Please send the documents to the email address this request is sent from, or to my home address if preferred.

Yours sincerely,
${name}`;

  const copyEmail = () => {
    navigator.clipboard?.writeText(emailBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openInMail = () => {
    const mailto = `mailto:dwp.sar@dwp.gov.uk?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailto);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-stone-50 transition-colors"
      >
        <div className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center shrink-0">
          <Mail className="w-4 h-4 text-teal-600" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-stone-900 text-sm">PIPpal drafts your request email</p>
          <p className="text-xs text-stone-500">{template.label}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-stone-100 pt-3 space-y-3">
          <div>
            <label className="text-xs font-bold text-stone-600 mb-1 block">Your National Insurance number (optional)</label>
            <input
              type="text"
              value={niNumber}
              onChange={e => setNiNumber(e.target.value.toUpperCase())}
              placeholder="e.g. QQ123456C"
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-teal-500"
            />
            <p className="text-[10px] text-stone-400 mt-1">Not stored — only used in this email draft</p>
          </div>

          <div className="bg-stone-50 rounded-xl p-3 text-xs text-stone-600 leading-relaxed font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
            {emailBody}
          </div>

          <div className="flex gap-2">
            <button onClick={openInMail}
              className="flex-1 bg-teal-700 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-teal-800 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5">
              <Mail className="w-4 h-4" />
              Open in email app
            </button>
            <button onClick={copyEmail}
              className="flex-1 bg-stone-100 text-stone-700 py-2.5 rounded-xl font-bold text-sm hover:bg-stone-200 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5">
              {copied ? <><Check className="w-4 h-4 text-emerald-600" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy email</>}
            </button>
          </div>
          <p className="text-[10px] text-stone-400 text-center">Sends to dwp.sar@dwp.gov.uk — fill in date of birth before sending</p>
        </div>
      )}
    </div>
  );
}
