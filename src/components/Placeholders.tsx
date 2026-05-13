import React, { useState } from 'react';
import {
  ArrowLeft,
  Download,
  FileText,
  ExternalLink,
  Shield,
  Eye,
  Lock,
  Mail,
  BookOpen,
  Users,
  Heart,
  Settings,
  Type,
  Volume2,
  Smartphone,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Phone,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { useAppContext } from './AppContext';

function ScreenHeader({ title }: { title: string }) {
  const { goBack } = useAppContext();
  return (
    <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
      <button
        onClick={goBack}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h1 className="font-bold text-stone-900 text-lg">{title}</h1>
    </div>
  );
}


// ─── DOWNLOADS ─────────────────────────────────────────────────────────────────
export function Downloads() {
  const { hasPaid, navigateTo } = useAppContext();
  const govLinks = [
    { label: 'PIP claim form (PIP2)', url: 'https://www.gov.uk/government/publications/personal-independence-payment-pip-1', desc: 'Official DWP PIP2 form' },
    { label: 'How PIP is assessed (PIP1)', url: 'https://www.gov.uk/pip/how-youre-assessed', desc: 'Official assessment guide' },
    { label: 'Appeal a PIP decision', url: 'https://www.gov.uk/appeal-benefit-decision', desc: 'Official tribunal appeal form' },
  ];

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <ScreenHeader title="Downloads" />
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-10 px-5 md:px-8 py-6 space-y-6 max-w-2xl mx-auto">
        <section>
          <h2 className="text-sm font-bold text-stone-900 mb-3">Your answers</h2>
          {hasPaid ? (
            <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-teal-600" /></div>
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900 text-sm">Export my PIP answers</h3>
                <p className="text-xs text-stone-500 mt-0.5">Download all your question answers as a PDF</p>
              </div>
              <button className="bg-teal-700 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-teal-800 transition-colors flex items-center gap-1.5"><Download className="w-3.5 h-3.5" />Export</button>
            </div>
          ) : (
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 text-center">
              <Lock className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-600 mb-1">Full Access required</p>
              <p className="text-xs text-stone-500 mb-3">Unlock to export your answers as a PDF</p>
              <button onClick={() => navigateTo('upsell')} className="bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-teal-800 transition-colors">Unlock Full Access — £12.99</button>
            </div>
          )}
        </section>
        <section>
          <h2 className="text-sm font-bold text-stone-900 mb-3">PIP Diary template</h2>
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center shrink-0"><BookOpen className="w-5 h-5 text-emerald-600" /></div>
            <div className="flex-1">
              <h3 className="font-semibold text-stone-900 text-sm">Blank weekly diary template</h3>
              <p className="text-xs text-stone-500 mt-0.5">Print and fill in by hand — matches the official DWP format</p>
            </div>
            <button
              onClick={() => {
                const ACTIVITIES = ['Preparing food','Eating and drinking','Managing treatments','Washing and bathing','Managing toilet needs','Dressing and undressing','Talking, listening and understanding','Reading','Mixing with other people','Making decisions about money','Going out','Moving around'];
                const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
                const rowsHtml = DAYS.map(day => `<tr><td class="day-cell">${day}</td>${ACTIVITIES.map(() => '<td class="note-cell"></td>').join('')}</tr>`).join('');
                const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>PIP Weekly Diary</title><style>body{font-family:Arial,sans-serif;margin:15mm;color:#000;font-size:10px}.doc-header{margin-bottom:14px;border-bottom:2px solid #000;padding-bottom:10px}.doc-header h1{font-size:18px;font-weight:bold;margin:0 0 10px 0}.field-row{display:flex;gap:30px;margin-bottom:8px}.field{display:flex;align-items:center;gap:6px}.field label{font-weight:bold;font-size:10px;white-space:nowrap}.field .line{border-bottom:1px solid #000;min-width:160px;height:16px}.instructions{font-size:10px;margin-bottom:14px;line-height:1.5;border-bottom:1px solid #000;padding-bottom:8px}.week-label{font-size:12px;font-weight:bold;margin-bottom:10px;background:#f5f5f5;padding:4px 8px;border:1px solid #000}table{width:100%;border-collapse:collapse;table-layout:fixed}th{border:1px solid #000;padding:4px 3px;text-align:left;font-size:9px;font-weight:bold}th.day-header{width:55px}td{border:1px solid #000;padding:3px;vertical-align:top;height:70px;font-size:9px}td.day-cell{font-weight:bold;width:55px}@media print{body{margin:10mm}}</style></head><body><div class="doc-header"><h1>PIP Weekly Diary</h1><div class="field-row"><div class="field"><label>Full name:</label><div class="line"></div></div><div class="field"><label>National Insurance number:</label><div class="line" style="min-width:130px"></div></div></div><div class="field-row"><div class="field"><label>Date of birth:</label><div class="line" style="min-width:100px"></div></div><div class="field"><label>Week beginning:</label><div class="line" style="min-width:130px"></div></div></div></div><p class="instructions">Use this diary to record how your condition affects you each day. For each activity describe what happened — whether you could do it safely, if you needed help, or if you used any aids. Focus on your worst days. This diary can be submitted as supporting evidence with your PIP claim.</p><div class="week-label">Weekly diary</div><table><thead><tr><th class="day-header">Day</th>${ACTIVITIES.map(a => `<th>${a}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
                const newTab = window.open('', '_blank');
                if (newTab) { newTab.document.write(html); newTab.document.close(); }
              }}
              className="bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />Download
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold text-stone-900 mb-3">Official DWP forms</h2>
          <div className="space-y-3">
            {govLinks.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-stone-100 shadow-sm hover:border-teal-200 transition-all active:scale-[0.98]">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0"><ExternalLink className="w-5 h-5 text-blue-600" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-900 text-sm truncate">{link.label}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">{link.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
              </a>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-sm font-bold text-stone-900 mb-3">Get more help</h2>
          <div className="space-y-3">
            {[
              { name: 'Citizens Advice', desc: 'Free, independent benefits advice', url: 'https://www.citizensadvice.org.uk' },
              { name: 'Turn2us', desc: 'Benefits calculator and grants finder', url: 'https://www.turn2us.org.uk' },
              { name: 'Scope', desc: 'Disability charity — PIP help & support', url: 'https://www.scope.org.uk' },
            ].map((org, i) => (
              <a key={i} href={org.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-stone-100 shadow-sm hover:border-teal-200 transition-all active:scale-[0.98]">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center shrink-0"><Heart className="w-5 h-5 text-emerald-600" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-900 text-sm">{org.name}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">{org.desc}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-stone-400 shrink-0" />
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── CLAIM STEPS ───────────────────────────────────────────────────────────────
export function ClaimSteps() {
  const steps = [
    { step: '1', title: 'Call to start your claim', body: "Call the PIP claim line on 0800 917 2222. You'll be asked basic questions and sent a PIP2 form. You have 1 month to return it.", color: 'bg-teal-600' },
    { step: '2', title: 'Complete the PIP2 form', body: "This is the most important part. Describe how your condition affects you on your worst days. Use PIPpal's 12-question guide to help.", color: 'bg-blue-600' },
    { step: '3', title: 'Attend your assessment', body: "A healthcare professional will assess how your condition affects your daily life. Use PIPpal's Assessment Prep guide to prepare.", color: 'bg-purple-600' },
    { step: '4', title: 'Receive your decision', body: "The DWP will write to you with their decision. If awarded, they'll tell you how much and for how long.", color: 'bg-amber-600' },
    { step: '5', title: "If you're refused — challenge it", body: 'Many appeals are overturned. Request a Mandatory Reconsideration first, then appeal to tribunal if needed.', color: 'bg-rose-600' },
  ];

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <ScreenHeader title="Claim Steps" />
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-10 px-5 md:px-8 py-6 max-w-2xl mx-auto">
        <p className="text-sm text-stone-500 mb-6 leading-relaxed">Here's the full PIP claim journey from start to finish — so you know exactly what to expect at every stage.</p>
        <div className="space-y-4">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 ${s.color} rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}>{s.step}</div>
                {i < steps.length - 1 && <div className="w-0.5 flex-1 bg-stone-200 mt-2" />}
              </div>
              <div className="flex-1 pb-4">
                <h3 className="font-bold text-stone-900 text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ABOUT ─────────────────────────────────────────────────────────────────────
export function AboutScreen() {
  const { navigateTo } = useAppContext();
  return (
    <div className="flex flex-col h-full bg-stone-50">
      <ScreenHeader title="About PIPpal" />
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-10 px-5 md:px-8 py-6 max-w-2xl mx-auto space-y-6">
        <div className="bg-teal-700 rounded-2xl p-6 text-white text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3"><Heart className="w-7 h-7 text-white" /></div>
          <h2 className="text-xl font-bold mb-2">PIPpal</h2>
          <p className="text-teal-100 text-sm leading-relaxed">Built to help people in the UK navigate the PIP claims process with confidence.</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm space-y-4">
          <h3 className="font-bold text-stone-900 text-sm">Our mission</h3>
          <p className="text-sm text-stone-600 leading-relaxed">PIP (Personal Independence Payment) is one of the most important benefits available to disabled people in the UK — but the claims process is complicated, stressful, and often unfair.</p>
          <p className="text-sm text-stone-600 leading-relaxed">PIPpal exists to level the playing field. We give you the same quality of guidance that people with access to specialist advice workers get — but available to everyone, at any time, for a fraction of the cost.</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <h3 className="font-bold text-stone-900 text-sm mb-3">Important disclaimer</h3>
          <p className="text-xs text-stone-500 leading-relaxed">PIPpal provides guidance and tools to help you understand and navigate the PIP claims process. We are not a law firm, benefits advice agency, or medical service. The information provided is for educational purposes only and does not constitute legal or financial advice. Always consult a qualified benefits adviser for complex situations.</p>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={() => navigateTo('privacy')} className="w-full bg-white border border-stone-200 rounded-xl py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-stone-400" />Privacy Policy
          </button>
          <button onClick={() => navigateTo('terms' as any)} className="w-full bg-white border border-stone-200 rounded-xl py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2">
            <FileText className="w-4 h-4 text-stone-400" />Terms of Service
          </button>
          <a href="mailto:support@pippal.uk" className="w-full bg-white border border-stone-200 rounded-xl py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-center gap-2">
            <Mail className="w-4 h-4 text-stone-400" />Contact us
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── PRIVACY ───────────────────────────────────────────────────────────────────
export function PrivacyScreen() {
  const sections = [
    { icon: FileText, title: '1. Who we are', body: 'PIPpal is operated as a sole trader business in the United Kingdom. Our contact email is support@pippal.uk. We are the data controller for any personal data you provide when using our service.' },
    { icon: FileText, title: '2. What data we collect', body: 'We collect: your name and email address when you create an account; your PIP question answers, medical profile information, and PIP diary entries that you choose to enter; payment information processed securely by Stripe (we never see or store your card details); and technical data such as your IP address and browser type for security purposes.' },
    { icon: Lock, title: '3. How we use your data', body: 'We use your data solely to provide the PIPpal service — to save your progress, personalise your guidance, and process your payment. We never sell your data to third parties, use it for advertising, or share it with anyone outside of the services required to run PIPpal (Supabase for data storage, Stripe for payments).' },
    { icon: Shield, title: '4. Legal basis for processing', body: 'We process your data under the following legal bases: Contract — to fulfil our service agreement with you; Legitimate interests — to improve our service and prevent fraud; Consent — where you have explicitly agreed, for example to receive email updates.' },
    { icon: Eye, title: '5. Data retention', body: 'We retain your account data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or regulatory purposes.' },
    { icon: Shield, title: '6. How we protect your data', body: 'All data is encrypted in transit using TLS and at rest. We use Supabase for secure data storage with Row Level Security — meaning only you can ever access your own data. We conduct regular security reviews.' },
    { icon: Eye, title: '7. Your rights under UK GDPR', body: 'You have the right to: access your personal data; correct inaccurate data; delete your data ("right to be forgotten"); restrict or object to processing; data portability; and lodge a complaint with the ICO (Information Commissioner\'s Office) at ico.org.uk.' },
    { icon: Mail, title: '8. Cookies', body: 'We use only essential cookies required for authentication and security. We do not use tracking cookies or advertising cookies. You can disable cookies in your browser settings, but this may affect the functionality of PIPpal.' },
    { icon: FileText, title: '9. Third party services', body: 'We use Supabase (data storage, EU servers), Stripe (payment processing), and Vercel (hosting). Each of these providers has their own privacy policy and is GDPR compliant.' },
    { icon: Mail, title: '10. Contact & complaints', body: 'For any privacy-related queries, data access requests, or deletion requests, contact us at support@pippal.uk. You also have the right to complain to the ICO at ico.org.uk/make-a-complaint.' },
  ];

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <ScreenHeader title="Privacy Policy" />
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-10 px-5 md:px-8 py-6 max-w-2xl mx-auto space-y-4">
        <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
          <p className="text-xs text-teal-800 font-medium">Last updated: April 2026 · Governed by UK law · Compliant with UK GDPR</p>
        </div>
        {sections.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center shrink-0"><s.icon className="w-5 h-5 text-teal-600" /></div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm mb-1">{s.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{s.body}</p>
            </div>
          </div>
        ))}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
          <p className="text-xs text-stone-500 leading-relaxed">For any privacy-related queries contact us at <a href="mailto:support@pippal.uk" className="text-teal-700 font-medium underline">support@pippal.uk</a></p>
        </div>
      </div>
    </div>
  );
}

// ─── TERMS OF SERVICE ──────────────────────────────────────────────────────────
export function TermsScreen() {
  const sections = [
    { title: '1. Acceptance of terms', body: 'By creating an account or using PIPpal, you agree to these Terms of Service. If you do not agree, please do not use our service. We may update these terms from time to time and will notify you of significant changes.' },
    { title: '2. What PIPpal is', body: 'PIPpal is a guidance tool that helps you understand and navigate the PIP (Personal Independence Payment) claims process. We provide information, structured question walkthroughs, and tools to help you describe how your condition affects you. We are not a law firm, benefits agency, or medical service.' },
    { title: '3. What PIPpal is not', body: 'PIPpal does not provide legal advice, medical advice, or financial advice. We do not guarantee the outcome of any PIP claim or appeal. The information we provide is for educational and guidance purposes only. You should always verify information with official DWP sources and consult a qualified benefits adviser for complex situations.' },
    { title: '4. Your responsibilities', body: 'You agree to: provide truthful and accurate information in your PIP claim answers; not use PIPpal to exaggerate or fabricate information; keep your account credentials secure; use PIPpal only for lawful purposes; and not attempt to misuse, copy, or reverse-engineer our service.' },
    { title: '5. Payment terms', body: 'Full Access is available for a one-time payment of £12.99. This payment is non-refundable once Full Access has been granted and you have accessed the paid content. All payments are processed securely by Stripe. We do not store your payment card details.' },
    { title: '6. Intellectual property', body: 'All content, design, software, and materials on PIPpal are owned by PIPpal or its licensors. You may not copy, reproduce, or distribute any part of PIPpal without our written permission. Your personal data and answers remain your own.' },
    { title: '7. Disclaimer of warranties', body: 'PIPpal is provided "as is" without any warranties, express or implied. We do not warrant that our service will be uninterrupted, error-free, or that any information will be complete, accurate, or up to date. PIP rules and rates change — always check gov.uk for the latest information.' },
    { title: '8. Limitation of liability', body: 'To the maximum extent permitted by UK law, PIPpal shall not be liable for any indirect, incidental, or consequential damages arising from your use of our service. Our total liability to you shall not exceed the amount you paid for Full Access.' },
    { title: '9. Termination', body: 'We reserve the right to suspend or terminate your account if you breach these terms. You may delete your account at any time by contacting support@pippal.uk.' },
    { title: '10. Governing law', body: 'These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.' },
    { title: '11. Contact', body: 'For any questions about these terms, contact us at support@pippal.uk.' },
  ];

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <ScreenHeader title="Terms of Service" />
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-10 px-5 md:px-8 py-6 max-w-2xl mx-auto space-y-4">
        <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
          <p className="text-xs text-teal-800 font-medium">Last updated: April 2026 · Governed by the laws of England and Wales</p>
        </div>
        {sections.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
            <h3 className="font-bold text-stone-900 text-sm mb-2">{s.title}</h3>
            <p className="text-xs text-stone-600 leading-relaxed">{s.body}</p>
          </div>
        ))}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
          <p className="text-xs text-stone-500 leading-relaxed">Questions about these terms? Contact us at <a href="mailto:support@pippal.uk" className="text-teal-700 font-medium underline">support@pippal.uk</a></p>
        </div>
      </div>
    </div>
  );
}

// ─── ACCESSIBILITY ─────────────────────────────────────────────────────────────
export function AccessibilityScreen() {
  const features = [
    { icon: Type, title: 'Large text support', body: "PIPpal respects your device's text size settings. Increase text size in your phone's accessibility settings and PIPpal will adjust." },
    { icon: Settings, title: 'High contrast', body: 'PIPpal uses a high-contrast teal and stone colour scheme designed to be readable for people with visual impairments.' },
    { icon: Smartphone, title: 'Screen reader support', body: 'All interactive elements have accessible labels for use with VoiceOver (iOS) and TalkBack (Android).' },
    { icon: Volume2, title: 'Assessment recording', body: 'You can request an audio recording of your PIP assessment. See the Assessment Prep guide for how to do this.' },
    { icon: HelpCircle, title: 'Need more help?', body: 'If you need the content in a different format or require assistance using PIPpal, contact us at support@pippal.uk and we will help.' },
  ];

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <ScreenHeader title="Accessibility" />
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-10 px-5 md:px-8 py-6 max-w-2xl mx-auto space-y-4">
        <p className="text-sm text-stone-600 leading-relaxed mb-2">PIPpal is built to be usable by everyone, regardless of disability or access needs.</p>
        {features.map((f, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center shrink-0"><f.icon className="w-5 h-5 text-teal-600" /></div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{f.body}</p>
            </div>
          </div>
        ))}
        <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100">
          <p className="text-xs text-teal-800 leading-relaxed">We are committed to continuously improving accessibility. If you encounter any barriers, please email us at <a href="mailto:support@pippal.uk" className="font-medium underline">support@pippal.uk</a></p>
        </div>
      </div>
    </div>
  );
}

// ─── AWAITING DECISION ─────────────────────────────────────────────────────────
export function AwaitingDecisionScreen() {
  const { goBack, navigateTo } = useAppContext();

  const steps = [
    {
      icon: Phone,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      title: 'Contact the assessment contractor — not DWP',
      body: 'Your assessment was carried out by a private contractor (Capita or Maximus — check your appointment letter). Call them directly to confirm the date your form was received by DWP. This gives you a clearer picture of where you are in the process. DWP cannot always tell you this.',
    },
    {
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      title: 'Request your PA4 assessor report immediately',
      body: "As soon as your assessment is done, contact the contractor and request a copy of the PA4 report — the document the assessor wrote about you. You are entitled to this. It usually takes 1–3 weeks to arrive. Read it carefully — it shows exactly which descriptors the assessor used and why. Errors in this report are one of the most common grounds for a successful challenge.",
    },
    {
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      title: 'Upload your PA4 to the Points Estimator',
      body: "Once your PA4 arrives, upload it to PIPpal's Points Estimator. It reads the descriptors used by the assessor and estimates your likely outcome — Standard or Enhanced rate for Daily Living and Mobility — before the official decision letter arrives.",
      link: { label: 'Open Points Estimator →', screen: 'points_estimator' as const },
    },
    {
      icon: UserCheck,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      title: 'Request to speak to a case manager',
      body: 'While you wait, you can call DWP on 0800 121 4433 and ask to speak to the case manager handling your claim. They can confirm the current stage of your application. You cannot usually influence the decision at this point, but knowing the status can reduce uncertainty.',
    },
    {
      icon: Clock,
      color: 'text-stone-500',
      bg: 'bg-stone-100',
      title: 'Typical timelines',
      body: 'Most decisions arrive within 4–8 weeks of your assessment. The full process from initial call to decision typically takes 6 months. If you have been waiting more than 8 weeks after your assessment with no letter, call DWP to chase.',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">Awaiting Decision</h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-10">
        <div className="bg-teal-700 px-5 py-6 text-white">
          <h2 className="font-bold text-xl mb-1">Your assessment is done — what now?</h2>
          <p className="text-teal-100 text-sm leading-relaxed">The wait after your assessment is the hardest part. Here is exactly what you can do right now to stay informed and prepared.</p>
        </div>

        <div className="px-5 py-5 space-y-4 max-w-2xl mx-auto">
          {steps.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-teal-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <p className="font-bold text-stone-900 text-sm leading-snug">{s.title}</p>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed mt-1">{s.body}</p>
                  {'link' in s && s.link && (
                    <button
                      type="button"
                      onClick={() => navigateTo(s.link!.screen)}
                      className="mt-2 text-xs font-semibold text-teal-700 hover:text-teal-800 underline underline-offset-2"
                    >
                      {s.link.label}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-sm font-bold text-amber-900 mb-1">Start preparing now — don't wait</p>
            <p className="text-sm text-amber-800 leading-relaxed">If your decision is lower than expected, you have <strong>1 month</strong> to request a Mandatory Reconsideration. Having your PA4 report ready means you can act immediately rather than scrambling for paperwork.</p>
            <button
              type="button"
              onClick={() => navigateTo('mandatory_reconsideration')}
              className="mt-2 text-sm font-semibold text-amber-900 hover:text-amber-950 underline underline-offset-2"
            >
              Open Mandatory Reconsideration guide →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}