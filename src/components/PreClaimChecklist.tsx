import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Info,
  Users,
  Mail } from
'lucide-react';
import { useAppContext } from './AppContext';
import { motion } from 'framer-motion';
interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}
interface ChecklistCategory {
  title: string;
  items: ChecklistItem[];
}
const initialChecklist: ChecklistCategory[] = [
{
  title: 'Before You Call DWP',
  items: [
  {
    id: 'c1',
    text: 'Note down all your conditions',
    checked: false
  },
  {
    id: 'c2',
    text: 'Have your National Insurance number ready',
    checked: false
  },
  {
    id: 'c3',
    text: 'Know your GP details (name, address, phone)',
    checked: false
  },
  {
    id: 'c4',
    text: 'Have your bank details ready',
    checked: false
  }]

},
{
  title: 'Evidence to Include (all optional)',
  items: [
  {
    id: 'd1',
    text: 'GP letters or medical records (if you have any)',
    checked: false
  },
  {
    id: 'd2',
    text: 'Current prescription list (if available)',
    checked: false
  },
  {
    id: 'd3',
    text: 'A letter from someone who helps you (optional — but can strengthen your claim)',
    checked: false
  }]

},
{
  title: 'Before Submitting Your Form',
  items: [
  {
    id: 's1',
    text: 'Complete all PIP questions in PIPpal',
    checked: false
  },
  {
    id: 's2',
    text: 'Review and edit your answers',
    checked: false
  },
  {
    id: 's3',
    text: 'Download your answers to copy onto the form',
    checked: false
  },
  {
    id: 's4',
    text: 'Photocopy or photograph your completed form before posting',
    checked: false
  }]

}];

export function PreClaimChecklist() {
  const { goBack } = useAppContext();
  const [checklist, setChecklist] =
  useState<ChecklistCategory[]>(initialChecklist);
  const toggleItem = (categoryId: number, itemId: string) => {
    const newChecklist = [...checklist];
    const itemIndex = newChecklist[categoryId].items.findIndex(
      (i) => i.id === itemId
    );
    if (itemIndex !== -1) {
      newChecklist[categoryId].items[itemIndex].checked =
      !newChecklist[categoryId].items[itemIndex].checked;
      setChecklist(newChecklist);
    }
  };
  const totalItems = checklist.reduce((acc, cat) => acc + cat.items.length, 0);
  const completedItems = checklist.reduce(
    (acc, cat) => acc + cat.items.filter((i) => i.checked).length,
    0
  );
  const progressPercentage = completedItems / totalItems * 100;
  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all active:scale-95">
          
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">
          Pre-Claim Checklist
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <div className="flex justify-between items-end mb-2">
            <h2 className="font-bold text-stone-900">Your Progress</h2>
            <span className="text-xs font-medium text-stone-500">
              {completedItems} of {totalItems} complete
            </span>
          </div>
          <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-teal-500 rounded-full"
              initial={{
                width: 0
              }}
              animate={{
                width: `${progressPercentage}%`
              }}
              transition={{
                duration: 0.5,
                ease: 'easeOut'
              }} />
            
          </div>
        </div>

        <div className="space-y-6">
          {checklist.map((category, catIndex) =>
          <div
            key={category.title}
            className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            
              <div className="bg-stone-50 px-4 py-3 border-b border-stone-100">
                <h3 className="font-bold text-stone-900 text-sm">
                  {category.title}
                </h3>
              </div>
              <div className="divide-y divide-stone-50">
                {category.items.map((item) =>
              <button
                key={item.id}
                onClick={() => toggleItem(catIndex, item.id)}
                className="w-full px-4 py-3.5 flex items-start gap-3 hover:bg-stone-50 transition-colors text-left active:bg-stone-100">
                
                    <div className="mt-0.5 shrink-0">
                      {item.checked ?
                  <CheckCircle2 className="w-5 h-5 text-teal-600" /> :

                  <Circle className="w-5 h-5 text-stone-300" />
                  }
                    </div>
                    <span
                  className={`text-sm leading-snug transition-colors ${item.checked ? 'text-stone-400 line-through' : 'text-stone-700'}`}>
                  
                      {item.text}
                    </span>
                  </button>
              )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>You don't need evidence to apply.</strong> Many successful
            claims are made without any supporting documents. Evidence is
            optional — include what you have, but don't let it delay you.
          </p>
        </div>

        {/* Community & Contact */}
        <div className="space-y-3">
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-teal-50 rounded-2xl p-4 border border-teal-100 hover:border-teal-200 transition-all active:scale-[0.98]">
            
            <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-teal-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-stone-900 text-xs">
                Join our community
              </h3>
              <p className="text-[11px] text-stone-500">
                Get tips and support from others going through PIP
              </p>
            </div>
          </a>
          <a
            href="mailto:support@pippal.co.uk"
            className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-stone-100 hover:border-stone-200 transition-all active:scale-[0.98]">
            
            <div className="w-9 h-9 bg-stone-100 rounded-full flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-stone-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-stone-900 text-xs">Need help?</h3>
              <p className="text-[11px] text-stone-500">support@pippal.co.uk</p>
            </div>
          </a>
        </div>
      </div>
    </div>);

}