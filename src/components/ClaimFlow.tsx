import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, FileText, Users, AlertCircle, ChevronDown, ChevronUp, Stethoscope, BookOpen, ClipboardList, Shield, TrendingUp, Download } from 'lucide-react';
import { useAppContext } from './AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PIP_QUESTIONS } from '../pipQuestions';

const TOTAL_STEPS = 7;

const ACTIVITIES = [
  { name: 'Preparing food', icon: '🍳', desc: 'Planning and cooking a simple meal safely.' },
  { name: 'Eating and drinking', icon: '🍽️', desc: 'Using cutlery, cutting food, swallowing safely.' },
  { name: 'Managing medication', icon: '💊', desc: 'Taking medication and managing treatment.' },
  { name: 'Washing and bathing', icon: '🚿', desc: 'Getting in and out of the bath or shower.' },
  { name: 'Toilet needs', icon: '🚽', desc: 'Managing bladder and bowel needs.' },
  { name: 'Dressing', icon: '👕', desc: 'Putting on and taking off clothing safely.' },
  { name: 'Communicating', icon: '🗣️', desc: 'Speaking and being understood by others.' },
  { name: 'Reading', icon: '📖', desc: 'Understanding written information and signs.' },
  { name: 'Engaging socially', icon: '👥', desc: 'Interacting with other people face to face.' },
  { name: 'Managing money', icon: '💳', desc: 'Making budgeting decisions and handling finances.' },
  { name: 'Planning a journey', icon: '🗺️', desc: 'Getting from A to B safely on your own.' },
  { name: 'Moving around', icon: '🚶', desc: 'How far you can walk reliably and safely.' },
];

const EVIDENCE_BY_CONDITION: Record<string, { evidence: string; why: string }[]> = {
  mental_health: [
    { evidence: 'Psychiatric or psychology reports', why: 'Directly supports anxiety, depression, PTSD and similar conditions.' },
    { evidence: 'GP letters or records', why: 'Shows diagnosis history and treatment over time.' },
    { evidence: 'Medication lists', why: 'Confirms ongoing treatment and severity.' },
    { evidence: 'Community mental health team records', why: 'Shows level of professional support needed.' },
  ],
  physical: [
    { evidence: 'GP letters confirming your conditions', why: 'Establishes medical diagnosis.' },
    { evidence: 'Hospital discharge summaries', why: 'Shows serious episodes and treatment.' },
    { evidence: 'Physiotherapy or occupational therapy reports', why: 'Confirms physical limitations and adaptations.' },
    { evidence: 'Prescription list', why: 'Shows ongoing medication for pain or mobility.' },
  ],
  neurodivergent: [
    { evidence: 'Formal diagnosis letter (autism / ADHD)', why: 'DWP needs confirmation of diagnosis.' },
    { evidence: 'Educational psychologist reports', why: 'Supports cognitive difficulties.' },
    { evidence: 'Support worker or carer statements', why: 'Shows what help is needed day-to-day.' },
    { evidence: 'School or workplace support records', why: 'Evidence of ongoing need for adjustments.' },
  ],
  general: [
    { evidence: 'Carer or family member statement', why: 'First-hand account of your daily difficulties.' },
    { evidence: 'Care plan from social services', why: 'Shows professional assessment of your needs.' },
    { evidence: 'PIP diary entries', why: 'Day-by-day record of how your condition affects you.' },
    { evidence: 'Benefit letters or previous PIP decisions', why: 'Shows established history of need.' },
  ],
};

