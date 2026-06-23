import { Link } from 'react-router-dom';

function RexLogo({ size = 25 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 25 25" fill="none" aria-hidden>
      <path
        d="M12.5 2C7.5 2 4 6 4 10.5c0 3.2 1.8 5.8 4.5 7.2L7 22l4.5-2.5L16 22l-1.5-4.3c2.7-1.4 4.5-4 4.5-7.2C19 6 15.5 2 12.5 2z"
        fill="currentColor"
      />
      <circle cx="9.5" cy="10" r="1.2" fill="#030711" />
      <circle cx="15.5" cy="10" r="1.2" fill="#030711" />
    </svg>
  );
}

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
            Become a supplier
          </Link>
          <a href="#" className="text-sm text-foreground transition-opacity hover:opacity-80">
            Sign In
          </a>
        </div>
      </div>
    </header>
  );
}
