import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  FileText,
  Clock,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  FileSearch,
  ListChecks,
  MailWarning,
  Download,
  MessageSquare,
  ExternalLink,
  Upload,
  ImagePlus,
  X,
  Sparkles } from
'lucide-react';
import { useAppContext } from './AppContext';
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
      // Convert images to base64
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
          message: `The user has uploaded screenshots of their PIP decision letter for ${context}. Please analyse the content carefully and provide specific, actionable feedback on: 1) The reasons given for the decision, 2) Which descriptors were scored and whether they seem correct, 3) What the user should challenge and why, 4) What evidence or arguments would strengthen their case. Be direct and practical. Plain English only, no ** or !!`,
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
        <p className="text-xs text-stone-500 leading-relaxed">Upload a photo or screenshot of your PIP decision letter. We will analyse it and tell you exactly what to challenge and how.</p>

        {/* Upload area */}
        {images.length < 5 && (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-stone-200 rounded-xl py-4 flex flex-col items-center gap-2 hover:border-teal-400 hover:bg-teal-50 transition-colors"
          >
            <Upload className="w-5 h-5 text-stone-400" />
            <p className="text-xs font-medium text-stone-500">Tap to upload photos ({images.length}/5)</p>
            <p className="text-[10px] text-stone-400">JPG, PNG or PDF</p>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*,.pdf" multiple className="hidden"
          onChange={e => handleFiles(e.target.files)} />

        {/* Preview thumbnails */}
        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <img src={img.preview} alt="" className="w-16 h-16 object-cover rounded-lg border border-stone-200" />
                <button onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center">
                  <X className="w-2.5 h-2.5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Analyse button */}
        {images.length > 0 && !feedback && (
          <button onClick={analyseScreenshots} disabled={isAnalysing}
            className="w-full bg-teal-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-teal-800 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {isAnalysing ? <><span className="animate-spin">✨</span> Analysing...</> : <><Sparkles className="w-4 h-4" /> Analyse my letter</>}
          </button>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <p className="text-xs font-bold text-stone-700 mb-2">Feedback on your letter</p>
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
  const { goBack, navigateTo } = useAppContext();
  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all active:scale-95">
          
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">
          Mandatory Reconsideration
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 space-y-6">

        <div className="bg-amber-600 rounded-2xl p-6 text-white shadow-sm">
          <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">Challenge your decision</h2>
          <p className="text-amber-50 text-sm leading-relaxed">
            If you disagree with your PIP decision, a Mandatory Reconsideration
            (MR) is the first step to challenging it.
          </p>
        </div>

        {/* Screenshot upload section */}
        <ScreenshotFeedback navigateTo={navigateTo} context="mandatory reconsideration" />

        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-stone-900 text-sm mb-1">
              Strict Deadline
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              You have exactly <strong>1 month</strong> from the date on your
              decision letter to request an MR. Don't delay.
            </p>
          </div>
        </div>

        {/* Get the PA4 Report First */}
        <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-rose-900 text-sm">
              CRITICAL: Get the "PA4" Report First
            </h3>
          </div>
          <p className="text-sm text-rose-800 leading-relaxed mb-3">
            Before you write a single word, call the DWP (0800 121 4433) and
            request the <strong>Assessment Report (PA4)</strong> via a Subject
            Access Request. This is the document the health professional wrote
            after your assessment.
          </p>
          <div className="bg-white/60 rounded-xl p-3 border border-rose-200">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-900 leading-relaxed">
                <strong>Insider Tip:</strong> Most MRs fail because people argue
                against the "Decision Letter" instead of the "Assessment
                Report." The report contains the specific justifications the
                assessor used. You need to find exactly where they misunderstood
                you and highlight those specific errors.
              </p>
            </div>
          </div>
        </div>

        {/* The SAFES Reliability Rule */}
        <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-indigo-900 text-sm">
              The "SAFES" Reliability Rule
            </h3>
          </div>
          <p className="text-sm text-indigo-800 leading-relaxed mb-4">
            This is the most powerful legal tool in your arsenal. The DWP can
            only say you can do a task if you can do it{' '}
            <strong>RELIABLY</strong>. If you fail ANY of these, you cannot do
            the activity reliably:
          </p>
          <div className="space-y-2">
            <div className="flex gap-3 bg-white rounded-lg p-2.5 border border-indigo-100">
              <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 font-black flex items-center justify-center shrink-0">
                S
              </div>
              <div>
                <div className="text-xs font-bold text-indigo-900">Safely</div>
                <div className="text-[11px] text-indigo-700">
                  Without risk of harm, falls, or danger to yourself or others.
                </div>
              </div>
            </div>
            <div className="flex gap-3 bg-white rounded-lg p-2.5 border border-indigo-100">
              <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 font-black flex items-center justify-center shrink-0">
                A
              </div>
              <div>
                <div className="text-xs font-bold text-indigo-900">
                  Acceptable Standard
                </div>
                <div className="text-[11px] text-indigo-700">
                  Not just "getting by" or doing a poor job of it.
                </div>
              </div>
            </div>
            <div className="flex gap-3 bg-white rounded-lg p-2.5 border border-indigo-100">
              <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 font-black flex items-center justify-center shrink-0">
                F
              </div>
              <div>
                <div className="text-xs font-bold text-indigo-900">
                  Frequently
                </div>
                <div className="text-[11px] text-indigo-700">
                  As many times as reasonably needed throughout the day.
                </div>
              </div>
            </div>
            <div className="flex gap-3 bg-white rounded-lg p-2.5 border border-indigo-100">
              <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 font-black flex items-center justify-center shrink-0">
                E
              </div>
              <div>
                <div className="text-xs font-bold text-indigo-900">
                  Enough Time
                </div>
                <div className="text-[11px] text-indigo-700">
                  Taking no more than twice as long as a healthy person.
                </div>
              </div>
            </div>
            <div className="flex gap-3 bg-white rounded-lg p-2.5 border border-indigo-100">
              <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 font-black flex items-center justify-center shrink-0">
                S
              </div>
              <div>
                <div className="text-xs font-bold text-indigo-900">
                  Sustainably
                </div>
                <div className="text-[11px] text-indigo-700">
                  Can you do it again tomorrow, or are you bedbound after doing
                  it once?
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tackle Descriptors Directly */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-stone-900 text-sm">
              Tackle Descriptors Directly
            </h3>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed mb-3">
            Don't just say "I struggle with cooking." Go through each activity
            where you scored 0 or fewer points than expected. For each one:
          </p>
          <ul className="space-y-2 text-sm text-stone-600">
            <li className="flex items-start gap-2">
              <span className="text-teal-600 font-bold mt-0.5">•</span>
              Explain what descriptor you believe applies and why.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 font-bold mt-0.5">•</span>
              Reference the SAFES rule to prove you can't do it reliably.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 font-bold mt-0.5">•</span>
              Use your PA4 report to identify exactly what the assessor wrote
              and counter it point by point.
            </li>
          </ul>
        </div>

        {/* What Evidence to Include */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FileSearch className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-stone-900 text-sm">
              What Evidence to Include
            </h3>
          </div>
          <ul className="space-y-3">
            {[
            'GP letters, hospital reports, or specialist letters',
            'Current prescription lists',
            'Your PIP diary entries showing daily struggles',
            'Before-and-after comparison with PA4 report findings'].
            map((item, i) =>
            <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-sm text-stone-700">{item}</span>
              </li>
            )}
          </ul>
          <div className="mt-4 bg-blue-50 rounded-xl p-3 border border-blue-100">
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>Optional but helpful:</strong> If someone who sees you
              regularly (carer, partner, support worker) is willing to write a
              short letter describing what they observe, it can strengthen your
              case — but it's not required.
            </p>
          </div>
        </div>

        {/* MR Letter Structure */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <h3 className="font-bold text-stone-900 text-sm mb-4">
            MR Letter Structure
          </h3>
          <div className="space-y-3 relative">
            <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-stone-100" />
            <div className="flex items-start gap-3 relative">
              <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center z-10 shrink-0">
                1
              </div>
              <div className="pt-1">
                <div className="text-sm font-bold text-stone-900">
                  Your Details
                </div>
                <div className="text-xs text-stone-500">
                  Name, address, NI number, and reference number.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 relative">
              <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center z-10 shrink-0">
                2
              </div>
              <div className="pt-1">
                <div className="text-sm font-bold text-stone-900">
                  State Your Request
                </div>
                <div className="text-xs text-stone-500">
                  Clearly state you are requesting a Mandatory Reconsideration.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 relative">
              <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center z-10 shrink-0">
                3
              </div>
              <div className="pt-1">
                <div className="text-sm font-bold text-stone-900">
                  Disputed Descriptors
                </div>
                <div className="text-xs text-stone-500">
                  For each one: what the assessor said → what actually happens →
                  which descriptor should apply → evidence supporting this.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 relative">
              <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center z-10 shrink-0">
                4
              </div>
              <div className="pt-1">
                <div className="text-sm font-bold text-stone-900">
                  Attach Evidence
                </div>
                <div className="text-xs text-stone-500">
                  List the evidence you have attached at the end.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lapse Letter Tip */}
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <MailWarning className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-amber-900 text-sm">
              The "Lapse Letter" Right
            </h3>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            If the DWP takes too long to process your MR (no response after ~6-8
            weeks), you can request a <strong>"lapse letter"</strong>. This
            allows you to skip the rest of the MR process and go straight to a
            tribunal appeal. This is a lesser-known but important right if
            you're stuck waiting.
          </p>
        </div>

        {/* Download Official Forms */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-stone-900 text-sm">
              Download Official Forms
            </h3>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed mb-4">
            You'll need the official <strong>CRMR1 form</strong> to request your
            Mandatory Reconsideration. Download it below, then use our chatbot
            to help you answer each section.
          </p>
          <div className="space-y-3">
            <a
              href="https://www.gov.uk/government/publications/challenge-a-personal-independence-payment-decision"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-teal-50 rounded-xl p-4 border border-teal-100 hover:bg-teal-100 transition-colors active:scale-[0.98]">
              
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-teal-700" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-stone-900">
                  CRMR1 Form
                </div>
                <p className="text-[11px] text-stone-500">
                  Official form to challenge your PIP decision — GOV.UK
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-teal-600 shrink-0" />
            </a>
            <a
              href="https://www.gov.uk/mandatory-reconsideration"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-stone-50 rounded-xl p-4 border border-stone-200 hover:bg-stone-100 transition-colors active:scale-[0.98]">
              
              <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center shrink-0">
                <FileSearch className="w-5 h-5 text-stone-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-stone-900">
                  MR Guidance
                </div>
                <p className="text-[11px] text-stone-500">
                  Full GOV.UK guide on how to request a reconsideration
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-stone-400 shrink-0" />
            </a>
          </div>
        </div>

        {/* Chatbot CTA */}
        <div className="bg-indigo-700 rounded-2xl p-5 text-white shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Need help filling it in?</h3>
              <p className="text-indigo-200 text-xs">PIP Assistant chatbot</p>
            </div>
          </div>
          <p className="text-indigo-100 text-sm leading-relaxed mb-4">
            Our PIP Assistant can help you answer each section of the CRMR1
            form. Tell it which descriptors you're challenging and it'll help
            you write clear, evidence-based responses using the SAFES rule.
          </p>
          <div className="bg-white/10 rounded-xl p-3 border border-white/10 mb-4">
            <p className="text-xs text-indigo-100 leading-relaxed">
              <strong>Try asking:</strong> "Help me challenge Activity 1 —
              preparing food. The assessor gave me 0 points but I need
              supervision to cook safely."
            </p>
          </div>
          <button
            onClick={() => navigateTo('home')}
            className="w-full bg-white text-indigo-700 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            
            <MessageSquare className="w-4 h-4" />
            Open PIP Assistant
          </button>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <h3 className="font-bold text-stone-900 text-sm mb-4">
            How to submit your MR
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-stone-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-stone-900">By Phone</div>
                <p className="text-xs text-stone-500 mb-1">
                  Call DWP on 0800 121 4433
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-stone-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-stone-900">
                  By Letter (Recommended)
                </div>
                <p className="text-xs text-stone-500">
                  Writing a letter allows you to clearly state your case and
                  provide evidence.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-stone-100 rounded-2xl p-5 border border-stone-200">
          <h3 className="font-bold text-stone-900 text-sm mb-3">
            What happens next?
          </h3>
          <div className="space-y-3 relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-stone-300" />
            <div className="flex items-start gap-3 relative">
              <div className="w-4 h-4 rounded-full bg-stone-300 border-2 border-stone-100 z-10 shrink-0 mt-0.5" />
              <div className="text-xs text-stone-700">
                DWP reviews your case again
              </div>
            </div>
            <div className="flex items-start gap-3 relative">
              <div className="w-4 h-4 rounded-full bg-stone-300 border-2 border-stone-100 z-10 shrink-0 mt-0.5" />
              <div className="text-xs text-stone-700">
                You get a new decision letter (usually 2-4 weeks)
              </div>
            </div>
            <div className="flex items-start gap-3 relative">
              <div className="w-4 h-4 rounded-full bg-stone-300 border-2 border-stone-100 z-10 shrink-0 mt-0.5" />
              <div className="text-xs text-stone-700">
                If still unhappy, you can appeal to tribunal
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigateTo('appeal')}
          className="w-full bg-white border border-stone-200 text-stone-700 py-3.5 rounded-xl font-semibold text-sm hover:bg-stone-50 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
          
          Learn about Appeals
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>);

}