function StepHeader({ step, title, onBack }: { step: number; title: string; onBack: () => void }) {
  return (
    <div className="bg-white border-b border-stone-100 px-5 py-4 sticky top-0 z-10">
      <div className="flex items-center gap-3 mb-3">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Step {step} of {TOTAL_STEPS}</p>
          <h1 className="font-bold text-stone-900 text-base leading-tight">{title}</h1>
        </div>
      </div>
      <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
        <motion.div
          className="bg-teal-600 h-full rounded-full"
          animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

function BottomBar({ onNext, label = 'Continue', disabled = false, onBack, showBack = false }: { onNext: () => void; label?: string; disabled?: boolean; onBack?: () => void; showBack?: boolean }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 px-5 py-4 flex gap-3 max-w-2xl mx-auto">
      {showBack && onBack && (
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-3.5 rounded-xl border-2 border-stone-200 text-stone-600 font-semibold text-sm hover:bg-stone-50 active:scale-[0.98] transition-all">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}
      <button
        onClick={onNext}
        disabled={disabled}
        className="flex-1 flex items-center justify-center gap-2 bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-teal-800 active:scale-[0.98] transition-all disabled:opacity-40 shadow-sm"
      >
        {label}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ClaimFlow() {
  const { navigateTo, goBack, setSelectedQuestionId, hasPaid, medProfile } = useAppContext();
  const [step, setStep] = useState(1);
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);
  const [expandedEvidence, setExpandedEvidence] = useState<string | null>('general');

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const back = () => step === 1 ? goBack() : setStep(s => s - 1);

  // Evidence categories based on conditions
  const conditions = medProfile?.conditions?.map((c: any) => c.name?.toLowerCase() || '') || [];
  const hasMentalHealth = conditions.some(c => ['anxiety','depression','ptsd','bipolar','schizophrenia','ocd','phobia'].some(k => c.includes(k)));
  const hasPhysical = conditions.some(c => ['pain','fibro','arthritis','ms ','parkinson','copd','stroke','epilep','cancer','heart','diabetes'].some(k => c.includes(k)));
  const hasNeuro = conditions.some(c => ['autism','adhd','dyslexia','dyspraxia','asperger'].some(k => c.includes(k)));

  const evidenceCategories = [
    ...(hasMentalHealth ? [{ key: 'mental_health', label: 'Mental health conditions' }] : []),
    ...(hasPhysical ? [{ key: 'physical', label: 'Physical conditions' }] : []),
    ...(hasNeuro ? [{ key: 'neurodivergent', label: 'Neurodivergent conditions' }] : []),
    { key: 'general', label: 'Useful for everyone' },
  ];

  const renderStep = () => {
    switch(step) {

      // ── STEP 1: Welcome ──────────────────────────────────────────────────────
      case 1: return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <h2 className="font-bold text-xl mb-2">Let's build your PIP claim</h2>
            <p className="text-teal-100 text-sm leading-relaxed">PIPpal guides you through every step — from understanding what PIP is to building the strongest possible application.</p>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
              <Clock className="w-4 h-4 text-teal-300" />
              <span className="text-teal-200 text-sm">Takes 15–30 minutes in total</span>
            </div>
          </div>

          {/* What is PIP */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-stone-900">What is PIP?</h3>
            <p className="text-sm text-stone-600 leading-relaxed">Personal Independence Payment is a tax-free government benefit for people whose health condition or disability affects daily life. It's worth up to <strong className="text-stone-900">£843 a month</strong> with both enhanced components and is not means-tested — it doesn't matter what you earn or whether you work.</p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { label: '3.9 million', sub: 'people currently claim' },
                { label: '64k+ apply', sub: 'every month' },
                { label: '£843/month', sub: 'maximum award' },
                { label: 'Backdated', sub: 'to the day you call' },
              ].map((s, i) => (
                <div key={i} className="bg-stone-50 rounded-xl p-3">
                  <p className="font-bold text-stone-900 text-sm">{s.label}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What you'll need */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h3 className="font-bold text-stone-900 mb-1">What you'll need</h3>
            <p className="text-xs text-stone-400 mb-4">You don't need any of this right now — but you will need to provide it when you return the form. Use this list to start gathering things in the background.</p>
            <div className="space-y-2.5">
              {[
                { icon: Stethoscope, text: 'Your diagnoses and main conditions', color: 'text-teal-600 bg-teal-50' },
                { icon: FileText, text: 'Medications you take regularly', color: 'text-blue-600 bg-blue-50' },
                { icon: Users, text: 'Names of doctors or specialists involved', color: 'text-purple-600 bg-purple-50' },
                { icon: AlertCircle, text: 'Examples of day-to-day struggles', color: 'text-amber-600 bg-amber-50' },
                { icon: Shield, text: 'Any supporting letters or evidence (optional)', color: 'text-stone-600 bg-stone-100' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.color.split(' ')[1]}`}>
                    <item.icon className={`w-4 h-4 ${item.color.split(' ')[0]}`} />
                  </div>
                  <p className="text-sm text-stone-700">{item.text}</p>
                </div>
              ))}
            </div>

            {/* No diagnosis button */}
            <div className="mt-4 pt-4 border-t border-stone-50">
              <p className="text-xs text-stone-500 mb-2">Don't have an official diagnosis yet, or still waiting?</p>
              <button
                onClick={() => navigateTo('pip_diary')}
                className="w-full flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-sm py-3 rounded-xl hover:bg-amber-100 active:scale-[0.98] transition-all"
              >
                <FileText className="w-4 h-4" />
                Start a PIP diary instead
              </button>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed text-center">A PIP diary lets you record your day-to-day difficulties without needing a formal diagnosis. It's accepted as supporting evidence by DWP.</p>
            </div>
          </div>

          {/* Key tips */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-stone-900 mb-1">Things that make a real difference</h3>
            {[
              { icon: '📞', title: 'Request a telephone assessment', body: 'If you have anxiety, depression, agoraphobia or any condition that makes travelling difficult — ask for a telephone assessment when you call DWP. Say clearly: "I would like a telephone assessment due to my mental health condition." It is regularly granted.' },
              { icon: '📅', title: 'Call as early as possible', body: 'Your claim is backdated to the date of your call — not when you return the form. Don\'t wait until everything is ready. Call 0800 917 2222 today.' },
              { icon: '📝', title: 'Describe your worst days', body: 'DWP assesses you on how you are on your worst days — not your average or best. Be honest. If you have days where you can\'t manage at all, say so.' },
              { icon: '🗓️', title: 'You have 1 month to return the form', body: 'Need more time? Call DWP and request an extension — it\'s almost always granted. Don\'t rush your answers.' },
              { icon: '📋', title: 'Keep copies of everything', body: 'Photograph or photocopy your completed form before posting it. If anything goes missing, you\'ll need it.' },
              { icon: '📄', title: 'Evidence helps but is not required', body: 'Don\'t delay your claim waiting for GP letters or reports. You can send supporting evidence separately at any time after submitting the form.' },
            ].map((tip, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-lg shrink-0">{tip.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-stone-900">{tip.title}</p>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{tip.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-sm text-amber-800 leading-relaxed"><strong>Don't wait until everything is ready.</strong> Call DWP today on <strong>0800 917 2222</strong> to open your claim — your payments are backdated to this call, not when you return the form.</p>
          </div>

          {/* Disclaimer */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
            <p className="text-[11px] text-stone-500 leading-relaxed">
              <strong className="text-stone-600">Disclaimer:</strong> PIPpal is a guidance tool designed to help you understand and prepare your PIP claim. It does not provide legal or medical advice. The information provided is based on publicly available DWP guidance and is intended as general support only. PIPpal cannot guarantee any particular outcome. For complex situations, consider speaking to a benefits adviser — Citizens Advice, Scope, or your local welfare rights service can help for free.
            </p>
          </div>
        </div>
      );

      // ── STEP 2: Understanding Descriptors ────────────────────────────────────
      case 2: return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <h2 className="font-bold text-xl mb-2">How PIP scoring works</h2>
            <p className="text-teal-100 text-sm leading-relaxed">Before we ask you any questions, you need to understand how DWP actually decides what you get. Most people don't — and it costs them points.</p>
          </div>

          {/* The key rule */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-stone-900">The most important thing to understand</h3>
            <p className="text-sm text-stone-600 leading-relaxed">PIP is not about your diagnosis. DWP does not care what you have been diagnosed with. They care about how your condition affects you day to day.</p>
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-3">
              <p className="text-sm font-bold text-teal-900 mb-2">DWP scores you on whether you can do each activity:</p>
              {['Safely — without risk of harm to yourself or others', 'Repeatedly — not just once on a good day', 'To an acceptable standard — properly, not just technically', 'In a reasonable time — not taking significantly longer than usual'].map((r, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-teal-800">{r}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Points thresholds */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h3 className="font-bold text-stone-900 mb-3">How points turn into money</h3>
            <p className="text-sm text-stone-500 mb-3">The same thresholds apply to both Daily Living and Mobility — they're scored separately.</p>
            <div className="space-y-2">
              {[
                { pts: 'Below 8 points', label: 'No award', amount: '', bg: 'bg-stone-50', border: 'border-stone-200', text: 'text-stone-500' },
                { pts: '8–11 points', label: 'Standard rate', amount: 'Daily: £76.70/wk · Mobility: £30.30/wk', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
                { pts: '12+ points', label: 'Enhanced rate', amount: 'Daily: £114.60/wk · Mobility: £80.00/wk', bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700' },
              ].map(t => (
                <div key={t.pts} className={`rounded-xl px-4 py-3 border ${t.bg} ${t.border}`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm font-semibold ${t.text}`}>{t.pts}</span>
                    <span className={`text-sm font-bold ${t.text}`}>{t.label}</span>
                  </div>
                  {t.amount && <p className="text-xs text-stone-500">{t.amount}</p>}
                </div>
              ))}
            </div>
            <a
              href="https://www.gov.uk/pip/how-much-youll-get"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-1.5 text-xs text-teal-600 font-semibold hover:text-teal-700 transition-colors"
            >
              View official DWP rates on GOV.UK →
            </a>
          </div>

          {/* The 12 activities */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="p-5 pb-3">
              <h3 className="font-bold text-stone-900 mb-1">The 12 activities PIP assesses</h3>
              <p className="text-sm text-stone-500">Tap any activity to see the official descriptors and points.</p>
            </div>
            <div className="divide-y divide-stone-50">
              {ACTIVITIES.map((a, i) => {
                const q = PIP_QUESTIONS[i];
                return (
                  <div key={i}>
                    <button
                      onClick={() => setExpandedActivity(expandedActivity === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{a.icon}</span>
                        <span className="text-sm font-medium text-stone-800">{a.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {q && <span className="text-xs font-bold text-teal-600">{Math.max(...q.descriptors.map(d => d.points))}pts max</span>}
                        {expandedActivity === i ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                      </div>
                    </button>
                    <AnimatePresence>
                      {expandedActivity === i && q && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-5 pb-4 pt-1 space-y-2">
                            <p className="text-xs text-stone-500 mb-2">{a.desc}</p>
                            {q.descriptors.map(d => (
                              <div key={d.code} className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center shrink-0 text-[10px] font-bold text-stone-500">{d.code}</span>
                                <span className="text-xs text-stone-600 flex-1 leading-relaxed">{d.text}</span>
                                <span className={`text-xs font-bold shrink-0 ${d.points === 0 ? 'text-stone-400' : d.points >= 8 ? 'text-teal-600' : d.points >= 4 ? 'text-blue-600' : 'text-amber-600'}`}>{d.points}pts</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );

      // ── STEP 3: Medical Profile ──────────────────────────────────────────────
      case 3: return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <h2 className="font-bold text-xl mb-2">Tell us about your conditions</h2>
            <p className="text-teal-100 text-sm leading-relaxed">PIPpal uses your conditions to tailor every question, suggest relevant evidence, and build answers in the right context.</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-stone-900">Your medical profile</h3>
            </div>
            {medProfile?.conditions?.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-stone-500">You've already added these conditions:</p>
                <div className="flex flex-wrap gap-2">
                  {medProfile.conditions.map((c: any, i: number) => (
                    <span key={i} className="text-sm font-medium text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-full">{c.name}</span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-stone-500">You haven't added your conditions yet. Add them so PIPpal can tailor your claim properly.</p>
            )}
            <button
              onClick={() => navigateTo('medical_profile')}
              className="w-full flex items-center justify-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 font-semibold text-sm py-3 rounded-xl hover:bg-teal-100 active:scale-[0.98] transition-all"
            >
              <Stethoscope className="w-4 h-4" />
              {medProfile?.conditions?.length > 0 ? 'Update medical profile' : 'Add your conditions'}
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-sm text-amber-800 leading-relaxed"><strong>Why does this matter?</strong> PIP looks at how your conditions affect you — not just what they are. Adding your conditions helps PIPpal ask the right questions and suggest the right evidence.</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3">What to include</p>
            <div className="space-y-2">
              {['All physical conditions — even ones that seem minor', 'All mental health conditions and diagnoses', 'Neurodivergent conditions like autism or ADHD', 'Ongoing conditions even if managed with medication'].map((t, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-stone-600">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

      // ── STEP 4: Questions ────────────────────────────────────────────────────
      case 4: return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <h2 className="font-bold text-xl mb-2">Tell us how you're affected</h2>
            <p className="text-teal-100 text-sm leading-relaxed">Now we go through each of the 12 PIP activities. PIPpal asks the right questions and builds a draft answer for each one — in your words.</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-stone-900">Tips before you start</h3>
            {[
              { title: 'Think about your worst days', body: 'DWP assesses you on your worst days — not your best. Be honest about what you struggle with.' },
              { title: 'Real examples matter most', body: 'Specific incidents ("I burned myself last week") are far more powerful than general statements.' },
              { title: 'You can pause and come back', body: 'Your answers are saved as you go. You don\'t need to complete everything at once.' },
            ].map((tip, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-teal-700 text-xs font-bold">{i + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">{tip.title}</p>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{tip.body}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigateTo('question_index')}
            className="w-full flex items-center justify-center gap-2 bg-teal-700 text-white py-4 rounded-xl font-bold text-base hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm"
          >
            Start the 12 questions
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-xs text-stone-400 text-center">You can come back to this at any time</p>
        </div>
      );

      // ── STEP 5: Evidence ─────────────────────────────────────────────────────
      case 5: return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <h2 className="font-bold text-xl mb-2">Let's build your evidence</h2>
            <p className="text-teal-100 text-sm leading-relaxed">Supporting evidence isn't required, but it makes a real difference. Here's exactly what to gather — and why each piece helps your claim.</p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-sm text-amber-800 leading-relaxed"><strong>Don't wait for evidence before applying.</strong> Gather it while your form is being processed. You can send supporting letters separately at any time.</p>
          </div>

          {evidenceCategories.map(cat => (
            <div key={cat.key} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedEvidence(expandedEvidence === cat.key ? null : cat.key)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-stone-50 transition-colors"
              >
                <h3 className="font-bold text-stone-900 text-sm">{cat.label}</h3>
                {expandedEvidence === cat.key ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
              </button>
              <AnimatePresence>
                {expandedEvidence === cat.key && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="divide-y divide-stone-50">
                      {EVIDENCE_BY_CONDITION[cat.key]?.map((e, i) => (
                        <div key={i} className="px-5 py-3.5">
                          <p className="text-sm font-semibold text-stone-800 mb-1">{e.evidence}</p>
                          <p className="text-xs text-stone-500 leading-relaxed">{e.why}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h3 className="font-bold text-stone-900 mb-2">How to get a supporting letter</h3>
            <p className="text-sm text-stone-600 leading-relaxed mb-3">Contact your GP or specialist and ask for a letter confirming your diagnosis and how your condition affects your daily life. Most surgeries charge a small fee — around £25–£50.</p>
            <p className="text-sm text-stone-600 leading-relaxed">You can also ask for a SAR (Subject Access Request) to get all your medical records for free — useful for older diagnoses.</p>
          </div>
        </div>
      );

      // ── STEP 6: Review ───────────────────────────────────────────────────────
      case 6: return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white">
            <h2 className="font-bold text-xl mb-2">Review before submission</h2>
            <p className="text-teal-100 text-sm leading-relaxed">Before you return your form, check everything is complete and accurate. This is your final chance to strengthen your answers.</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-stone-900">Final checklist</h3>
            {[
              'Have you answered all 12 questions?',
              'Do your answers describe your worst days — not your best?',
              'Have you included specific real-life examples?',
              'Have you gathered any supporting evidence you can include?',
              'Have you kept a copy of your completed form?',
              'Are you returning the form within the 1-month deadline?',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded border-2 border-stone-300 shrink-0 mt-0.5" />
                <p className="text-sm text-stone-700">{item}</p>
              </div>
            ))}
          </div>

          <button onClick={() => navigateTo('question_index')} className="w-full flex items-center justify-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 font-semibold text-sm py-3 rounded-xl hover:bg-teal-100 active:scale-[0.98] transition-all">
            <ClipboardList className="w-4 h-4" />
            Review my answers
          </button>

          <button onClick={() => navigateTo('downloads')} className="w-full flex items-center justify-center gap-2 bg-stone-50 border border-stone-200 text-stone-600 font-semibold text-sm py-3 rounded-xl hover:bg-stone-100 active:scale-[0.98] transition-all">
            <FileText className="w-4 h-4" />
            Download completed answers
          </button>

          {/* PIP2 Form section */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-stone-900">Your PIP2 form</h3>
            <p className="text-sm text-stone-600 leading-relaxed">When DWP sends you the PIP2 form, use your completed answers from PIPpal to fill it in. Transfer your answers into the relevant sections — they have been written in the language DWP expects.</p>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs text-amber-800 leading-relaxed"><strong>Important:</strong> Take a photo or photocopy of your completed PIP2 form before posting it. If it gets lost, you will need a copy to resubmit or for appeal.</p>
            </div>
            <button onClick={() => navigateTo('downloads')} className="w-full flex items-center justify-center gap-2 bg-teal-700 text-white font-semibold text-sm py-3 rounded-xl hover:bg-teal-800 active:scale-[0.98] transition-all">
              <Download className="w-4 h-4" />
              Go to downloads folder
            </button>
          </div>
        </div>
      );

      // ── STEP 7: Done ─────────────────────────────────────────────────────────
      case 7: return (
        <div className="space-y-4 px-5 pt-5 pb-28">
          <div className="bg-teal-700 rounded-2xl p-5 text-white text-center">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <h2 className="font-bold text-xl mb-2">You're ready to submit</h2>
            <p className="text-teal-100 text-sm leading-relaxed">You've done everything you can to build a strong claim. Make sure you keep copies of everything and note your submission date.</p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-stone-900">What happens next</h3>
            {[
              { step: '1–2 weeks', desc: 'DWP acknowledges receipt of your form.' },
              { step: '4–8 weeks', desc: 'An assessment is arranged — face-to-face, telephone, or paper-based.' },
              { step: 'After assessment', desc: 'DWP makes a decision — usually within 4 weeks. You receive a decision letter.' },
              { step: 'If awarded', desc: 'Payments begin and backpay from your initial call date is sent in one lump sum.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-20 shrink-0">
                  <span className="text-xs font-bold text-teal-600">{item.step}</span>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-sm text-amber-800 leading-relaxed"><strong>Not happy with the decision?</strong> You have the right to a Mandatory Reconsideration and then an appeal. PIPpal can help with both.</p>
          </div>

          <button onClick={() => navigateTo('home')} className="w-full flex items-center justify-center gap-2 bg-teal-700 text-white py-4 rounded-xl font-bold text-base hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm">
            Back to dashboard
          </button>
        </div>
      );
    }
  };

  const stepTitles = [
    'What is PIP?',
    'How does scoring work?',
    'Tell us about your conditions',
    'Tell us how you\'re affected',
    'Let\'s build evidence',
    'Review before submission',
    'You\'re ready',
  ];

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <StepHeader step={step} title={stepTitles[step - 1]} onBack={back} />
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
      {step !== 4 && step !== 7 && (
        <BottomBar
          onNext={next}
          onBack={back}
          showBack={step > 1}
          label={step === 6 ? 'Mark as complete' : 'Continue'}
        />
      )}
      {step === 7 && null}
    </div>
  );
}
