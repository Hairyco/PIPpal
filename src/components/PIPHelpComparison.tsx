import React, { useState } from 'react';
import { ArrowRight, Check, Loader2, Star, X } from 'lucide-react';
import { useAppContext } from './AppContext';
import { startStripeCheckout } from '../utils/startStripeCheckout';

import { PIP_ENHANCED_YEARLY_GBP } from '../constants/pipDisplayRates';
import { formatFullAccessPrice } from '../constants/pricing';

type Cell =
  | { kind: 'text'; value: string; emphasis?: boolean }
  | { kind: 'yes'; value: string }
  | { kind: 'no'; value: string };

type Row = { label: string; diy: Cell; advisor: Cell; pippal: Cell };

const ROWS: Row[] = [
  {
    label: 'Cost',
    diy: { kind: 'text', value: '£0 (but high risk of rejection)' },
    advisor: { kind: 'text', value: 'Free at Citizens Advice · £150–£500+ with a solicitor' },
    pippal: { kind: 'text', value: `${formatFullAccessPrice()} one-off`, emphasis: true },
  },
  {
    label: 'Waiting time',
    diy: { kind: 'text', value: 'Weeks of stress — no guidance' },
    advisor: { kind: 'text', value: '1–6 weeks for an appointment' },
    pippal: { kind: 'text', value: '15–30 minutes to build your draft', emphasis: true },
  },
  {
    label: 'Personalised to your conditions',
    diy: { kind: 'no', value: 'No guidance on how conditions link to each activity' },
    advisor: { kind: 'text', value: 'Generic advice — depends who you see' },
    pippal: { kind: 'yes', value: 'Medical profile shapes every question' },
  },
  {
    label: 'Ready-to-copy PIP2 answers',
    diy: { kind: 'no', value: 'You write every box yourself' },
    advisor: { kind: 'text', value: 'They advise — you still write the form' },
    pippal: { kind: 'yes', value: 'Draft answers for all 12 activities' },
  },
  {
    label: 'PIP descriptors matched to your answers',
    diy: { kind: 'no', value: 'Easy to pick the wrong wording' },
    advisor: { kind: 'text', value: 'May explain descriptors — you apply them' },
    pippal: { kind: 'yes', value: 'Live scoring against DWP descriptors' },
  },
  {
    label: 'Reliability rules (safely, repeatedly, timely…)',
    diy: { kind: 'no', value: 'Most people miss these' },
    advisor: { kind: 'text', value: 'Sometimes covered in advice' },
    pippal: { kind: 'yes', value: 'Built into how we phrase your answers' },
  },
  {
    label: 'Evidence checklist',
    diy: { kind: 'no', value: 'You research what to send' },
    advisor: { kind: 'text', value: 'May suggest documents' },
    pippal: { kind: 'yes', value: 'Pre-claim checklist in the app' },
  },
  {
    label: 'Assessment prep (phone, video, face-to-face)',
    diy: { kind: 'no', value: 'Go in unprepared and anxious' },
    advisor: { kind: 'text', value: 'Varies — not always activity-by-activity' },
    pippal: { kind: 'yes', value: 'Prep guides & mock-style Q&A' },
  },
];

