import React from 'react';
import { HeartHandshake, ShieldCheck, ArrowRight, Info } from 'lucide-react';

interface PromoDisclaimerProps {
  promoCode: string;
  onContinue: () => void;
}

export function PromoDisclaimer({ promoCode, onContinue }: PromoDisclaimerProps) {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-teal-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <HeartHandshake className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">PIPpal</h1>
          <p className="text-stone-500 text-sm mt-1">PIP claims. Made easy.</p>
        </div>

        {/* Pro access badge */}
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 mb-5 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-teal-900">You have been given Full Access</p>
            <p className="text-xs text-teal-700 mt-0.5">Your unique access code <span className="font-mono font-bold">{promoCode}</span> unlocks all PIPpal features at no cost.</p>
          </div>
        </div>

        {/* Disclaimer card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 mb-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Info className="w-4 h-4 text-stone-500 shrink-0" />
            <h2 className="text-sm font-bold text-stone-900">Before you continue</h2>
          </div>

          <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
            <p>
              <strong className="text-stone-800">PIPpal is an independent guidance tool.</strong> We are not affiliated with the Department for Work and Pensions (DWP), the government, or any official body.
            </p>
            <p>
              The information and guidance provided by PIPpal is for general support purposes only. It does not constitute legal or professional advice. For complex situations, please contact Citizens Advice or a welfare rights adviser.
            </p>
            <p>
              By continuing, you acknowledge that PIPpal provides guidance to help you understand and complete your PIP claim — but final decisions on your claim are made by the DWP.
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onContinue}
          className="w-full bg-teal-700 hover:bg-teal-800 text-white py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm"
        >
          I understand, continue to PIPpal
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-center text-xs text-stone-400 mt-4 leading-relaxed">
          Your access code has been saved. You will not need to enter it again.
        </p>

      </div>
    </div>
  );
}