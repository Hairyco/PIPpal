import React, { useState, memo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Eye,
  Utensils,
  Bath,
  MessageSquare,
  BookOpen,
  Pill,
  DollarSign,
  MapPin,
  Navigation } from
'lucide-react';
import { useAppContext } from './AppContext';
import { ProgressBar } from './ProgressBar';
const dailyLivingActivities = [
{
  num: 1,
  title: 'Preparing food',
  icon: Utensils,
  maxPts: 8,
  descriptors: [
  {
    letter: 'a',
    text: 'Can prepare and cook a simple meal unaided',
    pts: 0
  },
  {
    letter: 'b',
    text: 'Needs to use an aid or appliance to prepare or cook a simple meal',
    pts: 2
  },
  {
    letter: 'c',
    text: 'Cannot cook a simple meal using a conventional cooker but can do so using a microwave',
    pts: 2
  },
  {
    letter: 'd',
    text: 'Needs prompting to prepare or cook a simple meal',
    pts: 2
  },
  {
    letter: 'e',
    text: 'Needs supervision or assistance to prepare or cook a simple meal',
    pts: 4
  },
  {
    letter: 'f',
    text: 'Cannot prepare and cook food',
    pts: 8
  }]

},
{
  num: 2,
  title: 'Taking nutrition',
  icon: Utensils,
  maxPts: 10,
  descriptors: [
  {
    letter: 'a',
    text: 'Can take nutrition unaided',
    pts: 0
  },
  {
    letter: 'b',
    text: 'Needs to use an aid or appliance, or needs supervision, or needs a therapeutic source to take nutrition',
    pts: 2
  },
  {
    letter: 'c',
    text: 'Needs prompting to take nutrition',
    pts: 4
  },
  {
    letter: 'd',
    text: 'Needs assistance to take nutrition',
    pts: 6
  },
  {
    letter: 'e',
    text: 'Cannot convey food and drink to their mouth and needs another person to do so',
    pts: 10
  }]

},
{
  num: 3,
  title: 'Managing therapy or monitoring a health condition',
  icon: Pill,
  maxPts: 8,
  descriptors: [
  {
    letter: 'a',
    text: 'Either does not receive medication/therapy or can manage unaided',
    pts: 0
  },
  {
    letter: 'b',
    text: 'Needs to use an aid or appliance to manage medication',
    pts: 1
  },
  {
    letter: 'c',
    text: 'Needs supervision, prompting or assistance to manage medication or therapy (not therapy below)',
    pts: 2
  },
  {
    letter: 'd',
    text: 'Needs supervision, prompting or assistance to manage therapy that takes no more than 3.5 hours a week',
    pts: 6
  },
  {
    letter: 'e',
    text: 'Needs supervision, prompting or assistance to manage therapy that takes more than 3.5 but no more than 7 hours a week',
    pts: 8
  }]

},
{
  num: 4,
  title: 'Washing and bathing',
  icon: Bath,
  maxPts: 8,
  descriptors: [
  {
    letter: 'a',
    text: 'Can wash and bathe unaided',
    pts: 0
  },
  {
    letter: 'b',
    text: 'Needs to use an aid or appliance to wash or bathe',
    pts: 2
  },
  {
    letter: 'c',
    text: 'Needs supervision or prompting to wash or bathe',
    pts: 2
  },
  {
    letter: 'd',
    text: 'Needs assistance to wash either their hair or body below the waist',
    pts: 2
  },
  {
    letter: 'e',
    text: 'Needs assistance to get in or out of a bath or shower',
    pts: 3
  },
  {
    letter: 'f',
    text: 'Needs assistance to wash their body between the waist and neck',
    pts: 4
  },
  {
    letter: 'g',
    text: 'Cannot wash and bathe at all and needs another person to wash their entire body',
    pts: 8
  }]

},
{
  num: 5,
  title: 'Managing toilet needs or incontinence',
  maxPts: 8,
  descriptors: [
  {
    letter: 'a',
    text: 'Can manage toilet needs or incontinence unaided',
    pts: 0
  },
  {
    letter: 'b',
    text: 'Needs to use an aid or appliance to manage toilet needs or incontinence',
    pts: 2
  },
  {
    letter: 'c',
    text: 'Needs supervision or prompting to manage toilet needs',
    pts: 2
  },
  {
    letter: 'd',
    text: 'Needs assistance to manage toilet needs',
    pts: 4
  },
  {
    letter: 'e',
    text: 'Needs assistance to manage incontinence of either bladder or bowel',
    pts: 6
  },
  {
    letter: 'f',
    text: 'Needs assistance to manage incontinence of both bladder and bowel',
    pts: 8
  }]

},
{
  num: 6,
  title: 'Dressing and undressing',
  maxPts: 8,
  descriptors: [
  {
    letter: 'a',
    text: 'Can dress and undress unaided',
    pts: 0
  },
  {
    letter: 'b',
    text: 'Needs to use an aid or appliance to dress or undress',
    pts: 2
  },
  {
    letter: 'c',
    text: 'Needs prompting to dress/undress or determine appropriate circumstances for remaining clothed, or prompting plus assistance',
    pts: 2
  },
  {
    letter: 'd',
    text: 'Needs assistance to dress or undress their lower body',
    pts: 2
  },
  {
    letter: 'e',
    text: 'Needs assistance to dress or undress their upper body',
    pts: 4
  },
  {
    letter: 'f',
    text: 'Cannot dress or undress at all',
    pts: 8
  }]

},
{
  num: 7,
  title: 'Communicating verbally',
  icon: MessageSquare,
  maxPts: 12,
  descriptors: [
  {
    letter: 'a',
    text: 'Can express and understand verbal information unaided',
    pts: 0
  },
  {
    letter: 'b',
    text: 'Needs to use an aid or appliance to speak or hear',
    pts: 2
  },
  {
    letter: 'c',
    text: 'Needs communication support to express or understand complex verbal information',
    pts: 4
  },
  {
    letter: 'd',
    text: 'Needs communication support to express or understand basic verbal information',
    pts: 8
  },
  {
    letter: 'e',
    text: 'Cannot express or understand verbal information at all even with communication support',
    pts: 12
  }]

},
{
  num: 8,
  title: 'Reading and understanding signs, symbols and words',
  icon: BookOpen,
  maxPts: 8,
  descriptors: [
  {
    letter: 'a',
    text: 'Can read and understand basic and complex written information unaided',
    pts: 0
  },
  {
    letter: 'b',
    text: 'Needs to use an aid or appliance to read or understand written information',
    pts: 2
  },
  {
    letter: 'c',
    text: 'Needs prompting to read or understand complex written information',
    pts: 2
  },
  {
    letter: 'd',
    text: 'Needs prompting to read or understand basic written information',
    pts: 4
  },
  {
    letter: 'e',
    text: 'Cannot read or understand signs, symbols or words at all',
    pts: 8
  }]

},
{
  num: 9,
  title: 'Engaging with other people face to face',
  maxPts: 8,
  descriptors: [
  {
    letter: 'a',
    text: 'Can engage with other people unaided',
    pts: 0
  },
  {
    letter: 'b',
    text: 'Needs prompting to engage with other people',
    pts: 2
  },
  {
    letter: 'c',
    text: 'Needs social support to engage with other people',
    pts: 4
  },
  {
    letter: 'd',
    text: 'Cannot engage due to overwhelming psychological distress or risk of harm',
    pts: 8
  }]

},
{
  num: 10,
  title: 'Making budgeting decisions',
  icon: DollarSign,
  maxPts: 6,
  descriptors: [
  {
    letter: 'a',
    text: 'Can manage complex budgeting decisions unaided',
    pts: 0
  },
  {
    letter: 'b',
    text: 'Needs prompting or assistance to make complex budgeting decisions',
    pts: 2
  },
  {
    letter: 'c',
    text: 'Needs prompting or assistance to make simple budgeting decisions',
    pts: 4
  },
  {
    letter: 'd',
    text: 'Cannot make any budgeting decisions at all',
    pts: 6
  }]

}];

