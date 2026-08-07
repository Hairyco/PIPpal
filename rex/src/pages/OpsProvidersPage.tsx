import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMwProviders } from '../lib/marketingWalletApi';
import { MARKETING_SERVICE_FEE_LABEL } from '../data/chainConfig';

/**
 * Protected CTOgo ops surface for provider catalog.
 * Mutations require MW_OPS_SECRET via API; this page is read + activate form for ops.
 */
export function OpsProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [feeNote, setFeeNote] = useState<string | null>(null);
  const [opsSecret, setOpsSecret] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void fetchMwProviders(true).then((data) => {
      setProviders(data.providers || []);
      setFeeNote(data.feeNote || null);
    });
  }, []);

  async function setActive(id: string, active: boolean) {
    setMsg(null);
    try {
      const res = await fetch('/api/mw-providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-mw-ops-secret': opsSecret,
        },
        body: JSON.stringify({ action: 'set_active', id, active }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || res.statusText);
      setMsg(active ? 'Provider activated' : 'Provider suspended');
      const refreshed = await fetchMwProviders(true);
      setProviders(refreshed.providers || []);
    } catch (err: any) {
      setMsg(err.message || String(err));
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-white">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CTOgo provider ops</h1>
          <p className="mt-2 text-sm text-white/50">
            Whitelist wallets on-chain first, then activate catalog rows.{' '}
            {MARKETING_SERVICE_FEE_LABEL} applies at disbursement.
          </p>
        </div>
        <Link to="/ops/dex-feed" className="text-[12px] text-white/45 underline">
          Dex feed + Helio
        </Link>
      </div>
      {feeNote ? <p className="mt-2 text-xs text-[#d5ff69]/80">{feeNote}</p> : null}

      <label className="mt-6 block text-[11px] font-medium text-white/40">
        Ops secret (MW_OPS_SECRET)
        <input
          type="password"
          value={opsSecret}
          onChange={(e) => setOpsSecret(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          placeholder="Required for activate / suspend"
        />
      </label>
      {msg ? <p className="mt-2 text-sm text-amber-200">{msg}</p> : null}

      <ul className="mt-8 space-y-3">
        {providers.length === 0 ? (
          <li className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-white/45">
            No providers loaded. Apply the Supabase migration and configure env, or seed rows in
            SQL.
          </li>
        ) : (
          providers.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{p.display_name}</p>
                  <p className="text-[11px] text-white/40">
                    {p.slug} · {p.adapter_type} · {p.wallet_address}
                  </p>
                  <p className="text-[11px] text-white/35">
                    {p.active ? 'Active' : 'Inactive'}
                    {p.whitelist_tx ? ` · wl ${p.whitelist_tx.slice(0, 8)}…` : ' · no whitelist tx'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void setActive(p.id, true)}
                    className="rounded-lg bg-[#c8ff3d] px-3 py-1.5 text-[11px] font-bold text-[#090b14]"
                  >
                    Activate
                  </button>
                  <button
                    type="button"
                    onClick={() => void setActive(p.id, false)}
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-white/70"
                  >
                    Suspend
                  </button>
                </div>
              </div>
              {Array.isArray(p.mw_provider_offers) && p.mw_provider_offers.length > 0 ? (
                <ul className="mt-2 space-y-1 border-t border-white/[0.06] pt-2 text-[12px] text-white/55">
                  {p.mw_provider_offers.map((o: any) => (
                    <li key={o.id} className="flex justify-between gap-2">
                      <span>{o.label}</span>
                      <span className="tabular-nums text-white/80">${Number(o.price_usd)}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
