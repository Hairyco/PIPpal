import React from 'react';
import { Clock, Calculator, Coins, Map } from 'lucide-react';
const features = [
{
  id: 'timeline',
  title: 'Timeline Tracker',
  desc: 'Know exactly where you are in the process. Track from application to decision with realistic timeframes.',
  icon: Clock,
  color: 'text-blue-600',
  bg: 'bg-blue-50'
},
{
  id: 'backpay',
  title: 'Backpay Calculator',
  desc: 'Find out how much you could be owed. Calculate potential backpay based on your application date.',
  icon: Calculator,
  color: 'text-emerald-600',
  bg: 'bg-emerald-50'
},
{
  id: 'scenarios',
  title: 'Payment Scenarios',
  desc: "See what you'd receive for every combination — enhanced, standard, daily living, mobility.",
  icon: Coins,
  color: 'text-amber-600',
  bg: 'bg-amber-50'
},
{
  id: 'process',
  title: 'Decision Process Guide',
  desc: 'Understand what happens at every stage. No more guessing what "caseworker assigned" means.',
  icon: Map,
  color: 'text-purple-600',
  bg: 'bg-purple-50'
}];

export function Features() {
  return (
    <section className="px-5 md:px-8 py-6">
      <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-2">
        Everything you need
      </h2>
      <p className="text-stone-500 text-sm mb-6">
        All the tools to give you certainty and peace of mind.
      </p>

      <div className="flex flex-col md:grid md:grid-cols-2 md:gap-6 gap-4">
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.id}
              className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex gap-4 items-start">
              
              <div
                className={`shrink-0 w-12 h-12 rounded-xl ${feat.bg} flex items-center justify-center`}>
                
                <Icon className={`w-6 h-6 ${feat.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 mb-1">
                  {feat.title}
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </div>);

        })}
      </div>
    </section>);

}