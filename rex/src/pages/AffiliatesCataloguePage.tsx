import { Link } from 'react-router-dom';
import { Layout, BackLink } from '../components/Layout';
import { DemoPreviewBadge } from '../components/promote/DemoPreviewBadge';
import { affiliateCatalogue } from '../data/affiliateCatalogue';

export function AffiliatesCataloguePage() {
  return (
    <Layout>
      <div className="container min-w-0 overflow-x-hidden py-8 pb-16">
        <BackLink />

        <div className="mt-6 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-400">
              Promoter catalogue
            </p>
            <DemoPreviewBadge />
          </div>
          <h1 className="mt-2 font-serif text-3xl text-white md:text-4xl">Affiliate programmes</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join Rex projects that pay commission on referred bonding-curve buys. All payouts are
            funded from each founder&apos;s marketing wallet — not a separate budget.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-200/90">
          Demo catalogue — tracking and payouts are not live yet. This preview shows how promoters
          will discover and join programmes.
        </div>

        <div className="mt-6 space-y-3 md:hidden">
          {affiliateCatalogue.map((row) => (
            <div
              key={row.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <p className="font-medium text-white">{row.name}</p>
              <p className="text-xs text-muted-foreground">
                {row.symbol} · {row.category}
              </p>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <dt className="text-muted-foreground">Conv.</dt>
                  <dd className="mt-0.5 font-medium text-white">{row.conversion}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">EPC</dt>
                  <dd className="mt-0.5 font-medium text-white">{row.epc}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Commission</dt>
                  <dd className="mt-0.5 font-medium text-sky-300">{row.commission}</dd>
                </div>
              </dl>
              <button
                type="button"
                disabled
                className="mt-3 w-full rounded-md bg-[#c8f542] py-2 text-xs font-semibold text-black opacity-60"
              >
                + Join (demo)
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 hidden overflow-x-auto rounded-xl border border-white/10 md:block">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Conv.</th>
                <th className="px-4 py-3 font-medium">EPC</th>
                <th className="px-4 py-3 font-medium">Commission</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {affiliateCatalogue.map((row) => (
                <tr key={row.id} className="border-b border-white/5">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.symbol}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{row.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.conversion}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.epc}</td>
                  <td className="px-4 py-3 text-sky-300">{row.commission}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled
                      className="rounded-md bg-[#c8f542] px-2.5 py-1 text-[10px] font-semibold text-black opacity-60"
                    >
                      + Join
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Running a project?{' '}
          <Link to="/get-started" className="text-sky-400 hover:text-sky-300">
            Launch on Rex
          </Link>{' '}
          and enable affiliates from Promote after launch.
        </p>
      </div>
    </Layout>
  );
}
