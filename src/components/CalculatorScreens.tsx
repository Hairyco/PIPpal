import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAppContext } from './AppContext';
import { TimelineCalculator } from './TimelineCalculator';
import { PaymentCalculator } from './PaymentCalculator';
import { BackpayCalculator } from './BackpayCalculator';
function CalculatorWrapper({
  title,
  children



}: {title: string;children: React.ReactNode;}) {
  const { goBack } = useAppContext();
  return (
    <div className="flex flex-col h-full bg-stone-50">
      <div className="px-5 md:px-8 py-4 flex items-center gap-3 bg-white border-b border-stone-100 sticky top-0 z-10">
        <button
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 transition-all">
          
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">{title}</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6">{children}</div>
    </div>);

}
export function TimelineCalculatorScreen() {
  return (
    <CalculatorWrapper title="Timeline Tracker">
      <TimelineCalculator />
    </CalculatorWrapper>);

}
export function PaymentCalculatorScreen() {
  return (
    <CalculatorWrapper title="PIP Award Calculator">
      <PaymentCalculator />
    </CalculatorWrapper>);

}
export function BackpayCalculatorScreen() {
  return (
    <CalculatorWrapper title="Backpay Calculator">
      <BackpayCalculator />
    </CalculatorWrapper>);

}