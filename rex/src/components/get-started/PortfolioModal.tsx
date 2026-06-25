import { X } from 'lucide-react';
import type { PortfolioItem } from '../../data/portfolios';

interface PortfolioModalProps {
  name: string;
  subtitle: string;
  banner?: string;
  avatar?: string;
  profileInitials?: string;
  items: PortfolioItem[];
  onClose: () => void;
}

export function PortfolioModal({
  name,
  subtitle,
  banner,
  avatar,
  profileInitials,
  items,
  onClose,
}: PortfolioModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="portfolio-title"
    >
      <div
        className="my-4 w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a0e17] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-32 overflow-hidden rounded-t-2xl bg-gradient-to-br from-sky-500/20 to-[#0a0e17]">
          {banner && (
            <img src={banner} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17] to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-lg bg-black/50 p-1.5 text-muted-foreground hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative z-[1] -mt-10 px-5 pb-5">
          <div className="flex items-end gap-3">
            {avatar ? (
              <img
                src={avatar}
                alt=""
                className="h-16 w-16 rounded-xl border-2 border-[#0a0e17] object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-[#0a0e17] bg-white/10 text-lg font-bold text-white">
                {profileInitials}
              </div>
            )}
            <div className="min-w-0 pb-1">
              <h2 id="portfolio-title" className="text-xl font-bold text-white">
                {name}
              </h2>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>

          <p className="mt-5 text-xs font-medium uppercase tracking-wider text-sky-400">Portfolio</p>
          <ul className="mt-3 space-y-3">
            {items.map((item) => (
              <li
                key={item.title}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-white">{item.title}</p>
                  <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">
                    {item.type}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.result}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
