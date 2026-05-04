import React, { useState, useRef } from 'react';
import {
  ArrowLeft, FileText, Clock, Phone, ArrowRight, CheckCircle2,
  AlertTriangle, FileSearch, Download, MessageSquare, ExternalLink,
  ImagePlus, Upload, X, Sparkles, ChevronDown,
} from 'lucide-react';
import { useAppContext } from './AppContext';
import { useEffect } from 'react';

// Screenshot analysis component — shared with AppealScreen
export function ScreenshotFeedback({ navigateTo, context }: { navigateTo: (s: any) => void; context: string }) {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newImages = Array.from(files).slice(0, 5 - images.length).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(prev => [...prev, ...newImages].slice(0, 5));
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setFeedback(null);
  };

  const analyseScreenshots = async () => {
    if (images.length === 0) return;
    setIsAnalysing(true);
    setFeedback(null);
    try {
      const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });
      const base64Images = await Promise.all(images.map(img => toBase64(img.file)));
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `The user has uploaded screenshots of their PIP decision letter for ${context}. Analyse carefully and provide specific, actionable feedback on: 1) The reasons given for the decision, 2) Which descriptors were scored and whether they seem correct, 3) What the user should challenge and why, 4) What evidence or arguments would strengthen their case. Be direct and practical. Plain English only, no ** or !!`,
          medProfile: { conditions: [], medications: '', notes: '' },
          conversationHistory: [],
          imageData: base64Images,
        }),
      });
      const data = await response.json();
      setFeedback(data.reply || 'Could not analyse the screenshots. Please try again.');
    } catch {
      setFeedback('Something went wrong. Please try again.');
    } finally {
      setIsAnalysing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-teal-700 flex items-center gap-2">
        <ImagePlus className="w-4 h-4 text-white shrink-0" />
        <p className="text-sm font-bold text-white">Upload your decision letter</p>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-xs text-stone-500 leading-relaxed">Upload a photo or screenshot of your PIP decision letter. We'll analyse it and tell you exactly what to challenge and how.</p>
        {images.length < 5 && (
          <button onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-stone-200 rounded-xl py-4 flex flex-col items-center gap-2 hover:border-teal-400 hover:bg-teal-50 transition-colors">
            <Upload className="w-5 h-5 text-stone-400" />
            <p className="text-xs font-medium text-stone-500">Tap to upload photos ({images.length}/5)</p>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*,.pdf" multiple className="hidden"
          onChange={e => handleFiles(e.target.files)} />
        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <img src={img.preview} alt="" className="w-16 h-16 object-cover rounded-lg border border-stone-200" />
                <button onClick={() => removeImage(i)} className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center">
                  <X className="w-2.5 h-2.5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        {images.length > 0 && !feedback && (
          <button onClick={analyseScreenshots} disabled={isAnalysing}
            className="w-full bg-teal-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-teal-800 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {isAnalysing ? <><span className="animate-spin">✨</span> Analysing...</> : <><Sparkles className="w-4 h-4" /> Analyse my letter</>}
          </button>
        )}
        {feedback && (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <p className="text-xs font-bold text-stone-700 mb-2">Analysis of your letter</p>
            <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">{feedback}</p>
            <button onClick={() => { setFeedback(null); setImages([]); }}
              className="mt-3 text-xs text-teal-600 font-medium hover:text-teal-800">Upload different screenshots →</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function MandatoryReconsiderationScreen() {
  const { goBack, navigateTo, savedAnswers, medProfile } = useAppContext();
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [mrLetter, setMrLetter] = useState<string | null>(null);
  const [letterCopied, setLetterCopied] = useState(false);
  const [disputedActivities, setDisputedActivities] = useState<{activity: string, dwpScore: string, expectedScore: string, reason: string}[]>([]);
  const [decisionDetails, setDecisionDetails] = useState('');
  const hasAnswers = Object.keys(savedAnswers || {}).length > 0;

  const generateLetter = async () => {
    setGeneratingLetter(true);
    setMrLetter(null);
    try {
      const res = await fetch('/api/generate-mr-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ savedAnswers, medProfile, decisionDetails, disputedActivities }),
      });
      const data = await res.json();
      setMrLetter(data.letter || 'Could not generate letter. Please try again.');
    } catch {
      setMrLetter('Something went wrong. Please try again.');
    } finally {
      setGeneratingLetter(false);
    }
  };

  const copyLetter = () => {
    if (!mrLetter) return;
    navigator.clipboard?.writeText(mrLetter);
    setLetterCopied(true);
    setTimeout(() => setLetterCopied(false), 2000);
  };
  const [showStructure, setShowStructure] = useState(false);

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">Mandatory Reconsideration</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 space-y-4">

        {/* Hero */}
        <div className="bg-amber-600 rounded-2xl p-5 text-white">
          <h2 className="text-xl font-bold mb-1">Challenge your decision</h2>
          <p className="text-amber-100 text-sm leading-relaxed">If you disagree with your PIP decision, a Mandatory Reconsideration (MR) is the first step. You have <strong className="text-white">1 month</strong> from the date on your decision letter — don't delay.</p>
        </div>

        {/* Step 1 — Get PA4 first */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <div>
              <p className="font-bold text-stone-900 text-sm mb-1">Get your PA4 report first</p>
              <p className="text-xs text-stone-500 leading-relaxed mb-2">Your assessment was carried out by a private contractor (such as Capita or Maximus) — not DWP. The contractor's health professional wrote the PA4 report, then a <strong>DWP case worker made the final decision</strong> based on it. Request the PA4 under a Subject Access Request — you must challenge what the contractor wrote, not just the decision letter.</p>
              <a href="tel:08001214433" className="inline-flex items-center gap-1.5 bg-stone-100 text-stone-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-stone-200 transition-colors">
                <Phone className="w-3.5 h-3.5" />
                0800 121 4433 — DWP
              </a>
            </div>
          </div>
        </div>

        {/* Upload letter for PIPpal analysis */}
        <ScreenshotFeedback navigateTo={navigateTo} context="mandatory reconsideration" />

        {/* Step 2 — Write your MR */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-stone-900 text-sm mb-1">Write your MR letter</p>
              <p className="text-xs text-stone-500 leading-relaxed mb-3">For each activity where you scored fewer points than expected: state what the assessor said, what actually happens on your worst days, and which descriptor you believe should apply.</p>

              {/* MR letter structure — collapsible */}
              <button onClick={() => setShowStructure(!showStructure)}
                className="w-full flex items-center justify-between bg-stone-50 rounded-xl px-3 py-2.5 hover:bg-stone-100 transition-colors mb-2">
                <span className="text-xs font-bold text-stone-700">Letter structure guide</span>
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${showStructure ? 'rotate-180' : ''}`} />
              </button>

              {showStructure && (
                <div className="space-y-2 mb-3">
                  {[
                    ['1', 'Your details', 'Name, address, NI number, reference number from decision letter'],
                    ['2', 'State your request', 'Clearly say you are requesting a Mandatory Reconsideration'],
                    ['3', 'Each disputed activity', 'What the assessor said → what actually happens → which descriptor applies → why (use SAFES rule)'],
                    ['4', 'Evidence list', 'List any supporting evidence you are attaching'],
                  ].map(([num, title, desc]) => (
                    <div key={num} className="flex gap-2.5 items-start bg-stone-50 rounded-lg p-2.5">
                      <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center shrink-0">{num}</div>
                      <div>
                        <p className="text-xs font-bold text-stone-800">{title}</p>
                        <p className="text-[11px] text-stone-500 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[11px] text-stone-500 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                <strong>The SAFES rule:</strong> DWP can only say you can do a task if you can do it Safely, to an Acceptable standard, Frequently, in Enough time, and Sustainably. If you fail any one of these — you cannot do it reliably.
              </p>
            </div>
          </div>
        </div>

        {/* MR Letter Generator */}
        <div className="bg-teal-700 rounded-2xl overflow-hidden">
          <div className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-base">PIPpal writes your MR letter</p>
                <p className="text-teal-100 text-xs leading-relaxed mt-0.5">
                  {hasAnswers
                    ? 'We use your saved PIP answers to write a complete, personalised MR letter. Just tell us what DWP got wrong.'
                    : 'Complete your PIP questions first — we use your answers to write a personalised letter.'}
                </p>
              </div>
            </div>

            {!hasAnswers ? (
              <button onClick={() => navigateTo('question_index')}
                className="w-full bg-white text-teal-700 py-3 rounded-xl font-bold text-sm hover:bg-teal-50 transition-all flex items-center justify-center gap-2">
                Complete my PIP answers first →
              </button>
            ) : !mrLetter ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-teal-100 mb-1.5 block">What did DWP say? (optional — paste key lines from your decision letter)</label>
                  <textarea
                    value={decisionDetails}
                    onChange={e => setDecisionDetails(e.target.value)}
                    placeholder="e.g. 'DWP scored me 4 points for preparing food but I believe I should score 8 as I cannot cook safely without supervision...'"
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-teal-300 focus:outline-none focus:border-white/40 resize-none"
                  />
                </div>
                <button onClick={generateLetter} disabled={generatingLetter}
                  className="w-full bg-white text-teal-700 py-3.5 rounded-xl font-bold text-base hover:bg-teal-50 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {generatingLetter ? (
                    <><span className="animate-spin">✨</span> Writing your letter...</>
                  ) : (
                    <>✨ Write my MR letter</>
                  )}
                </button>
                <p className="text-teal-200 text-[10px] text-center">Takes about 10 seconds · Uses your saved answers</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-white/10 rounded-xl p-4 max-h-72 overflow-y-auto">
                  <pre className="text-xs text-teal-50 leading-relaxed whitespace-pre-wrap font-sans">{mrLetter}</pre>
                </div>
                <div className="flex gap-2">
                  <button onClick={copyLetter}
                    className="flex-1 bg-white text-teal-700 py-3 rounded-xl font-bold text-sm hover:bg-teal-50 transition-all flex items-center justify-center gap-2">
                    {letterCopied ? '✓ Copied!' : '📋 Copy letter'}
                  </button>
                  <button onClick={() => setMrLetter(null)}
                    className="px-4 py-3 bg-white/20 text-white rounded-xl text-sm font-bold hover:bg-white/30 transition-all">
                    Regenerate
                  </button>
                </div>
                <p className="text-teal-200 text-[10px] text-center">Review carefully before sending. Add your personal details where shown in brackets.</p>
              </div>
            )}
          </div>
        </div>

        {/* Step 3 — Evidence */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">3</span>
            </div>
            <div>
              <p className="font-bold text-stone-900 text-sm mb-2">Gather your evidence</p>
              <div className="space-y-1.5">
                {[
                  'GP letters, hospital reports, or specialist letters',
                  'Current prescription list',
                  'PIP diary entries showing your worst days',
                  'Your PA4 report with specific errors highlighted',
                  'Letter from carer, partner or support worker (optional but helpful)',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-stone-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 — Submit */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">4</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-stone-900 text-sm mb-2">Submit your MR</p>
              <div className="space-y-3">
                <a href="https://www.gov.uk/government/publications/challenge-a-personal-independence-payment-decision"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-teal-50 rounded-xl p-3 border border-teal-100 hover:bg-teal-100 transition-colors">
                  <Download className="w-4 h-4 text-teal-700 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-stone-900">Download CRMR1 form</p>
                    <p className="text-[10px] text-stone-500">Official MR request form — GOV.UK</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-teal-500 ml-auto shrink-0" />
                </a>
                <p className="text-xs text-stone-500 leading-relaxed">
                  <strong>By letter is recommended</strong> — it lets you clearly make your case and attach evidence. Keep a copy of everything you send.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lapse letter tip */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex gap-3">
          <AlertTriangle className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
          <p className="text-xs text-stone-600 leading-relaxed">
            <strong>Waiting more than 6–8 weeks with no response?</strong> You can request a "lapse letter" from DWP — this lets you skip the rest of the MR process and go straight to tribunal.
          </p>
        </div>

        {/* What happens next */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <p className="font-bold text-stone-900 text-sm mb-3">What happens after you submit</p>
          <div className="space-y-2">
            {[
              'DWP reviews your claim again — usually 2–4 weeks',
              'You receive a new decision letter',
              'If the outcome improves — your payments adjust from that date',
              'If still refused — you can appeal to an independent tribunal',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-stone-100 text-stone-500 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                <span className="text-xs text-stone-600 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Appeal link */}
        <button onClick={() => navigateTo('appeal')}
          className="w-full bg-white border border-stone-200 text-stone-700 py-3.5 rounded-xl font-semibold text-sm hover:bg-stone-50 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
          If MR fails — learn about Appeals
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
