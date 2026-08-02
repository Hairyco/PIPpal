import { Link } from 'react-router-dom';
import { Layout, BackLink } from '../components/Layout';
import { DemoPreviewBadge } from '../components/promote/DemoPreviewBadge';
import { affiliateCatalogue } from '../data/affiliateCatalogue';
import { SCOUT_FEE_ENGINE, formatBpsPercent } from '../data/chainConfig';
import { coinPath } from '../utils/scoutReferral';

const SCOUT_PCT = formatBpsPercent(SCOUT_FEE_ENGINE.scoutBps);

export function AffiliatesCataloguePage() {
  return (
    <Layout>
      <div className="container min-w-0 overflow-x-hidden py-8 pb-16">
        <BackLink />

        <div className="mt-6 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-400">
              Raid catalogue
            </p>
            <DemoPreviewBadge />
          </div>
          <h1 className="mt-2 font-serif text-3xl text-white md:text-4xl">Share & earn</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Open any coin page, connect your wallet, and copy your raid link. Earn {SCOUT_PCT}{' '}
            instant SOL on CTOgo swaps attributed to you ({SCOUT_FEE_ENGINE.attributionHours}h
            last-click). Commissions fill your wallet — not the project marketing wallet. No link →
            CTOgo keeps {SCOUT_PCT}.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-200/90">
          On-chain raid payouts go live with the fee engine — SOL streaming lands when the swap
          routes {SCOUT_PCT} to your ref wallet (or treasury if unclaimed). Full swap splits:{' '}
          <Link to="/fees" className="font-medium text-amber-100 underline-offset-2 hover:underline">
            Fees
          </Link>
          .
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
                  <dt className="text-muted-foreground">Raid</dt>
                  <dd className="mt-0.5 font-medium text-sky-300">{row.commission}</dd>
                </div>
              </dl>
              <Link
                to={coinPath(row.symbol)}
                className="mt-3 flex w-full items-center justify-center rounded-md bg-[#c8f542] py-2 text-xs font-semibold text-black transition hover:bg-[#d5ff69]"
              >
                Open coin page
              </Link>
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
                <th className="px-4 py-3 font-medium">Raid cut</th>
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
                    <Link
                      to={coinPath(row.symbol)}
                      className="rounded-md bg-[#c8f542] px-2.5 py-1 text-[10px] font-semibold text-black transition hover:bg-[#d5ff69]"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Running a project?{' '}
          <Link to="/launch" className="text-sky-400 hover:text-sky-300">
            List or launch on CTOgo
          </Link>{' '}
          — every coin page includes Raid share links automatically.
        </p>
      </div>
    </Layout>
  );
}
