import { Lightbulb, Rocket } from 'lucide-react';
import type { ProjectOrigin } from '../../utils/projectOrigin';

interface ProjectOriginPickerProps {
  value: ProjectOrigin;
  onChange: (value: ProjectOrigin) => void;
}

export function ProjectOriginPicker({ value, onChange }: ProjectOriginPickerProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Starting point</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <OriginOption
          active={value === 'new'}
          icon={Lightbulb}
          title="New idea"
          description="Starting from scratch — Rex builds and markets your token and product."
          onClick={() => onChange('new')}
        />
        <OriginOption
          active={value === 'existing'}
          icon={Rocket}
          title="Existing project"
          description="You already have a website, app, or product — upload assets and use Rex to grow."
          onClick={() => onChange('existing')}
        />
      </div>
    </div>
  );
}

function OriginOption({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: typeof Lightbulb;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-3 text-left transition-colors ${
        active
          ? 'border-sky-500/50 bg-sky-500/10'
          : 'border-white/10 bg-white/[0.03] hover:border-white/20'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            active ? 'bg-sky-500/20 text-sky-300' : 'bg-white/5 text-muted-foreground'
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
        </span>
      </div>
    </button>
  );
}
