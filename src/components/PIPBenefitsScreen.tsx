import React, { useState } from 'react';
import {
  ArrowLeft, Car, Train, Bus, PoundSterling, Heart, Home,
  Star, ChevronDown, ExternalLink, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { useAppContext } from './AppContext';

const benefits = [
  {
    id: 'motability',
    icon: Car,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    title: 'Motability Scheme',
    who: 'Enhanced mobility component',
    desc: 'Lease a brand new car, scooter or powered wheelchair using your enhanced mobility PIP payment. Motability handles insurance, servicing and tyres. Over 815,000 people use the scheme.',
    link: 'https://www.motability.co.uk',
    linkText: 'Apply at motability.co.uk',
    tip: null,
  },
  {
    id: 'blue_badge',
    icon: Car,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    title: 'Blue Badge',
    who: 'Enhanced mobility component (automatic) or standard rate (may qualify)',
    desc: 'Park closer to your destination — in disabled bays, on yellow lines, and free in many council car parks. Apply through your local council. The badge lasts 3 years.',
    link: 'https://www.gov.uk/apply-blue-badge',
    linkText: 'Apply on GOV.UK',
    tip: 'You automatically qualify if you get the enhanced mobility rate. If you get the standard rate, your council will assess you separately.',
  },
  {
    id: 'vehicle_tax',
    icon: Car,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    title: 'Free Vehicle Tax',
    who: 'Enhanced mobility component',
    desc: '100% vehicle tax (road tax) exemption. Also applies if the vehicle is registered in someone else\'s name but used mainly by you. Apply at a Post Office or online.',
    link: 'https://www.gov.uk/vehicle-tax-rate-tables/vehicles-exempt-from-vehicle-tax',
    linkText: 'Check eligibility on GOV.UK',
    tip: null,
  },
  {
    id: 'railcard',
    icon: Train,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    title: 'Disabled Persons Railcard',
    who: 'Any PIP award (any rate, any component)',
    desc: 'One third off most rail fares for you and a companion travelling with you. Costs £20/year or £54 for 3 years. One of the most accessible PIP perks — applies to any award.',
    link: 'https://www.disabledpersons-railcard.co.uk',
    linkText: 'Apply at disabledpersons-railcard.co.uk',
    tip: null,
  },
  {
    id: 'bus_pass',
    icon: Bus,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    title: 'Free Bus Pass',
    who: 'Mobility component (criteria vary by council)',
    desc: 'Free local bus travel in England and Wales. Some councils also offer a companion pass if you need assistance while travelling. Check with your local council.',
    link: 'https://www.gov.uk/apply-for-disabled-bus-pass',
    linkText: 'Find your local scheme on GOV.UK',
    tip: 'In London, you may qualify for a Freedom Pass — free travel on all TfL services.',
  },
  {
    id: 'council_tax',
    icon: Home,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    title: 'Council Tax Reduction',
    who: 'Any PIP award — amount varies by council',
    desc: 'A PIP award can reduce your council tax bill significantly. Some people pay nothing at all. Apply through your local council — not automatic, you must apply.',
    link: 'https://www.gov.uk/apply-council-tax-reduction',
    linkText: 'Apply on GOV.UK',
    tip: null,
  },
  {
    id: 'uc',
    icon: PoundSterling,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    title: 'Universal Credit Health Element',
    who: 'Daily living component (any rate)',
    desc: 'A PIP daily living award may qualify you for the UC health element (formerly LCWRA). Worth up to £97/week for existing claimants in 2025/26. Not automatic — you must notify DWP.',
    link: 'https://www.gov.uk/universal-credit',
    linkText: 'Check UC eligibility on GOV.UK',
    tip: 'From April 2026, new claimants get a reduced rate of £50/week under welfare reforms. From 2028-2029, the Work Capability Assessment is abolished — qualifying for the UC health element will require a PIP daily living award.',
  },
  {
    id: 'carers',
    icon: Heart,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    title: 'Carer\'s Allowance',
    who: 'Daily living component (any rate)',
    desc: 'If someone provides you with at least 35 hours of care per week, they may be able to claim Carer\'s Allowance (worth £81.90/week in 2025/26). Not automatic — the carer must apply.',
    link: 'https://www.gov.uk/carers-allowance',
    linkText: 'Apply on GOV.UK',
    tip: null,
  },
  {
    id: 'pension',
    icon: Star,
    color: 'text-stone-600',
    bg: 'bg-stone-100',
    title: 'Pension Credit Additions',
    who: 'Any PIP award — if over State Pension age',
    desc: 'If you receive PIP and are over State Pension age, you may qualify for additional amounts within Pension Credit including the severe disability premium. A separate Pension Credit application is required.',
    link: 'https://www.gov.uk/pension-credit',
    linkText: 'Check on GOV.UK',
    tip: null,
  },
];

export function PIPBenefitsScreen() {
  const { goBack } = useAppContext();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button onClick={goBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">PIP Benefits & Perks</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 space-y-4">

        {/* Hero */}
        <div className="bg-teal-700 rounded-2xl p-5 text-white">
          <h2 className="text-xl font-bold mb-1">Your PIP award unlocks more</h2>
          <p className="text-teal-100 text-sm leading-relaxed">PIP isn't just a payment — it's a gateway to a wide range of schemes and discounts. <strong className="text-white">None of these are automatic</strong> — you need to apply for each one separately.</p>
        </div>

        {/* Important note */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Don't wait for DWP to tell you.</strong> Most people never apply for these — they don't know they exist. Each one requires a separate application. Start with the ones that match your award level.
          </p>
        </div>

        {/* Benefits list */}
        {benefits.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === b.id ? null : b.id)}
              className="w-full p-4 flex items-center gap-3 text-left hover:bg-stone-50 transition-colors"
            >
              <div className={`w-9 h-9 ${b.bg} rounded-full flex items-center justify-center shrink-0`}>
                <b.icon className={`w-4 h-4 ${b.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-stone-900 text-sm">{b.title}</p>
                <p className="text-[10px] text-stone-400 leading-snug mt-0.5">{b.who}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${expanded === b.id ? 'rotate-180' : ''}`} />
            </button>

            {expanded === b.id && (
              <div className="px-4 pb-4 border-t border-stone-100 pt-3 space-y-3">
                <p className="text-xs text-stone-600 leading-relaxed">{b.desc}</p>

                {b.tip && (
                  <div className="bg-stone-50 rounded-xl p-3 flex gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-stone-600 leading-relaxed">{b.tip}</p>
                  </div>
                )}

                <a href={b.link} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800">
                  {b.linkText} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        ))}

        {/* Proof of benefits */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <p className="font-bold text-stone-900 text-sm mb-2">Get official proof of your PIP award</p>
          <p className="text-xs text-stone-500 leading-relaxed mb-3">Many of the above schemes need proof of your PIP award. You can download an official letter from GOV.UK confirming your entitlement.</p>
          <a href="https://www.gov.uk/get-proof-benefits" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-teal-100 transition-colors">
            Get proof of benefits on GOV.UK <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
}
