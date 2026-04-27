import React from 'react';
import { ShieldCheck, Users, Star, Clock } from 'lucide-react';
const stats = [
{
  label: 'Applications assisted',
  value: '12,400+',
  icon: Users
},
{
  label: 'Average rating',
  value: '4.9/5',
  icon: Star
},
{
  label: 'Success improvement',
  value: '3× more likely',
  icon: ShieldCheck
},
{
  label: 'Average completion time',
  value: '35 mins',
  icon: Clock
}];

export function TrustSection() {
  return (
    <section className="px-5 md:px-8 py-6">
      <div className="bg-stone-100 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-stone-900 mb-4 text-center">
          Trusted by thousands
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-3.5 text-center">
                
                <Icon className="w-5 h-5 text-teal-600 mx-auto mb-2" />
                <div className="font-bold text-stone-900 text-lg leading-tight">
                  {stat.value}
                </div>
                <div className="text-xs text-stone-500 mt-1">{stat.label}</div>
              </div>);

          })}
        </div>
      </div>
    </section>);

}