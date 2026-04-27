import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Circle,
  Calendar,
  FileSearch,
  Info,
  Phone } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareButton } from './ShareButton';
const stages = [
{
  id: 'applied',
  label: 'Applied'
},
{
  id: 'assessment_booked',
  label: 'Assessment Booked'
},
{
  id: 'assessment_done',
  label: 'Assessment Done'
},
{
  id: 'decision',
  label: 'Awaiting Decision'
}];

export function TimelineCalculator() {
  const [currentStage, setCurrentStage] = useState('applied');
  const [date, setDate] = useState('');
  const [showResults, setShowResults] = useState(false);
  const calculateTimeline = () => {
    if (!date) return null;
    const baseDate = new Date(date);
    const timeline = [];
    // Helper to add weeks
    const addWeeks = (d: Date, weeks: number) => {
      const newDate = new Date(d);
      newDate.setDate(newDate.getDate() + weeks * 7);
      return newDate;
    };
    const formatDate = (d: Date) =>
    d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    let appDate, assessDate, decisionDate, paymentDate;
    switch (currentStage) {
      case 'applied':
        appDate = baseDate;
        assessDate = addWeeks(baseDate, 10); // Avg 8-12 weeks
        decisionDate = addWeeks(assessDate, 6); // Avg 4-8 weeks
        paymentDate = addWeeks(decisionDate, 2);
        break;
      case 'assessment_booked':
      case 'assessment_done':
        assessDate = baseDate;
        appDate = addWeeks(baseDate, -10);
        decisionDate = addWeeks(baseDate, 6);
        paymentDate = addWeeks(decisionDate, 2);
        break;
      case 'decision':
        decisionDate = baseDate;
        appDate = addWeeks(baseDate, -16);
        assessDate = addWeeks(baseDate, -6);
        paymentDate = addWeeks(baseDate, 2);
        break;
    }
    const stageIndex = stages.findIndex((s) => s.id === currentStage);
    return [
    {
      title: 'Application Submitted',
      date: formatDate(appDate!),
      status: stageIndex >= 0 ? 'completed' : 'pending'
    },
    {
      title: 'Assessment',
      date: `Est. ${formatDate(addWeeks(appDate!, 8))} - ${formatDate(addWeeks(appDate!, 12))}`,
      status:
      stageIndex >= 2 ?
      'completed' :
      stageIndex === 1 ?
      'current' :
      'pending'
    },
    {
      title: 'Decision Made',
      date: `Est. ${formatDate(addWeeks(assessDate!, 4))} - ${formatDate(addWeeks(assessDate!, 8))}`,
      status: stageIndex >= 3 ? 'completed' : 'pending'
    },
    {
      title: 'First Payment',
      date: `Est. ${formatDate(addWeeks(decisionDate!, 1))} - ${formatDate(addWeeks(decisionDate!, 2))}`,
      status: 'pending'
    }];

  };
  const timeline = showResults ? calculateTimeline() : null;
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-6">
      <div className="bg-blue-50 border-b border-blue-100 p-4 flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Clock className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="font-bold text-stone-900 flex-1">Timeline Tracker</h3>
        <ShareButton
          title="PIP Timeline Tracker"
          text="Check how long your PIP claim might take with this free timeline tracker from PIPpal."
          className="text-blue-600" />
        
      </div>

      <div className="p-5">
        <div className="mb-4">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Current Stage
          </label>
          <div className="grid grid-cols-2 gap-2">
            {stages.map((stage) =>
            <button
              key={stage.id}
              onClick={() => {
                setCurrentStage(stage.id);
                setShowResults(false);
              }}
              className={`text-xs py-2 px-3 rounded-lg border transition-colors ${currentStage === stage.id ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold' : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'}`}>
              
                {stage.label}
              </button>
            )}
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Date of this stage
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setShowResults(false);
              }}
              className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            
          </div>
        </div>

        <button
          onClick={() => setShowResults(true)}
          disabled={!date}
          className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium text-sm hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          
          Calculate Timeline
        </button>

        <AnimatePresence>
          {showResults && timeline &&
          <motion.div
            initial={{
              opacity: 0,
              height: 0
            }}
            animate={{
              opacity: 1,
              height: 'auto'
            }}
            exit={{
              opacity: 0,
              height: 0
            }}
            className="mt-6 pt-6 border-t border-stone-100">
            
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-stone-200">
                {timeline.map((item, i) =>
              <div key={i} className="relative flex items-start gap-4">
                    <div className="absolute left-0 w-5 h-5 flex items-center justify-center bg-white">
                      {item.status === 'completed' ?
                  <CheckCircle2 className="w-5 h-5 text-green-500" /> :
                  item.status === 'current' ?
                  <div className="w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-50" /> :

                  <Circle className="w-4 h-4 text-stone-300" />
                  }
                    </div>
                    <div className="ml-8">
                      <h4
                    className={`text-sm font-semibold ${item.status === 'pending' ? 'text-stone-500' : 'text-stone-900'}`}>
                    
                        {item.title}
                      </h4>
                      <p className="text-xs text-stone-500 mt-1">{item.date}</p>
                    </div>
                  </div>
              )}
              </div>
            </motion.div>
          }
        </AnimatePresence>

        {/* Assessor Report Tip - shows after Assessment Done or Awaiting Decision */}
        <AnimatePresence>
          {showResults && (
          currentStage === 'assessment_done' ||
          currentStage === 'decision') &&
          <motion.div
            initial={{
              opacity: 0,
              height: 0
            }}
            animate={{
              opacity: 1,
              height: 'auto'
            }}
            exit={{
              opacity: 0,
              height: 0
            }}
            className="mt-5">
            
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                  <div className="flex items-start gap-2.5 mb-3">
                    <FileSearch className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-indigo-900 text-sm mb-1">
                        Request your assessor's report now
                      </h4>
                      <p className="text-xs text-indigo-800 leading-relaxed">
                        Now that your assessment is done, you can make a{' '}
                        <strong>Subject Access Request (SAR)</strong> to get a
                        copy of the assessor's report. This shows exactly what
                        the assessor recorded and the points they recommended
                        for each activity.
                      </p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-indigo-100 space-y-2">
                    <p className="text-xs text-stone-700 leading-relaxed">
                      <strong>How:</strong> Call the PIP enquiry line or email{' '}
                      <strong>dwp.sar@dwp.gov.uk</strong> with your full name,
                      NI number, and date of birth. They must respond within{' '}
                      <strong>1 month</strong> by law.
                    </p>
                    <a
                  href="tel:08001214433"
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-indigo-700 active:scale-95 transition-all">
                  
                      <Phone className="w-3.5 h-3.5" />
                      0800 121 4433 — PIP Enquiry Line
                    </a>
                  </div>
                  <div className="mt-3 bg-amber-50 rounded-lg p-2.5 border border-amber-100 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      <strong>Why this matters:</strong> If the assessor's
                      recommended points are lower than expected, you'll know
                      early and can start gathering evidence for a Mandatory
                      Reconsideration before the decision letter arrives.
                    </p>
                  </div>
                </div>
              </motion.div>
          }
        </AnimatePresence>
      </div>
    </div>);

}