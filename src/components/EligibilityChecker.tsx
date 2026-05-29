import React, { useState, memo, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  User,
  ArrowRight,
  Plus,
  ChevronDown,
  TrendingUp,
  Users,
  BookOpen,
  Mail,
  Loader2 } from
'lucide-react';
import { useAppContext } from './AppContext';
import { supabase } from '../supabaseClient';
import { ShareButton } from './ShareButton';
const CONDITIONS = [
'Anxiety',
'Depression',
'PTSD',
'Chronic pain',
'Autism',
'ADHD',
'Agoraphobia',
'Fibromyalgia',
'Epilepsy',
'MS',
'Arthritis',
'Back problems',
'Diabetes',
'Heart condition',
'Visual impairment',
'Memory problems',
'Fatigue / ME',
'Bipolar'];

const questions = [
{
  id: 'q1',
  text: 'Does your condition make everyday tasks harder than they should be?',
  hint: 'Think about things like getting dressed, cooking a meal, or having a shower. Even if you manage — does it take longer, cause pain, or leave you exhausted?',
  caseStudy: {
    name: 'Chloe, 19',
    condition: 'Anxiety & Depression',
    quote:
    "\"I'm at uni and didn't think PIP was for someone my age. But getting ready for lectures takes me over an hour — I freeze, I cry, I can't decide what to wear. My counsellor said that absolutely counts. I wish I'd known at 16.\""
  },
  options: [
  {
    text: "Yes — most days it's a real struggle",
    score: 4
  },
  {
    text: 'Some days are okay, but bad days are really bad',
    score: 3
  },
  {
    text: 'I manage, but it takes me much longer than it should',
    score: 2
  },
  {
    text: 'No, I can do these things without difficulty',
    score: 0
  }]

},
{
  id: 'q2',
  text: 'Do you ever avoid going out because of how your condition makes you feel?',
  hint: 'This includes feeling too anxious, too tired, in too much pain, or worried about what might happen. Even if you force yourself sometimes — how often do you want to avoid it?',
  caseStudy: {
    name: 'Diane, 58',
    condition: 'PTSD & Agoraphobia',
    quote:
    "\"After what happened to me I couldn't leave the house for months. At my age I felt embarrassed asking for help — I'd worked my whole life. But my GP said PIP isn't about whether you've worked, it's about what you can't do now. I haven't left my flat alone in 8 months.\""
  },
  options: [
  {
    text: 'Yes — I rarely leave the house',
    score: 4
  },
  {
    text: 'I avoid it often, or need someone with me',
    score: 3
  },
  {
    text: 'Sometimes, especially on bad days',
    score: 2
  },
  {
    text: "No, getting out isn't a problem for me",
    score: 0
  }]

},
{
  id: 'q3',
  text: 'Does pain, fatigue, or breathlessness stop you from doing things you need to do?',
  hint: 'Not just exercise — think about standing long enough to cook, walking to the shops, or even concentrating on a conversation. Does your body let you down?',
  caseStudy: {
    name: 'Aiden, 17',
    condition: 'Chronic pain & Hypermobility',
    quote:
    "\"I'm still in sixth form and people say I'm too young to have chronic pain. But some days I can barely walk to the bus stop. My mum didn't know I could claim PIP from 16 — neither did I until my physio mentioned it.\""
  },
  options: [
  {
    text: "Yes — it controls what I can and can't do",
    score: 4
  },
  {
    text: 'Often — I have to pace myself carefully',
    score: 3
  },
  {
    text: 'Sometimes, but I push through it',
    score: 2
  },
  {
    text: 'Rarely or never',
    score: 0
  }]

},
{
  id: 'q6',
  text: 'Have you had these difficulties for more than 3 months?',
  hint: "PIP is for conditions that have lasted at least 3 months and are expected to continue for at least 9 more. This includes conditions that fluctuate — you don't need to be affected every single day.",
  caseStudy: {
    name: 'Robert, 63',
    condition: 'COPD & Chronic fatigue',
    quote:
    '"I kept putting it off because I thought I was too close to retirement for it to matter. But my breathing got so bad I couldn\'t walk to the kitchen. My daughter helped me apply and I got enhanced both components — plus backdated payments. Don\'t wait like I did."'
  },
  options: [
  {
    text: "Yes, and I don't expect it to improve soon",
    score: 4
  },
  {
    text: "Yes, but I'm hoping it might get better",
    score: 3
  },
  {
    text: "It's been less than 3 months",
    score: 0
  },
  {
    text: "I'm not sure how long it's been",
    score: 1
  }]

},
{
  id: 'q8',
  text: 'Are you aged 16 or over and under State Pension age?',
  hint: "PIP is available to anyone in this age range, whether you're working or not. Being employed doesn't stop you claiming — PIP is based on how your condition affects you, not your income.",
  caseStudy: {
    name: 'Key fact',
    condition: '',
    quote:
    "\"You can claim PIP from age 16 — whether you're at school, at uni, working, or not working. It's not means-tested and won't affect your student loan. It's based purely on how your condition affects your daily life and mobility.\""
  },
  options: [
  {
    text: 'Yes',
    score: 4
  },
  {
    text: 'No',
    score: 0
  },
  {
    text: "I'm not sure",
    score: 1
  }]

}];