function CellContent({ cell, column }: { cell: Cell; column: 'diy' | 'advisor' | 'pippal' }) {
  const isPippal = column === 'pippal';

  if (cell.kind === 'yes') {
    return (
      <div className="flex items-start gap-2">
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
            isPippal ? 'bg-amber-400 text-teal-900' : 'bg-teal-100 text-teal-700'
          }`}
        >
          <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
        </span>
        <span className={`text-xs md:text-sm leading-snug ${isPippal ? 'text-teal-50' : 'text-stone-700'}`}>
          {cell.value}
        </span>
      </div>
    );
  }

  if (cell.kind === 'no') {
    return (
      <div className="flex items-start gap-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <X className="h-3 w-3" strokeWidth={3} aria-hidden />
        </span>
        <span className="text-xs md:text-sm text-stone-600 leading-snug">{cell.value}</span>
      </div>
    );
  }

  return (
    <p
      className={`text-xs md:text-sm leading-snug ${
        cell.emphasis && isPippal
          ? 'font-bold text-amber-300'
          : isPippal
            ? 'text-teal-50'
            : column === 'diy'
              ? 'text-stone-600'
              : 'text-stone-700'
      }`}
    >
      {cell.value}
    </p>
  );
}

export function PIPHelpComparison() {
  const { user, showToast, hasPaid, navigateTo } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStart = async () => {
    if (hasPaid) {
      navigateTo('home');
      return;
    }
    setIsProcessing(true);
    try {
      await startStripeCheckout({ email: user?.email, userId: user?.id });
    } catch (err) {
      console.error('Payment error:', err);
      showToast('Something went wrong. Please try again.', 'error');
      setIsProcessing(false);
    }
  };

  return (
    <section className="px-5 md:px-8 py-6 md:py-10" aria-labelledby="pip-help-compare-heading">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6 md:mb-8">
          <h2
            id="pip-help-compare-heading"
            className="text-xl md:text-2xl font-bold text-stone-900 leading-snug"
          >
            How PIPpal compares to other PIP help
          </h2>
          <p className="text-stone-500 text-sm md:text-base mt-2 max-w-xl mx-auto">
            What you get, what it costs, and how long it takes — an honest comparison.
          </p>
        </div>

        <div className="overflow-x-auto -mx-1 px-1 pb-2 scrollbar-hide">
          <div className="min-w-[720px] rounded-2xl border border-stone-200 bg-stone-50/80 shadow-sm isolate">
            {/* Header row */}
            <div className="grid grid-cols-[minmax(9rem,1.1fr)_1fr_1fr_1fr] border-b border-stone-200">
              <div className="bg-stone-100/90 p-3 md:p-4 flex items-end rounded-tl-2xl">
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-stone-500 leading-tight">
                  What you need to succeed
                </p>
              </div>
              <div className="bg-white p-3 md:p-4 border-l border-stone-100">
                <p className="text-sm md:text-base font-bold text-stone-800">Do it yourself</p>
              </div>
              <div className="bg-white p-3 md:p-4 border-l border-stone-100">
                <p className="text-sm md:text-base font-bold text-stone-800 leading-tight">
                  Citizens Advice / solicitor
                </p>
              </div>
              <div className="bg-teal-700 px-3 pt-3 pb-4 md:px-4 md:pt-4 md:pb-5 border-l border-teal-600 rounded-tr-2xl shadow-lg flex flex-col items-center text-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-teal-900 shadow-sm whitespace-nowrap">
                  <Star className="h-3 w-3 fill-teal-900 shrink-0" aria-hidden />
                  Most popular
                </span>
                <p className="text-sm md:text-base font-bold text-white">PIPpal</p>
              </div>
            </div>

            {/* Data rows */}
            {ROWS.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-[minmax(9rem,1.1fr)_1fr_1fr_1fr] ${
                  i < ROWS.length - 1 ? 'border-b border-stone-200' : ''
                }`}
              >
                <div
                  className={`bg-stone-100/70 p-3 md:p-4 flex items-start ${
                    i === ROWS.length - 1 ? 'rounded-bl-2xl' : ''
                  }`}
                >
                  <p className="text-xs md:text-sm font-semibold text-stone-800 leading-snug">{row.label}</p>
                </div>
                <div className="bg-white p-3 md:p-4 border-l border-stone-100 flex items-start">
                  <CellContent cell={row.diy} column="diy" />
                </div>
                <div className="bg-white p-3 md:p-4 border-l border-stone-100 flex items-start">
                  <CellContent cell={row.advisor} column="advisor" />
                </div>
                <div
                  className={`bg-teal-700 p-3 md:p-4 border-l border-teal-600 flex items-start ${
                    i === ROWS.length - 1 ? 'rounded-br-2xl' : ''
                  }`}
                >
                  <CellContent cell={row.pippal} column="pippal" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm md:text-base text-stone-700 mt-6 md:mt-8 max-w-2xl mx-auto leading-relaxed">
          A successful PIP claim can be worth{' '}
          <strong className="text-teal-800">
            £3,000–{PIP_ENHANCED_YEARLY_GBP.toLocaleString('en-GB')}+ per year
          </strong>
          . Can you afford to get the wording wrong?
        </p>

        <button
          type="button"
          onClick={handleStart}
          disabled={isProcessing}
          className="mt-5 w-full max-w-md mx-auto flex bg-orange-500 hover:bg-orange-600 text-white py-3.5 md:py-4 rounded-xl font-bold text-base md:text-lg items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm disabled:opacity-70"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Redirecting to payment…
            </>
          ) : (
            <>
              Start now
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </section>
  );
}
