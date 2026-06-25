import { Link } from 'react-router-dom';
import { RexLogo } from './RexLogo';

export function Header() {
  return (
    <header className="container sticky top-0 z-50 py-4 backdrop-blur">
      <div className="flex h-10 flex-row items-center justify-between">
        <Link to="/" className="flex flex-row items-center space-x-2">
          <RexLogo />
          <div className="flex flex-col items-baseline -space-y-0.5 md:flex-row md:space-x-2 md:space-y-0">
            <span className="font-serif text-lg text-foreground">Rex</span>
            <span className="text-sm text-white/50 md:text-base">Incubator</span>
          </div>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
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
    </header>
  );
}
