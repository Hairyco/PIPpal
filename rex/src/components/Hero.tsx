import { Link } from 'react-router-dom';
import { PartnerLogos } from './PartnerLogos';

export function Hero() {
  return (
    <div className="container my-16 text-center">
      <h1 className="font-serif text-4xl font-bold md:text-7xl">
        <span className="block text-white">Create any business</span>
        <span className="block bg-gradient-to-br from-white to-white/10 bg-clip-text text-transparent">
          in minutes
        </span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
        The world&apos;s first automated incubator — launch on a bonding curve for $1, fund growth
        from every curve trade, and unlock vetted delivery at milestones.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/get-started" className="dex-btn">
          Launch for $1
        </Link>
      </div>

      <PartnerLogos />
    </div>
  );
}
