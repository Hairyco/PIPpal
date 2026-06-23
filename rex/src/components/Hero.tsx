import { Link } from 'react-router-dom';
import { PartnerLogos } from './PartnerLogos';

export function Hero() {
  return (
    <div className="container my-16 text-center">
      <span className="block font-serif text-4xl font-bold text-white md:text-7xl">
        Create anything
      </span>
      <h1 className="bg-gradient-to-br from-white to-white/10 bg-clip-text text-4xl font-bold text-transparent md:text-7xl">
        Incubator
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
        The safest place to trade. No dev. No rugs.
        <span className="mt-1 block">Automated marketing wallets</span>
      </p>
      <PartnerLogos />
      <Link
        to="/become-a-supplier"
        className="mt-8 inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-sky-400/40 hover:bg-white/10"
      >
        Become a supplier
      </Link>
    </div>
  );
}
