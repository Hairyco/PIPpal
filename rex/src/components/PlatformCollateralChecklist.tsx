import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  PLATFORM_COLLATERAL,
  type PlatformCollateral,
} from '../data/platformCollateralChecklist';

type Props = {
  /** When set, only show these platforms (default: all). */
  platformIds?: string[];
  compact?: boolean;
  /** Local checked ids — demo only until live asset wiring. */
  checkedIds?: string[];
  onToggle?: (itemId: string) => void;
};

export function PlatformCollateralChecklist({
  platformIds,
  compact = false,
  checkedIds,
  onToggle,
}: Props) {
  const platforms = PLATFORM_COLLATERAL.filter(
    (p) => !platformIds || platformIds.includes(p.id),
  );
  const [openId, setOpenId] = useState(platforms[0]?.id ?? '');

  return (
    <div className="space-y-2">
      {!compact ? (
        <div>
          <p className="text-sm font-bold text-white">Campaign checklist</p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/45">
            Marketing wallet pays for placements — you still need the creative. Tick what you have
            before DexScreener, CoinGecko, or Telegram spend goes live.
          </p>
        </div>
      ) : null}

      {platforms.map((platform) => (
        <PlatformBlock
          key={platform.id}
          platform={platform}
          open={openId === platform.id}
          onToggleOpen={() => setOpenId((id) => (id === platform.id ? '' : platform.id))}
          checkedIds={checkedIds}
          onToggleItem={onToggle}
        />
      ))}
    </div>
  );
}

function PlatformBlock({
  platform,
  open,
  onToggleOpen,
  checkedIds,
  onToggleItem,
}: {
  platform: PlatformCollateral;
  open: boolean;
  onToggleOpen: () => void;
  checkedIds?: string[];
  onToggleItem?: (itemId: string) => void;
}) {
  const done = platform.items.filter((i) => checkedIds?.includes(i.id)).length;

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
      <button
        type="button"
        onClick={onToggleOpen}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/[0.03]"
      >
        {platform.logo ? (
          <img src={platform.logo} alt="" className="h-5 w-5 shrink-0 rounded object-contain" />
        ) : (
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-white/10 text-[10px] font-bold text-white/70">
            {platform.name.slice(0, 1)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-bold text-white">{platform.name}</p>
          <p className="truncate text-[10px] text-white/40">
            {done}/{platform.items.length} ready
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white/35 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open ? (
        <div className="border-t border-white/[0.06] px-3 py-2.5">
          <p className="text-[11px] leading-relaxed text-white/45">{platform.summary}</p>
          <ul className="mt-2.5 space-y-2">
            {platform.items.map((item) => {
              const on = Boolean(checkedIds?.includes(item.id));
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onToggleItem?.(item.id)}
                    className="flex w-full items-start gap-2 rounded-lg px-1 py-1 text-left hover:bg-white/[0.03]"
                  >
                    <span
                      className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border ${
                        on
                          ? 'border-[#c8ff3d]/50 bg-[#c8ff3d]/20 text-[#d5ff69]'
                          : 'border-white/20 text-transparent'
                      }`}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-semibold text-white/85">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-white/40">{item.detail}</span>
                      {item.spec ? (
                        <span className="mt-0.5 block font-mono text-[10px] text-[#c8ff3d]/70">
                          {item.spec}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
