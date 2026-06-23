import { Link } from 'react-router-dom';
import { Header } from './Header';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        className="absolute left-0 top-0 -z-10 h-screen w-full bg-black bg-hero-radial"
        aria-hidden
      />
      <Header />
      <main className="flex-grow">{children}</main>
    </div>
  );
}

export function BackLink({ to = '/', label = 'Back to home' }: { to?: string; label?: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      ← {label}
    </Link>
  );
}
