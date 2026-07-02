import { ArrowLeft, ArrowRight } from 'lucide-react';
import { launchModeOptions, type LaunchModeId } from '../../data/launchModes';

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/30';

interface LaunchTimingStepProps {
  launchMode: LaunchModeId;
  stagingLaunchDate: string;
  onLaunchModeChange: (mode: LaunchModeId) => void;
  onStagingLaunchDateChange: (date: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function LaunchTimingStep({
  launchMode,
  stagingLaunchDate,
  onLaunchModeChange,
  onStagingLaunchDateChange,
  onBack,
  onContinue,
}: LaunchTimingStepProps) {
  const canProceed = launchMode === 'immediate' || stagingLaunchDate.length > 0;

  return (
    <div className="space-y-5">
      <div className="dex-card">
        <div className="relative z-[1] space-y-4">
          <div>
            <h2 className="font-semibold text-white">When do you want to go live?</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Launch right away and start trading, or join staging to appear in Launching Soon and
              build community interest first.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {launchModeOptions.map((option) => {
              const Icon = option.icon;
              const selected = launchMode === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onLaunchModeChange(option.id)}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    selected
                      ? 'border-sky-500/50 bg-sky-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        selected ? 'bg-sky-500/20' : 'bg-white/5'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${selected ? 'text-sky-400' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{option.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1 border-t border-white/10 pt-3">
                    {option.bullets.map((bullet) => (
                      <li key={bullet} className="text-[11px] leading-relaxed text-muted-foreground">
                        · {bullet}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
          {launchMode === 'staging' && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <label className="mb-1.5 block text-xs font-medium text-amber-200">
                Target launch date
              </label>
              <input
                type="date"
                className={inputClass}
                value={stagingLaunchDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => onStagingLaunchDateChange(e.target.value)}
              />
              <p className="mt-2 text-[11px] text-muted-foreground">
                Your project appears in Launching Soon until this date — or until you flip it live
                from your dashboard.
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          disabled={!canProceed}
          onClick={onContinue}
          className="dex-btn disabled:opacity-40"
        >
          Continue
          <ArrowRight className="ml-2 inline h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