function InlineEmailCapture({ onContinue }: { onContinue: () => void }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) { setError('Please enter a valid email address'); return; }
    setError('');
    setIsSubmitting(true);
    try {
      await supabase.from('email_leads').insert({
        email: email.toLowerCase().trim(),
        source: 'Eligibility Checker',
        created_at: new Date().toISOString(),
      });
    } catch { /* Fail silently */ }
    setIsSubmitting(false);
    onContinue();
  };

  return (
    <div className="bg-white rounded-2xl border border-teal-200 shadow-sm p-5">
      <p className="text-sm font-bold text-stone-900 mb-1 text-center">Your result is ready</p>
      <p className="text-xs text-stone-500 mb-4 leading-relaxed text-center">Enter your email to see your eligibility score and personalised breakdown.</p>
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="your@email.com"
            className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-white transition-all outline-none ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100' : 'border-stone-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'}`}
          />
        </div>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>See my score <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
      <p className="text-center text-xs text-stone-400 mt-3">No spam. Unsubscribe any time.</p>
    </div>
  );
}

export function EligibilityChecker() {
  const { navigateTo, goBack, setHasCompletedEligibility, isLoggedIn } = useAppContext();
  const [phase, setPhase] = useState<'conditions' | 'questions' | 'result'>('conditions');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [customCondition, setCustomCondition] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const addCustomCondition = () => {
    const trimmed = customCondition.trim();
    if (
    trimmed &&
    !selectedConditions.includes(trimmed) &&
    !CONDITIONS.includes(trimmed))
    {
      setSelectedConditions((prev) => [...prev, trimmed]);
      setCustomCondition('');
    }
  };
  const toggleCondition = (c: string) => {
    setSelectedConditions((prev) =>
    prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };
  const startQuestions = () => {
    if (selectedConditions.length > 0) {
      setPhase('questions');
    }
  };
  const handleAnswer = (score: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = score;
    setAnswers(newAnswers);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setHasCompletedEligibility(true);
      if (!isLoggedIn) {
        setShowEmailGate(true);
      }
      setPhase('result');
    }
  };
  const handleBack = () => {
    if (phase === 'questions' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (phase === 'questions' && currentIndex === 0) {
      setPhase('conditions');
    } else if (phase === 'conditions') {
      goBack();
    } else {
      goBack();
    }
  };
  const reset = () => {
    setSelectedConditions([]);
    setAnswers([]);
    setCurrentIndex(0);
    setShowEmailGate(false);
    setPhase('conditions');
  };
  // RESULT SCREEN
  if (phase === 'result') {
    const totalScore = answers.reduce((a, b) => a + b, 0);
    const maxScore = questions.length * 4;
    const percentage = totalScore / maxScore * 100;
    let color = 'text-stone-600';
    let bg = 'bg-stone-100';
    let ringColor = 'text-stone-400';
    let title = 'Less Likely';
    let desc =
    'Based on your answers, you might not meet the criteria right now. But this is just a guide — many people underestimate how their condition affects them.';
    let encouragement =
    "It's still worth exploring. The way you describe your difficulties matters more than you think.";
    const resultsLocked = showEmailGate && !isLoggedIn;
    if (percentage >= 60) {
      color = 'text-teal-600';
      bg = 'bg-teal-50';
      ringColor = 'text-teal-500';
      title = 'Likely Eligible';
      desc =
      'Your answers strongly suggest you could qualify for PIP. Many people with similar difficulties receive an award.';
      encouragement =
      "The key is describing your worst days, not your best. We'll help you do exactly that.";
    } else if (percentage >= 35) {
      color = 'text-amber-600';
      bg = 'bg-amber-50';
      ringColor = 'text-amber-500';
      title = 'Possibly Eligible';
      desc =
      "You may well be eligible. Many successful claimants initially thought they wouldn't qualify.";
      encouragement =
      'Many successful claimants felt unsure at first. How you describe your difficulties on the form makes a real difference.';
    }
    return (
      <div className="flex flex-col h-full bg-stone-50">
        <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100">
          <button
            onClick={reset}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-stone-900 text-lg">Your Result</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-5 md:px-8 py-8">
          <div className="relative mb-8 max-w-sm mx-auto w-full">
            <div
              className={`flex flex-col items-center text-center ${resultsLocked ? 'blur-md pointer-events-none select-none opacity-90' : ''}`}
            >
            <motion.div
              initial={{
                scale: 0.8,
                opacity: 0
              }}
              animate={{
                scale: 1,
                opacity: 1
              }}
              className={`w-32 h-32 rounded-full ${bg} flex items-center justify-center mb-6 relative`}>
              
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 100 100">
                
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-stone-200" />
                
                <motion.circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className={ringColor}
                  strokeDasharray="289"
                  strokeLinecap="round"
                  initial={{
                    strokeDashoffset: 289
                  }}
                  animate={{
                    strokeDashoffset: 289 - 289 * percentage / 100
                  }}
                  transition={{
                    duration: 1,
                    ease: 'easeOut'
                  }} />
                
              </svg>
              <div className={`text-3xl font-bold ${color}`}>
                {Math.round(percentage)}%
              </div>
            </motion.div>

            <h2 className={`text-2xl font-bold mb-2 ${color}`}>{title}</h2>
            <p className="text-stone-600 leading-relaxed text-sm mb-3">
              {desc}
            </p>
            <p className="text-stone-500 text-xs leading-relaxed italic">
              {encouragement}
            </p>
            </div>

            {resultsLocked && (
              <div className="absolute inset-0 z-10 flex items-center justify-center px-1">
                <div className="w-full shadow-lg">
                  <InlineEmailCapture onContinue={() => setShowEmailGate(false)} />
                </div>
              </div>
            )}
          </div>

          <div
            className={
              resultsLocked ? 'blur-md pointer-events-none select-none opacity-90' : ''
            }
          >
          {/* Stats Row */}
          <div className="flex gap-2 mb-6">
            <div className="flex-1 bg-teal-50 rounded-xl p-3 border border-teal-100 flex flex-col items-center text-center justify-center gap-1">
              <Users className="w-4 h-4 text-teal-600" />
              <div className="text-[10px] text-teal-800 leading-tight">
                <strong>3.9M</strong> people currently claim PIP
              </div>
            </div>
            <div className="flex-1 bg-indigo-50 rounded-xl p-3 border border-indigo-100 flex flex-col items-center text-center justify-center gap-1">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <div className="text-[10px] text-indigo-800 leading-tight">
                <strong>64k+</strong> new claims made every month
              </div>
            </div>
          </div>

          {/* Conditions reminder */}
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm mb-6">
            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              Your conditions
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedConditions.map((c) =>
              <span
                key={c}
                className="bg-teal-50 text-teal-700 text-[10px] px-2 py-1 rounded-full font-medium">
                
                  {c}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => navigateTo('claim_flow')}
            className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-semibold text-lg hover:bg-orange-600 active:scale-[0.98] transition-all shadow-sm mb-2 flex items-center justify-center gap-2">
            Start My PIP Claim
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-[11px] text-stone-400 text-center mb-4">
            Free to start · Full access from £6.99 one-time
          </p>
          </div>

          <button
            onClick={reset}
            className="w-full text-stone-500 font-medium text-sm hover:text-stone-800 py-2">
            
            Retake assessment
          </button>

          <div className={`mt-4 pt-4 border-t border-stone-100 ${resultsLocked ? 'blur-md pointer-events-none select-none opacity-90' : ''}`}>
            <ShareButton
              title="PIP Eligibility Checker"
              text="Check if you might be eligible for PIP with this free tool from PIPpal. It only takes 2 minutes."
              variant="full"
              className="w-full bg-stone-100 text-stone-700 hover:bg-stone-200" />
            
          </div>
        </div>
      </div>);

  }
  // CONDITIONS SCREEN
  if (phase === 'conditions') {
    return (
      <div className="flex flex-col h-full bg-stone-50">
        <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100">
          <button
            onClick={handleBack}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-stone-900 text-lg">Quick Assessment</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 leading-tight mb-2">
              First, do any of these affect you?
            </h2>
            <p className="text-stone-500 text-sm leading-relaxed">
              Select anything that applies — even if you're not sure it
              "counts". Many people qualify without realising.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map((c) => {
              const selected = selectedConditions.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => toggleCondition(c)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${selected ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-stone-700 border-stone-200 hover:border-teal-300'}`}>
                  
                  {selected &&
                  <Check className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                  }
                  {c}
                </button>);

            })}
          </div>

          {/* Custom condition input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Don't see yours? Type it here..."
              value={customCondition}
              onChange={(e) => setCustomCondition(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomCondition()}
              className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-stone-400" />
            
            <button
              onClick={addCustomCondition}
              disabled={!customCondition.trim()}
              className="bg-teal-600 text-white px-3 py-2.5 rounded-xl hover:bg-teal-700 disabled:opacity-40 disabled:bg-stone-300 transition-colors">
              
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Encouragement card */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>You don't need a diagnosis</strong> to claim PIP. If a
              condition affects your daily life, that's what matters. Mental
              health conditions qualify just as much as physical ones.
            </p>
          </div>
        </div>

        <div className="p-5 md:px-8 bg-white border-t border-stone-100">
          <button
            onClick={startQuestions}
            disabled={selectedConditions.length === 0}
            className="w-full bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-lg hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>);

  }
  // QUESTIONS SCREEN
  const question = questions[currentIndex];
  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100">
        <button
          onClick={handleBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
          
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 transition-all duration-300 rounded-full"
              style={{
                width: `${(currentIndex + 1) / questions.length * 100}%`
              }} />
            
          </div>
        </div>
        <span className="text-xs font-medium text-stone-500 w-8 text-right">
          {currentIndex + 1}/{questions.length}
        </span>
      </div>

      <div className="flex-1 px-5 md:px-8 py-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{
              opacity: 0,
              x: 20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            exit={{
              opacity: 0,
              x: -20
            }}
            transition={{
              duration: 0.2
            }}
            className="space-y-5">
            
            <div>
              <h2 className="text-xl font-bold text-stone-900 leading-tight mb-2">
                {question.text}
              </h2>
              <p className="text-sm text-stone-500 leading-relaxed">
                {question.hint}
              </p>
            </div>

            {/* Case Study */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-900">
                    {question.caseStudy.name}
                  </span>
                  {question.caseStudy.condition &&
                  <span className="text-[10px] text-blue-600 ml-1.5">
                      · {question.caseStudy.condition}
                    </span>
                  }
                </div>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed italic">
                {question.caseStudy.quote}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {question.options.map((opt, i) =>
              <button
                key={i}
                onClick={() => handleAnswer(opt.score)}
                className="w-full text-left bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:border-teal-500 hover:ring-1 hover:ring-teal-500 active:scale-[0.98] transition-all">
                
                  <span className="font-medium text-stone-800 text-sm">
                    {opt.text}
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>);

}