const mobilityActivities = [
{
  num: 11,
  title: 'Planning and following journeys',
  icon: Navigation,
  maxPts: 12,
  descriptors: [
  {
    letter: 'a',
    text: 'Can plan and follow the route of a journey unaided',
    pts: 0
  },
  {
    letter: 'b',
    text: 'Needs prompting to undertake any journey to avoid overwhelming psychological distress',
    pts: 4
  },
  {
    letter: 'c',
    text: 'Cannot plan the route of a journey',
    pts: 8
  },
  {
    letter: 'd',
    text: 'Cannot follow the route of an unfamiliar journey without another person, assistance dog or orientation aid',
    pts: 10
  },
  {
    letter: 'e',
    text: 'Cannot undertake any journey because it would cause overwhelming psychological distress',
    pts: 10
  },
  {
    letter: 'f',
    text: 'Cannot follow the route of a familiar journey without another person, assistance dog or orientation aid',
    pts: 12
  }]

},
{
  num: 12,
  title: 'Moving around',
  icon: MapPin,
  maxPts: 12,
  descriptors: [
  {
    letter: 'a',
    text: 'Can stand and then move more than 200 metres, either aided or unaided',
    pts: 0
  },
  {
    letter: 'b',
    text: 'Can stand and then move more than 50m but no more than 200m',
    pts: 4
  },
  {
    letter: 'c',
    text: 'Can stand and then move unaided more than 20m but no more than 50m',
    pts: 8
  },
  {
    letter: 'd',
    text: 'Can stand and then move using an aid more than 20m but no more than 50m',
    pts: 10
  },
  {
    letter: 'e',
    text: 'Can stand and then move more than 1m but no more than 20m',
    pts: 12
  },
  {
    letter: 'f',
    text: 'Cannot stand or move more than 1 metre',
    pts: 12
  }]

}];

