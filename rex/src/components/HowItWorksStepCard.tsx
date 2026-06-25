import type { HowItWorksStep } from '../data/howItWorks';

interface HowItWorksStepCardProps {
  step: HowItWorksStep;
  showBullets?: boolean;
  maxBullets?: number;
}

export function HowItWorksStepCard({
  step,
  showBullets = false,
  maxBullets,
}: HowItWorksStepCardProps) {
  const bullets = maxBullets ? step.bullets.slice(0, maxBullets) : step.bullets;

  return (
    <div className="dex-card h-full">
      <div className="relative z-[1] flex h-full flex-col">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-rex-gradient text-sm font-bold text-white"
          aria-hidden
        >
          {step.step}
        </div>

        <h3 className="mt-4 font-semibold text-white">{step.title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{step.subtitle}</p>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {step.description}
          {step.highlight && (
            <>
              {' '}
              <span className="font-medium text-sky-400">{step.highlight}</span>
            </>
          )}
        </p>

        {showBullets && bullets.length > 0 && (
          <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
            {bullets.map((bullet) => (
              <li key={bullet} className="text-xs leading-relaxed text-foreground/70">
                · {bullet}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
