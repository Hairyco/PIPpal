import type { ProjectCommunityLinks } from '../../utils/projectCommunity';

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/30';

interface CommunityLinksFormProps {
  value: ProjectCommunityLinks;
  onChange: (value: ProjectCommunityLinks) => void;
}

export function CommunityLinksForm({ value, onChange }: CommunityLinksFormProps) {
  const set = (patch: Partial<ProjectCommunityLinks>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-white">Community links</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Telegram is required. Discord is optional.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Telegram <span className="text-sky-400">*</span>
          </label>
          <input
            className={inputClass}
            placeholder="https://t.me/yourgroup or @yourgroup"
            value={value.telegramGroup}
            onChange={(e) => set({ telegramGroup: e.target.value })}
            required
            aria-required="true"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Discord <span className="text-white/30">(optional)</span>
          </label>
          <input
            className={inputClass}
            placeholder="https://discord.gg/…"
            value={value.discordUrl ?? ''}
            onChange={(e) => set({ discordUrl: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
