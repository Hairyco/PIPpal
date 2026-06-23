import { Layout, BackLink } from '../components/Layout';
import { SupplierApplicationForm } from '../components/supplier/SupplierApplicationForm';
import { supplierTypeInfo, vettingSteps } from '../data/supplierVetting';

export function BecomeSupplierPage() {
  return (
    <Layout>
      <div className="container py-8 pb-16">
        <BackLink />

        <div className="mx-auto mt-8 max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-wider text-sky-400">
            Supplier program
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-white md:text-5xl">
            Become a preferred supplier
          </h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Rex founders need vetted builders they can trust. Apply to join our supplier marketplace
            — every partner goes through vetting before they can be assigned to roadmaps and receive
            milestone payouts.
          </p>
        </div>

        <section className="mx-auto mt-12 max-w-3xl">
          <h2 className="font-serif text-2xl text-white">How vetting works</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Whether you are a solo builder or an agency, the path to preferred status is the same.
          </p>

          <ol className="mt-6 space-y-4">
            {vettingSteps.map((step) => {
              const Icon = step.icon;
              return (
                <li key={step.id} className="dex-card">
                  <div className="relative z-[1] flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-sky-400">Step {step.step}</p>
                      <h3 className="font-semibold text-white">{step.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="mx-auto mt-12 max-w-3xl">
          <h2 className="font-serif text-2xl text-white">Who can apply</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(['individual', 'agency'] as const).map((type) => {
              const info = supplierTypeInfo[type];
              return (
                <div key={type} className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-sky-400">
                    {info.subtitle}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-white">{info.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{info.description}</p>
                  <ul className="mt-4 space-y-2">
                    {info.perks.map((perk) => (
                      <li key={perk} className="text-xs text-foreground/80">
                        · {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-3xl">
          <h2 className="font-serif text-2xl text-white">Start your application</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose individual or agency below. There is no fee to apply — approval is based on
            quality, delivery history, and fit with Rex projects.
          </p>
          <div className="mt-6">
            <SupplierApplicationForm />
          </div>
        </section>
      </div>
    </Layout>
  );
}
