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
        The world&apos;s first automated incubator with built-in marketing wallets.
      </p>
      <PartnerLogos />
    </div>
  );
}
