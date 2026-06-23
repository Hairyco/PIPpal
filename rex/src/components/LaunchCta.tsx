export function LaunchCta() {
  return (
    <section className="container my-16 text-center">
      <p className="font-serif text-3xl text-white md:text-4xl">
        Launch your project for just{' '}
        <span className="bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
          $1
        </span>
      </p>

      <button type="button" className="dex-btn mt-8">
        Get Started
      </button>
    </section>
  );
}
