import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppSidebar';
import { MarketingWalletExplainer } from '../components/MarketingWalletExplainer';

export function MarketingWalletPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#2aabee]/90">
          Marketing wallet
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight">
          How spend gets funded
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Trade tax fills a non-custodial vault. When milestones hit, Rex pays suppliers for growth.
        </p>

        <div className="mt-8">
          <MarketingWalletExplainer balanceUsd={420} />
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            to="/fees"
            className="rounded-lg border border-white/[0.1] px-4 py-2.5 text-xs font-semibold text-white/70 hover:text-white"
          >
            Fee guidelines
          </Link>
          <Link
            to="/services"
            className="rounded-lg bg-[#c8ff3d] px-4 py-2.5 text-xs font-bold text-[#090b14] hover:bg-[#d5ff69]"
          >
            Services
          </Link>
        </div>
      </main>
    </AppShell>
  );
}
