import React from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useAppContext } from './AppContext';

export function DescriptorsGuide() {
  const { goBack } = useAppContext();

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">What are Descriptors?</h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 md:px-8 py-6 space-y-5 pb-10">

        {/* Intro */}
        <div className="bg-teal-700 rounded-2xl p-5 text-white">
          <h2 className="font-bold text-lg mb-2">This is how DWP decides what you get</h2>
          <p className="text-teal-100 text-sm leading-relaxed">
            Descriptors are the official statements the DWP uses to work out your PIP score. For each activity in your claim, they pick the statement that best matches what you can and can't do — and that statement carries a points value. Add them all up and you get your total score.
          </p>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm space-y-3">
          <h3 className="font-bold text-stone-900">How the scoring works</h3>
          <p className="text-sm text-stone-600 leading-relaxed">
            There are 12 activities in total. Each one has a list of statements — from "can do this fine on my own" through to "cannot do this at all." Each statement has a points value attached to it.
          </p>
          <p className="text-sm text-stone-600 leading-relaxed">
            Your Daily Living score covers activities 1 to 10. Your Mobility score covers activities 11 and 12. These are counted separately — you can qualify for one without the other.
          </p>
        </div>

        {/* Scoring thresholds */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <h3 className="font-bold text-stone-900 mb-1">What score do you need?</h3>
          <p className="text-sm text-stone-500 mb-4 leading-relaxed">The same thresholds apply to both Daily Living and Mobility.</p>
          <div className="space-y-2">
            {[
              { range: 'Below 8 points', label: 'No award', bg: 'bg-stone-50', text: 'text-stone-500', border: 'border-stone-200' },
              { range: '8 to 11 points', label: 'Standard rate', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
              { range: '12 points or more', label: 'Enhanced rate', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
            ].map(t => (
              <div key={t.range} className={`flex items-center justify-between rounded-xl px-4 py-3 border ${t.bg} ${t.border}`}>
                <span className={`text-sm font-medium ${t.text}`}>{t.range}</span>
                <span className={`text-sm font-bold ${t.text}`}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2025/26 rates */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <h3 className="font-bold text-stone-900 mb-1">What you could receive</h3>
          <p className="text-sm text-stone-500 mb-4 leading-relaxed">2025/26 weekly rates — paid every four weeks, tax-free.</p>
          <div className="space-y-2">
            {[
              { label: 'Daily Living — Standard', amount: '£76.70/wk' },
              { label: 'Daily Living — Enhanced', amount: '£114.60/wk' },
              { label: 'Mobility — Standard', amount: '£30.30/wk' },
              { label: 'Mobility — Enhanced', amount: '£80.00/wk' },
            ].map(r => (
              <div key={r.label} className="flex justify-between items-center py-2.5 border-b border-stone-50 last:border-0">
                <span className="text-sm text-stone-600">{r.label}</span>
                <span className="font-bold text-stone-900 text-sm">{r.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SAFES rule */}
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <h3 className="font-bold text-amber-900 mb-2">The test most people don't know about</h3>
          <p className="text-sm text-amber-800 leading-relaxed mb-3">
            The DWP isn't just asking whether you can technically do something. They have to consider whether you can do it <strong>safely</strong>, to a good enough standard, <strong>as often as you need to</strong>, <strong>in a reasonable time</strong>, and <strong>without it wiping you out</strong>. If the honest answer to any of those is no, you may score points even if you can sort of manage it.
          </p>
          <p className="text-xs text-amber-700 font-semibold">Think about your worst days — not when you're having a good one.</p>
        </div>

        {/* Tips */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <h3 className="font-bold text-stone-900 mb-3">Things people often forget to mention</h3>
          <ul className="space-y-3">
            {[
              { tip: 'If you use aids or adaptations — a walking stick, grab rail, special cutlery — that changes which descriptor applies to you.', icon: '🦯' },
              { tip: 'If you need someone to remind you, watch over you, or keep you safe — that counts as needing help, even if you do the task yourself.', icon: '👤' },
              { tip: 'If something takes you much longer than it would take most people, that matters. PIP is about whether you can do things in a reasonable time, not just whether you eventually can.', icon: '⏱️' },
              { tip: 'If completing an activity causes you significant pain or exhaustion afterwards, you are not reliably able to do it — even if you pushed through.', icon: '😔' },
              { tip: 'Mental health is treated the same as physical health. Anxiety, depression and PTSD all count. So does needing prompting or reassurance.', icon: '🧠' },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-lg shrink-0">{item.icon}</span>
                <span className="text-sm text-stone-600 leading-relaxed">{item.tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* External link */}
        <a href="https://www.gov.uk/pip/how-youre-assessed" target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-between bg-white rounded-2xl px-4 py-3.5 border border-stone-100 shadow-sm hover:border-teal-200 active:scale-[0.98] transition-all">
          <span className="text-sm font-semibold text-stone-700">Read the official GOV.UK assessment guide</span>
          <ExternalLink className="w-4 h-4 text-stone-400 shrink-0" />
        </a>

      </div>
    </div>
  );
}
