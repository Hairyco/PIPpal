import React from 'react';
import { NewsletterSignup } from './NewsletterSignup';
import { ArrowRight, Lock, Sparkles, Users, Shield, Mail } from 'lucide-react';

interface FinalCTAProps {
  onStart?: () => void;
}

export function FinalCTA({ onStart }: FinalCTAProps) {
  return (
    <section className="px-5 md:px-8 pt-4 pb-8">
      {/* CTA box */}
      <div className="bg-stone-900 rounded-3xl p-6 md:p-8 text-center mb-8">
        <div className="inline-flex items-center gap-1.5 bg-white/10 text-stone-300 px-3 py-1 rounded-full text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Free tools available — no sign-up needed
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Ready to get started?
        </h2>
        <p className="text-stone-400 text-sm mb-6 leading-relaxed max-w-md mx-auto">
          Try the eligibility checker and Q1 walkthrough completely free.
          Upgrade for the full 12-question claim experience.
        </p>

        <button
          onClick={onStart}
          className="w-full md:w-auto md:px-10 bg-orange-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-orange-600 active:scale-[0.98] transition-all shadow-sm mb-4 mx-auto"
        >
          Start For Free
          <ArrowRight className="w-5 h-5" />
        </button>

        <NewsletterSignup />

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>No subscription</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Secure payment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Full Access — <strong className="text-white">£12.99</strong> one-time</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center space-y-4 pb-4">
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-teal-700 font-semibold hover:text-teal-800 transition-colors"
        >
          <Users className="w-4 h-4" />
          Join our community
        </a>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-stone-400">
          <button className="hover:text-stone-600 transition-colors">Privacy Policy</button>
          <span className="text-stone-300">·</span>
          <button className="hover:text-stone-600 transition-colors">Terms of Service</button>
          <span className="text-stone-300">·</span>
          <a href="mailto:support@pippal.uk" className="hover:text-stone-600 transition-colors flex items-center gap-1">
            <Mail className="w-3 h-3" />
            Contact
          </a>
        </div>

        <p className="text-xs text-stone-400">© 2026 PIPpal. Not affiliated with the DWP.</p>

        <div className="mt-4 pt-4 border-t border-stone-200 max-w-lg mx-auto">
          <p className="text-[10px] text-stone-400 leading-relaxed">
            <strong className="text-stone-500">Disclaimer:</strong> PIPpal is an assistance tool that helps you describe how your condition affects you on your worst days. We do not encourage exaggeration or dishonesty. All suggested answers are drafts — you are responsible for reviewing, editing, and ensuring your final answers are truthful and accurate before submitting your claim. PIPpal does not provide legal or medical advice. We are not affiliated with the DWP, NHS, or any government body.
          </p>
        </div>
      </footer>
    </section>
  );
}