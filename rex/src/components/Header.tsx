import { Link } from 'react-router-dom';
import { CtoGoLogo } from './CtoGoLogo';
import { hasFounderProject } from '../utils/founderProject';

export function Header() {
  const showDashboard = hasFounderProject();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/75 backdrop-blur-md">
      <div className="container py-4">
        <div className="flex h-10 flex-row items-center justify-between">
        <Link to="/" className="flex flex-row items-center space-x-2" aria-label="CTOgo home">
          <CtoGoLogo size={28} />
          <div className="flex flex-col items-baseline -space-y-0.5 md:flex-row md:space-x-2 md:space-y-0">
            <span className="font-serif text-lg text-foreground">CTOgo</span>
            <span className="text-sm text-white/50 md:text-base">Community takeovers</span>
          </div>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          {showDashboard && (
            <Link
              to="/dashboard"
              className="text-sm font-medium text-sky-400 transition-opacity hover:opacity-80"
            >
              Dashboard
            </Link>
          )}
          <Link
            to="/become-a-supplier"
            className="text-sm text-foreground transition-opacity hover:opacity-80"
          >
            Sign up
          </Link>
          <a href="#" className="text-sm text-foreground transition-opacity hover:opacity-80">
            Sign In
          </a>
        </div>
        </div>
      </div>
    </header>
  );
}