export function DescriptorsGuide() {
  const { navigateTo, goBack } = useAppContext();
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);
  const [showDailyLiving, setShowDailyLiving] = useState(false);
  const [showMobility, setShowMobility] = useState(false);
  const [showScoring, setShowScoring] = useState(false);
  const toggleActivity = (num: number) => {
    setExpandedActivity(expandedActivity === num ? null : num);
  };
  const renderActivityCard = (a: any) => {
    const isExpanded = expandedActivity === a.num;
    return (
      <div
        key={a.num}
        className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        
        <button
          onClick={() => toggleActivity(a.num)}
          className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-left">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-teal-700">{a.num}</span>
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm leading-tight">
                {a.title}
              </h3>
              <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                max {a.maxPts}pts
              </span>
            </div>
          </div>
          {isExpanded ?
          <ChevronUp className="w-5 h-5 text-stone-400 shrink-0" /> :

          <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />
          }
        </button>

        {isExpanded &&
        <div className="border-t border-stone-100 bg-stone-50/50 divide-y divide-stone-100">
            {a.descriptors.map((desc: any) => {
            const isMax = desc.pts === a.maxPts;
            return (
              <div
                key={desc.letter}
                className={`p-4 flex items-start gap-3 ${isMax ? 'bg-teal-50/50' : ''}`}>
                
                  <div className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-stone-600 uppercase">
                      {desc.letter}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-700 leading-relaxed pr-2">
                      {desc.text}
                    </p>
                  </div>
                  <div
                  className={`shrink-0 text-xs font-bold px-2 py-1 rounded ${desc.pts > 0 ? 'bg-teal-100 text-teal-800' : 'bg-stone-200 text-stone-600'}`}>
                  
                    {desc.pts}pt{desc.pts !== 1 ? 's' : ''}
                  </div>
                </div>);

          })}
          </div>
        }
      </div>);

  };
  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
          
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">
          What Assessors Look For
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 space-y-6">
        {/* Intro */}
        <div>
          <h2 className="text-xl font-bold text-stone-900 leading-tight mb-2">
            Understanding descriptors
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            PIP isn't about what illness you have. It all comes down to{' '}
            <strong>how your condition affects daily activities like cooking, washing, or going out</strong>.
            You score points for the help you need with each task, and your total decides whether you get PIP and how much.
          </p>
        </div>

        {/* Daily Living Activities */}
        <div>
          <button
            onClick={() => setShowDailyLiving(!showDailyLiving)}
            className="w-full flex items-center justify-between py-3 px-4 bg-white rounded-2xl border border-stone-100 shadow-sm hover:border-teal-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-stone-900 text-sm">Daily Living Activities (1–10)</h3>
            </div>
            <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${showDailyLiving ? 'rotate-180' : ''}`} />
          </button>
          {showDailyLiving && (
          <div className="space-y-3 mt-3">
            {dailyLivingActivities.map(renderActivityCard)}
          </div>
          )}
        </div>

        {/* Mobility Activities */}
        <div>
          <button
            onClick={() => setShowMobility(!showMobility)}
            className="w-full flex items-center justify-between py-3 px-4 bg-white rounded-2xl border border-stone-100 shadow-sm hover:border-teal-200 transition-colors"
          >
            <h3 className="font-bold text-stone-900 text-sm">Mobility Activities (11–12)</h3>
            <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${showMobility ? 'rotate-180' : ''}`} />
          </button>
          {showMobility && (
          <div className="space-y-3 mt-3">
            {mobilityActivities.map(renderActivityCard)}
          </div>
          )}
        </div>

        {/* How scoring works */}
        <div>
          <button
            onClick={() => setShowScoring(!showScoring)}
            className="w-full flex items-center justify-between py-3 px-4 bg-white rounded-2xl border border-stone-100 shadow-sm hover:border-teal-200 transition-colors mb-0"
          >
            <h3 className="font-bold text-stone-900 text-sm">How scoring works</h3>
            <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${showScoring ? 'rotate-180' : ''}`} />
          </button>
          {showScoring && (
          <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100 mt-3">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white rounded-xl p-3">
              <div className="text-[10px] text-stone-500 uppercase tracking-wider font-medium mb-1">
                Daily Living
              </div>
              <div className="text-xs text-stone-700 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span>Standard</span>
                  <div className="text-right">
                    <span className="font-bold">8–11 pts</span>
                    <div className="text-[10px] text-teal-700 font-medium">
                      £77.65/week
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Enhanced</span>
                  <div className="text-right">
                    <span className="font-bold text-teal-700">12+ pts</span>
                    <div className="text-[10px] text-teal-700 font-medium">
                      £116.05/week
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-3">
              <div className="text-[10px] text-stone-500 uppercase tracking-wider font-medium mb-1">
                Mobility
              </div>
              <div className="text-xs text-stone-700 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span>Standard</span>
                  <div className="text-right">
                    <span className="font-bold">8–11 pts</span>
                    <div className="text-[10px] text-teal-700 font-medium">
                      £30.70/week
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Enhanced</span>
                  <div className="text-right">
                    <span className="font-bold text-teal-700">12+ pts</span>
                    <div className="text-[10px] text-teal-700 font-medium">
                      £81.00/week
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-teal-800 leading-relaxed">
            Only the <strong>highest-scoring descriptor</strong> from each
            activity counts. You don't need to score on every activity — just
            enough to reach the threshold.
          </p>
          </div>
          )}
        </div>

        {/* Key thing assessors look for */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-amber-700" />
            <h3 className="font-bold text-amber-900 text-sm">
              What assessors really look for
            </h3>
          </div>
          <div className="space-y-2 text-xs text-amber-800 leading-relaxed">
            <p>
              Assessors are trained to evaluate whether you can do activities{' '}
              <strong>reliably</strong>. This means:
            </p>
            <ul className="space-y-1.5 pl-4">
              <li className="list-disc">
                <strong>Safely</strong> — without risk to yourself or others
              </li>
              <li className="list-disc">
                <strong>Repeatedly</strong> — as often as you need to, not just
                once
              </li>
              <li className="list-disc">
                <strong>In a reasonable time</strong> — not taking much longer
                than someone without your condition
              </li>
              <li className="list-disc">
                <strong>To an acceptable standard</strong> — properly, not just
                partially
              </li>
            </ul>
            <p className="mt-2">
              If you can technically do something but it causes you{' '}
              <strong>severe pain, exhaustion, or distress</strong> — or you can
              only do it on good days — that counts as not being able to do it
              reliably.
            </p>
          </div>
        </div>

        {/* Encouragement */}
        <div className="bg-stone-100 rounded-2xl p-4">
          <p className="text-xs text-stone-700 leading-relaxed text-center">
            <strong>Don't worry about memorising all of this.</strong> PIPpal
            will guide you through each activity with simple questions and
            generate your answers in the language assessors are trained to look
            for.
          </p>
        </div>
      </div>

      <div className="p-5 md:px-8 bg-white border-t border-stone-100">
        <button
          onClick={() => navigateTo('medical_profile')}
          className="w-full bg-teal-700 text-white py-3.5 rounded-xl font-semibold text-lg hover:bg-teal-800 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2">
          
          Next: Your Medical Profile
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>);

}