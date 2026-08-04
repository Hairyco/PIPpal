import { Link } from 'react-router-dom';
import { CtoGoLogo } from './CtoGoLogo';
import { hasFounderProject } from '../utils/founderProject';

export function Header() {
  const showDashboard = hasFounderProject();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-black">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-3 sm:px-5">
        <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="CTOgo home">
          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#1c1c1e] ring-1 ring-white/10">
            <CtoGoLogo size={28} className="rounded-full" />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-bold leading-tight text-white">CTOgo</p>
            <p className="truncate text-[11px] font-medium leading-snug text-white/40">
              The Home of Community Takeovers
            </p>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {showDashboard && (
            <Link
              to="/dashboard"
              className="rounded-full bg-[#c8ff3d]/15 px-3 py-1.5 text-[12px] font-semibold text-[#d5ff69] ring-1 ring-[#c8ff3d]/35 transition hover:bg-[#c8ff3d]/25"
            >
              Dashboard
            </Link>
          )}
          <Link
            to="/become-a-supplier"
            className="hidden rounded-full bg-[#1c1c1e] px-3 py-1.5 text-[12px] font-semibold text-white/70 ring-1 ring-white/10 transition hover:text-white sm:inline-flex"
          >
            Sign up
          </Link>
          <a
            href="#"
            className="rounded-full bg-[#1c1c1e] px-3 py-1.5 text-[12px] font-semibold text-white/70 ring-1 ring-white/10 transition hover:text-white"
          >
            Sign In
          </a>
        </div>
      </div>
    </header>
  );
}
