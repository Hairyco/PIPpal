import React from 'react';
interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
}
export function ProgressBar({
  currentStep,
  totalSteps,
  label
}: ProgressBarProps) {
  const percentage = currentStep / totalSteps * 100;
  return (
    <div className="px-5 pt-3 pb-1 bg-white">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-medium text-stone-500">
          {label || `Step ${currentStep} of ${totalSteps}`}
        </span>
        <span className="text-[10px] font-bold text-teal-700">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-600 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`
          }} />
        
      </div>
    </div>);

}