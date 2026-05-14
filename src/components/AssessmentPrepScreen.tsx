import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  BookOpen,
  FileText,
  Volume2,
} from 'lucide-react';
import { useAppContext } from './AppContext';

type View = 'choose' | 'inperson' | 'telephone';

// ─── FREQUENCY HIGHLIGHT ──────────────────────────────────────────────────────

function FrequencyBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <Volume2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-900 text-sm mb-1.5">Emphasise frequency — this is critical</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {[
              { word: 'Often', sub: '4–6 days a week' },
              { word: 'Most days', sub: 'Every day' },
              { word: 'Sometimes', sub: '1–3 days a week' },
              { word: 'Rarely', sub: 'Less than 1 day' },
            ].map(f => (
              <div key={f.word} className={`rounded-xl px-3 py-2 text-center ${f.word === 'Often' || f.word === 'Most days' ? 'bg-amber-600 text-white' : 'bg-white border border-amber-100 text-amber-800'}`}>
                <p className="font-bold text-sm">{f.word}</p>
                <p className={`text-[10px] ${f.word === 'Often' || f.word === 'Most days' ? 'text-amber-100' : 'text-amber-600'}`}>{f.sub}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Use <strong>"often"</strong> or <strong>"most days"</strong> when accurate — these carry the most weight. Saying <em>"sometimes"</em> can lead to a lower score. Base everything on your <strong>worst days</strong>, not your best.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

// Conditions that commonly make in-person attendance difficult
const TRAVEL_DIFFICULT_CONDITIONS = [
  'anxiety', 'panic', 'agoraphobia', 'ptsd', 'depression', 'bipolar',
  'autism', 'autistic', 'adhd', 'chronic fatigue', 'me/cfs', 'cfs', 'fibromyalgia',
  'chronic pain', 'ms ', 'multiple sclerosis', 'parkinson', 'epilepsy',
  'crohn', 'ibs', 'colitis', 'copd', 'heart', 'stroke', 'dementia',
  'schizophrenia', 'psychosis', 'ocd', 'phobia', 'fatigue', 'mobility',
];

function TelephoneInfoBox({ conditions }: { conditions: string[] }) {
  const lower = conditions.map(c => c.toLowerCase());

  const matched = conditions.filter(c =>
    TRAVEL_DIFFICULT_CONDITIONS.some(k => c.toLowerCase().includes(k))
  );

  const hasMatches = matched.length > 0;

  return (
    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-2">
      <p className="text-sm font-bold text-amber-900">Not sure which type you have?</p>
      <p className="text-sm text-amber-800 leading-relaxed">
        Check your appointment letter. If your condition makes attending in person difficult or harmful, you can <strong>request a telephone assessment</strong>. Call DWP on <strong>0800 917 2222</strong> and explain why — it is regularly granted.
      </p>
      {hasMatches ? (
        <div className="bg-white border border-amber-200 rounded-xl px-3 py-2.5">
          <p className="text-xs font-bold text-amber-900 mb-1.5">Based on your conditions, you may be eligible:</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {matched.map((c, i) => (
              <span key={i} className="text-xs font-semibold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
                {c}
              </span>
            ))}
          </div>
          <p className="text-xs text-amber-700 leading-relaxed">
            Conditions like yours — including anxiety, chronic pain, fatigue, and mental health conditions — are regularly accepted as valid reasons for a telephone assessment. Be honest about the impact travel has on you.
          </p>
        </div>
      ) : (
        <p className="text-xs text-amber-700 leading-relaxed">
          This includes anxiety, depression, PTSD, chronic pain, chronic fatigue, autism, mobility issues, or any condition where leaving home causes significant harm or distress.
        </p>
      )}
    </div>
  );
}

export function AssessmentPrep() {
  const { navigateTo, goBack, medProfile } = useAppContext();
  const [view, setView] = useState<View>('choose');

  const inPersonTips = [
    {
      title: 'Review Your answers prep',
      body: 'Before you go, open Your answers prep from Assessment Prep — each activity’s drafts in one scrollable sheet (My Questions · Review & download). Refresh anything that needs tightening.',
    },
    { title: 'Bring a support person', body: 'You can bring a friend, family member or carer. They can add information and take notes. Attending alone may be used against you.' },
    { title: 'Bring your evidence', body: 'Bring originals and copies of any GP letters, prescription lists, or specialist reports. You can also hand in evidence after.' },
    { title: 'You can record the assessment', body: 'Request an audio recording from your assessment provider at least 2 weeks in advance. You must leave a copy with the assessor.' },
    { title: 'Be careful about your journey', body: 'The assessor may ask how you got there. Explain what the journey cost you — recovery time, whether someone helped, whether you could do it every day.' },
    { title: "Don't do tasks you can't normally do", body: "If asked to do a physical task you wouldn't normally manage, say so. Doing it once may be recorded as evidence that you always can." },
    { title: 'Dress as you would on a bad day', body: "Don't dress up. The assessor observes everything from the moment you arrive. Appear as you do on a typical difficult day." },
    { title: 'You can request a home visit', body: "If leaving home significantly affects your health, request a home assessment. If the centre is more than 90 minutes away, request a closer one." },
    { title: 'Request a same-gender assessor', body: 'Call your assessment provider using the number on your appointment letter. Other reasonable adjustments can also be requested.' },
    { title: 'The assessor is a contractor — not DWP', body: 'Your assessment is carried out by Capita or Maximus. They write a report, but a DWP caseworker makes the final decision.' },
  ];

  const telephoneTips = [
    {
      title: 'Have Your answers prep open',
      body: 'Open Your answers prep on another device or printed (Home → Assessment Prep → Your answers prep, or Review & download). You may read from your own drafts during the call — that is allowed.',
    },
    { title: 'Find a quiet space', body: "Choose a quiet room where you won't be interrupted. Let others in the house know not to disturb you." },
    { title: 'You can have someone with you', body: 'A carer, family member or support worker can sit with you during the call. Tell the assessor who they are at the start.' },
    { title: 'Describe your worst days', body: 'Always describe how you are on your worst days. Say "on my worst days" out loud. Be specific — "4 out of 7 days", not just "sometimes".' },
    { title: 'Calls last 45–90 minutes', body: 'Have water nearby. You can ask for a short break. There is no rush to answer — take your time.' },
    { title: 'Ask for questions to be repeated', body: "Don't rush. If you don't understand a question, ask them to repeat or rephrase it. This is completely normal." },
    { title: "Note the time and assessor's name", body: "Write down when the call started, the assessor's name, and anything important that was said. You may need this later." },
    { title: 'Write notes straight after', body: "As soon as the call ends, write down everything you remember — what was asked, what you said, anything that felt wrong." },
  ];

  const tips = view === 'inperson' ? inPersonTips : telephoneTips;

  return (
    <div className="flex flex-col h-full bg-stone-50">
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button
          onClick={view === 'choose' ? goBack : () => setView('choose')}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-stone-900 text-lg leading-tight">
            {view === 'choose' ? 'Assessment Prep' : view === 'inperson' ? 'In-Person Assessment' : 'Telephone Assessment'}
          </h1>
          {view !== 'choose' && (
            <button onClick={() => setView('choose')} className="text-xs text-teal-600 font-medium hover:text-teal-700">
              Back to overview
            </button>
          )}
        </div>
      </div>

      {/* CHOOSE view */}
      {view === 'choose' && (
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-10">
          <div className="bg-teal-700 px-5 py-6 text-white">
            <h2 className="font-bold text-xl mb-1">Prepare for your assessment</h2>
            <p className="text-teal-100 text-sm leading-relaxed">
              Use the guides below, and open Your answers prep for your full drafts before the day — same wording you built in My Questions.
            </p>
          </div>

          <div className="px-5 py-5 space-y-4 max-w-2xl mx-auto">
            <button
              type="button"
              onClick={() => navigateTo('answers_review')}
              className="w-full bg-teal-700 text-white rounded-2xl p-5 text-left hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0 text-2xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-base mb-1">Your answers prep</p>
                  <p className="text-sm text-teal-100 leading-relaxed">
                    Read every drafted activity before the assessor — print or scroll on another device. Unlocks once all 12 have saved detail; until then finish them in My Questions.
                  </p>
                  <div className="flex items-center gap-1 mt-3">
                    <span className="text-xs font-bold text-white">Open review</span>
                    <ChevronRight className="w-3.5 h-3.5 text-teal-200" />
                  </div>
                </div>
              </div>
            </button>

            {/* Assessment type chooser */}
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wide px-1">Assessment tips by type</p>

            <button
              type="button"
              onClick={() => setView('inperson')}
              className="w-full bg-white rounded-2xl border border-stone-200 shadow-sm p-5 text-left hover:border-teal-300 hover:shadow-md active:scale-[0.98] transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center shrink-0 text-2xl">🏥</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-stone-900 text-base mb-1">In-Person Assessment</p>
                  <p className="text-sm text-stone-500 leading-relaxed">Face-to-face at an assessment centre or at your home. What to bring, what to say, and what most people don't know.</p>
                  <p className="mt-3 text-xs font-bold text-teal-700">Open guide</p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 shrink-0 mt-1" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setView('telephone')}
              className="w-full bg-white rounded-2xl border border-stone-200 shadow-sm p-5 text-left hover:border-teal-300 hover:shadow-md active:scale-[0.98] transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 text-2xl">📞</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-stone-900 text-base mb-1">Telephone Assessment</p>
                  <p className="text-sm text-stone-500 leading-relaxed">Assessment by phone from your own home. How to prepare, what to say, and what to do after the call.</p>
                  <p className="mt-3 text-xs font-bold text-teal-700">Open guide</p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 shrink-0 mt-1" />
              </div>
            </button>

            <TelephoneInfoBox conditions={medProfile?.conditions?.map((c: any) => c.name) ?? []} />
          </div>
        </div>
      )}



      {(view === 'inperson' || view === 'telephone') && (
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-10">
          <div className={`px-5 py-5 text-white ${view === 'inperson' ? 'bg-teal-700' : 'bg-blue-700'}`}>
            <p className="text-sm leading-relaxed opacity-90">
              {view === 'inperson'
                ? 'Tips for your face-to-face assessment.'
                : 'Tips to prepare for your telephone assessment from home.'}
            </p>
          </div>

          <div className="px-5 py-5 space-y-3 max-w-2xl mx-auto">
            {/* Inline frequency reminder */}
            <FrequencyBanner />

            {tips.map((tip, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-black text-white mt-0.5 ${view === 'inperson' ? 'bg-teal-600' : 'bg-blue-600'}`}>{i + 1}</span>
                <div>
                  <p className="font-semibold text-stone-900 text-sm mb-1">{tip.title}</p>
                  <p className="text-xs text-stone-500 leading-relaxed">{tip.body}</p>
                </div>
              </div>
            ))}

            {view === 'inperson' && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <p className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-600" />On the day</p>
                <ul className="space-y-2">
                  {['Arrive early — rushing increases anxiety', 'Dress as you would on a typical bad day', "Don't downplay your condition to seem polite", 'If a question confuses you, ask for it to be repeated', 'Mention all conditions, not just your main one'].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-amber-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {view === 'telephone' && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <p className="text-sm text-amber-800 leading-relaxed"><strong>After the call:</strong> Write down everything you remember as soon as it ends — what was asked, what you said, anything that felt wrong. You may need this if you challenge the decision.</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => navigateTo('answers_review')}
              className="w-full bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-teal-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Open Your answers prep
            </button>

            <button onClick={() => navigateTo('pip_diary')} className="w-full bg-white border border-stone-200 text-stone-700 py-3.5 rounded-xl font-semibold text-sm hover:bg-stone-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-600" />Open my PIP Diary
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
