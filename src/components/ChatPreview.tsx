import React from 'react';
import { ArrowRight, MessageSquare, HeartHandshake } from 'lucide-react';
interface ChatPreviewProps {
  onStart: () => void;
}
export function ChatPreview({ onStart }: ChatPreviewProps) {
  return (
    <section className="px-5 md:px-8 py-8">
      <div className="text-center mb-5">
        <h2 className="text-xl font-bold text-stone-900 mb-1">
          See PIPpal in action
        </h2>
        <p className="text-stone-500 text-sm">
          Tap your answers. We write your PIP form responses.
        </p>
      </div>

      {/* Chat Mockup */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-5">
        {/* Mini Header */}
        <div className="bg-teal-700 px-4 py-2.5 flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-white" />
          <span className="text-white text-xs font-bold">PIPpal Assistant</span>
          <span className="text-teal-200 text-[10px] ml-auto">
            Q11: Planning Journeys
          </span>
        </div>

        {/* Chat Messages */}
        <div className="p-4 space-y-3 bg-stone-50">
          {/* Bot message */}
          <div className="flex justify-start">
            <div className="max-w-[80%] bg-white rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs text-stone-800 leading-relaxed border border-stone-100 shadow-sm">
              Let's talk about planning and following journeys. Can you plan a
              route to somewhere on your own?
            </div>
          </div>

          {/* User response */}
          <div className="flex justify-end">
            <div className="max-w-[75%] bg-teal-700 rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-xs text-white leading-relaxed">
              Sometimes, but I struggle
            </div>
          </div>

          {/* Bot follow-up */}
          <div className="flex justify-start">
            <div className="max-w-[80%] bg-white rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs text-stone-800 leading-relaxed border border-stone-100 shadow-sm">
              What mainly causes you to struggle? Is it anxiety/distress, or
              physical difficulties?
            </div>
          </div>

          {/* Tap options */}
          <div className="space-y-1.5 pl-1">
            <div className="bg-white rounded-lg px-3 py-2 text-xs font-medium text-stone-700 border border-stone-200 shadow-sm inline-block">
              Mainly anxiety or distress
            </div>
            <div className="bg-white rounded-lg px-3 py-2 text-xs font-medium text-stone-700 border border-stone-200 shadow-sm inline-block">
              Mainly physical or cognitive
            </div>
          </div>
        </div>

        {/* Result Preview Strip */}
        <div className="bg-emerald-50 border-t border-emerald-100 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-emerald-700 font-black text-xs">10</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              Your generated answer
            </div>
            <div className="text-[10px] text-emerald-700 truncate">
              Tailored to your condition, using DWP language...
            </div>
          </div>
        </div>
      </div>

      {/* Caption + CTA */}
      <div className="bg-stone-100 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center shrink-0">
          <MessageSquare className="w-5 h-5 text-teal-600" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-stone-700 font-medium leading-relaxed">
            Just tap your answers — we generate form-ready responses written in
            the exact format the DWP scores against.
          </p>
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full mt-4 bg-orange-500 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-orange-600 active:scale-[0.98] transition-all shadow-sm">
        
        Try it yourself
        <ArrowRight className="w-4 h-4" />
      </button>
    </section>);

}