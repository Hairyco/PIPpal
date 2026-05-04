import React from 'react';
import {
  ArrowLeft,
  Scale,
  Users,
  FileText,
  Phone,
  CheckCircle2,
  Clock,
  Briefcase,
  Lightbulb,
  HeartHandshake,
  CalendarCheck,
  Download,
  MessageSquare,
  ExternalLink } from
'lucide-react';
import { useAppContext } from './AppContext';
import { ScreenshotFeedback } from './MandatoryReconsiderationScreen';
export function AppealScreen() {
  const { goBack, navigateTo } = useAppContext();
  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all active:scale-95">
          
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">Appeal to Tribunal</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 space-y-6">
        <div className="bg-rose-700 rounded-2xl p-5 text-white">
          <h2 className="text-xl font-bold mb-1">Take your case to tribunal</h2>
          <p className="text-rose-100 text-sm leading-relaxed">If your Mandatory Reconsideration was unsuccessful, you can appeal to an independent tribunal. <strong className="text-white">60% of appeals succeed.</strong></p>
        </div>

        {/* Screenshot upload section */}
        <ScreenshotFeedback navigateTo={navigateTo} context="appeal" />

        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex items-center gap-4">
          <div className="text-3xl font-black text-rose-600 shrink-0">60%</div>
          <p className="text-sm text-stone-600 leading-relaxed">of PIP appeals succeed at tribunal. The tribunal is completely independent of the DWP.</p>
        </div>

        {/* Always Choose an Oral Hearing */}
        <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-indigo-900 text-sm">
              Always Choose an Oral Hearing
            </h3>
          </div>
          <p className="text-sm text-indigo-800 leading-relaxed">
            You'll be offered a paper-based or oral (in-person/video/phone)
            hearing. <strong>ALWAYS choose oral.</strong> Success rates for oral
            hearings are significantly higher because you can explain your
            situation and the panel can ask clarifying questions. Paper hearings
            rely solely on documents.
          </p>
        </div>

        {/* The SSCS1 Form — Enhanced with downloads */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-stone-900 text-sm">
              Download Appeal Forms
            </h3>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed mb-4">
            To appeal, you need to submit form <strong>SSCS1</strong>. You can
            do this online or download the form to fill in by hand. You'll need
            your MR decision letter (called a{' '}
            <strong>'Mandatory Reconsideration Notice'</strong>).
          </p>

          <div className="space-y-3 mb-4">
            <a
              href="https://www.gov.uk/appeal-benefit-decision"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-teal-50 rounded-xl p-4 border border-teal-100 hover:bg-teal-100 transition-colors active:scale-[0.98]">
              
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-teal-700" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-stone-900">
                  SSCS1 — Submit Online
                </div>
                <p className="text-[11px] text-stone-500">
                  Fill in and submit your appeal form on GOV.UK
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-teal-600 shrink-0" />
            </a>
            <a
              href="https://www.gov.uk/government/publications/appeal-a-social-security-benefits-decision-form-sscs1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-stone-50 rounded-xl p-4 border border-stone-200 hover:bg-stone-100 transition-colors active:scale-[0.98]">
              
              <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center shrink-0">
                <Download className="w-5 h-5 text-stone-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-stone-900">
                  SSCS1 — Download PDF
                </div>
                <p className="text-[11px] text-stone-500">
                  Download the form to print and fill in by hand
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-stone-400 shrink-0" />
            </a>
            <a
              href="https://www.gov.uk/government/publications/appeal-a-social-security-benefits-decision-form-sscs1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-stone-50 rounded-xl p-4 border border-stone-200 hover:bg-stone-100 transition-colors active:scale-[0.98]">
              
              <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-stone-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-stone-900">
                  SSCS1 Guidance Notes
                </div>
                <p className="text-[11px] text-stone-500">
                  How to fill in the appeal form — step by step
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-stone-400 shrink-0" />
            </a>
          </div>

          <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-3 border border-amber-100">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              You have exactly <strong>1 month</strong> from the date on your MR
              decision letter to submit your appeal.
            </p>
          </div>
        </div>

        {/* Chatbot CTA */}
        <div className="bg-rose-800 rounded-2xl p-5 text-white shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Need help with the SSCS1?</h3>
              <p className="text-rose-200 text-xs">PIP Assistant chatbot</p>
            </div>
          </div>
          <p className="text-rose-100 text-sm leading-relaxed mb-4">
            The SSCS1 form asks you to explain why you disagree with the
            decision. Our PIP Assistant can help you write clear, structured
            reasons for each descriptor you're challenging — using the SAFES
            rule and referencing your PA4 report.
          </p>
          <div className="bg-white/10 rounded-xl p-3 border border-white/10 mb-4">
            <p className="text-xs text-rose-100 leading-relaxed">
              <strong>Try asking:</strong> "Help me write my SSCS1 appeal
              reasons. I was refused PIP but I struggle with washing, dressing,
              and preparing food. The assessor said I can do these things but I
              can't do them safely or reliably."
            </p>
          </div>
          <button
            onClick={() => navigateTo('home')}
            className="w-full bg-white text-rose-800 py-3 rounded-xl font-bold text-sm hover:bg-rose-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            
            <MessageSquare className="w-4 h-4" />
            Open PIP Assistant
          </button>
        </div>

        {/* What happens at tribunal? */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <h3 className="font-bold text-stone-900 text-sm mb-4">
            What happens at tribunal?
          </h3>
          <ul className="space-y-3">
            {[
            'Panel of 3 (judge, doctor, disability expert)',
            'They are independent and genuinely want to understand your situation',
            "They'll ask about your daily life",
            'Usually takes 30-60 minutes'].
            map((item, i) =>
            <li key={i} className="flex items-start gap-2.5">
                <Users className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                <span className="text-sm text-stone-700">{item}</span>
              </li>
            )}
          </ul>
        </div>

        {/* DWP Presenting Officer Tip */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 shadow-sm">
          <div className="flex items-start gap-3">
            <Briefcase className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 text-sm mb-1">
                The DWP Presenting Officer
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                The DWP may send a "presenting officer" to argue their case.
                Don't be intimidated — the tribunal panel often challenges the
                DWP's position. If they don't send one (which is common), that's
                actually a good sign.
              </p>
            </div>
          </div>
        </div>

        {/* What to Bring & How to Prepare */}
        <div className="bg-stone-100 rounded-2xl p-5 border border-stone-200">
          <h3 className="font-bold text-stone-900 text-sm mb-3">
            How to Prepare & What to Bring
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm text-stone-700">
              <CheckCircle2 className="w-4.5 h-4.5 text-stone-500 shrink-0 mt-0.5" />
              <span>
                <strong>Bring your documents:</strong> PA4 assessment report, MR
                letter, all medical evidence, PIP diary, and medication list.
              </span>
            </li>
            <li className="flex items-start gap-2 text-sm text-stone-700">
              <CheckCircle2 className="w-4.5 h-4.5 text-stone-500 shrink-0 mt-0.5" />
              <span>
                <strong>Bring support:</strong> You can bring a friend, family
                member, or carer for support.
              </span>
            </li>
            <li className="flex items-start gap-2 text-sm text-stone-700">
              <CheckCircle2 className="w-4.5 h-4.5 text-stone-500 shrink-0 mt-0.5" />
              <span>
                <strong>Prepare your arguments:</strong> For each disputed
                descriptor, write down what the assessor said vs what actually
                happens on your worst days (using the SAFES rule).
              </span>
            </li>
            <li className="flex items-start gap-2 text-sm text-stone-700">
              <CheckCircle2 className="w-4.5 h-4.5 text-stone-500 shrink-0 mt-0.5" />
              <span>
                <strong>Practice:</strong> Practice explaining your worst days
                out loud. Don't minimize — describe reality.
              </span>
            </li>
          </ul>
        </div>

        {/* Free Representation */}
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <HeartHandshake className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-blue-900 text-sm">
              Free Representation is Available
            </h3>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed mb-4">
            You don't have to do this alone. Citizens Advice can sometimes
            provide a tribunal representative. Also check local welfare rights
            services (usually run by local councils), disability charities like
            Scope or Mind, or condition-specific charities. Some areas even have
            free legal aid for tribunal representation.
          </p>
          <a
            href="tel:08001448848"
            className="flex items-center justify-center gap-2 w-full bg-white text-blue-700 py-3 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors border border-blue-200">
            
            <Phone className="w-4 h-4" />
            Citizens Advice: 0800 144 8848
          </a>
        </div>

        {/* After the Hearing */}
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CalendarCheck className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-stone-900 text-sm">
              After the Hearing
            </h3>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed mb-2">
            You will usually get the decision by post within 1-2 weeks,
            sometimes even on the day.
          </p>
          <ul className="space-y-2 text-sm text-stone-600">
            <li className="flex items-start gap-2">
              <span className="text-teal-600 font-bold mt-0.5">•</span>
              <strong>If successful:</strong> Payments are backdated to when you
              first claimed.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 font-bold mt-0.5">•</span>
              <strong>If unsuccessful:</strong> You can request permission to
              appeal to the Upper Tribunal on a point of law (this is rare and
              complex — seek legal advice).
            </li>
          </ul>
        </div>
      </div>
    </div>);

}