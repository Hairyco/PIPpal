import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Ops UI: list Dex orders, show fill sheet, capture Helio charge + deposit.
 */
export function OpsDexFeedPage() {
  const [opsSecret, setOpsSecret] = useState('');
  const [pending, setPending] = useState<any[]>([]);
  const [recentAny, setRecentAny] = useState<any[]>([]);
  const [manualOrderId, setManualOrderId] = useState('');
  const [sheet, setSheet] = useState<any | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chargeUrl, setChargeUrl] = useState('');
  const [depositAddress, setDepositAddress] = useState('');
  const [depositAmount, setDepositAmount] = useState('299');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const headers = useCallback(
    () => ({
      'Content-Type': 'application/json',
      'x-mw-ops-secret': opsSecret.trim(),
    }),
    [opsSecret],
  );

  async function loadPending() {
    setMsg(null);
    setBusy(true);
    try {
      const q = new URLSearchParams({
        pending: '1',
        opsSecret: opsSecret.trim(),
      });
      const res = await fetch(`/api/mw-dex-feed?${q}`, { headers: headers() });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || res.statusText);
      setPending(body.pending || []);
      setRecentAny(body.recentAny || []);
      if (body.hint) {
        setMsg(body.hint);
      } else if (!(body.pending || []).length) {
        setMsg('No pending Dex orders in CTOgo yet — Approve a Dex roadmap item first.');
      } else {
        setMsg(`Loaded ${body.pendingCount ?? body.pending.length} pending Dex order(s).`);
      }
    } catch (err: any) {
      setMsg(err.message || String(err));
    } finally {
      setBusy(false);
    }
  }

  async function loadSheet(orderId: string) {
    setMsg(null);
    setSelectedId(orderId);
    setBusy(true);
    try {
      const q = new URLSearchParams({
        orderId,
        opsSecret: opsSecret.trim(),
      });
      const res = await fetch(`/api/mw-dex-feed?${q}`, {
        headers: headers(),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || res.statusText);
      setSheet(body.sheet);
      if (body.paymentInstruction?.deeplink) setChargeUrl(body.paymentInstruction.deeplink);
      if (body.paymentInstruction?.depositAddress) {
        setDepositAddress(body.paymentInstruction.depositAddress);
      }
      if (body.paymentInstruction?.depositAmount != null) {
        setDepositAmount(String(body.paymentInstruction.depositAmount));
      }
    } catch (err: any) {
      setMsg(err.message || String(err));
    } finally {
      setBusy(false);
    }
  }

  async function markFed() {
    if (!selectedId) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/mw-dex-feed', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ action: 'mark_fed', orderId: selectedId, opsSecret }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || res.statusText);
      setMsg('Marked Dex form as fed — capture Helio QR next');
      void loadPending();
    } catch (err: any) {
      setMsg(err.message || String(err));
    } finally {
      setBusy(false);
    }
  }

  async function capture() {
    if (!selectedId) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/mw-dex-feed', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          action: 'capture',
          orderId: selectedId,
          chargeUrl: chargeUrl || undefined,
          depositAddress: depositAddress || undefined,
          depositAmount: depositAmount ? Number(depositAmount) : undefined,
          opsSecret,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || res.statusText);
      setMsg(body.next || 'Captured — ready for Helio settle');
      void loadPending();
    } catch (err: any) {
      setMsg(err.message || String(err));
    } finally {
      setBusy(false);
    }
  }

  async function settle(dryRun: boolean) {
    if (!selectedId) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/mw-helio-settle', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ orderId: selectedId, opsSecret, dryRun }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || body.reason || res.statusText);
      if (dryRun) {
        setMsg(
          `Dry-run OK → ${body.deposit?.depositAddress || '?'} · ${body.deposit?.depositAmount ?? '?'} ${body.deposit?.asset || 'USDC'}`,
        );
      } else {
        setMsg(
          `Paid ${body.amount} ${body.asset} · tx ${body.signature || '—'} · status ${body.status}`,
        );
      }
      void loadPending();
    } catch (err: any) {
      setMsg(err.message || String(err));
    } finally {
      setBusy(false);
    }
  }

  const fill = sheet?.fill;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-white">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dex feed + Helio capture</h1>
          <p className="mt-2 text-sm text-white/50">
            Fill Dex marketplace from CTOgo creatives (by hand or local autofill). Capture Helio QR
            charge + deposit. Socials optional. Free proof = Dry-run only — do not Live settle
            unless you want the ad.
          </p>
        </div>
        <Link to="/ops/providers" className="text-[12px] text-white/45 underline">
          Providers
        </Link>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-[11px] text-white/55">
        <p className="text-white/40">Local autofill (free — stops before pay)</p>
        <p className="mt-1 break-all">
          cd rex → npm run dex:login → npm run dex:autofill -- --orderId=… --api=https://rex-liart.vercel.app
          --opsSecret=… --headed --post-capture
        </p>
      </div>

      <label className="mt-6 block text-[11px] font-medium text-white/40">
        Ops secret (MW_OPS_SECRET)
        <input
          type="password"
          value={opsSecret}
          onChange={(e) => setOpsSecret(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        />
      </label>

      <button
        type="button"
        disabled={busy || !opsSecret}
        onClick={() => void loadPending()}
        className="mt-4 rounded-lg bg-[#c8ff3d] px-4 py-2 text-[12px] font-bold text-[#090b14] disabled:opacity-40"
      >
        {busy ? 'Loading…' : 'Load pending Dex orders'}
      </button>
      {msg ? <p className="mt-2 text-sm text-amber-200">{msg}</p> : null}

      <div className="mt-4 flex flex-wrap items-end gap-2">
        <label className="min-w-[16rem] flex-1 text-[11px] font-medium text-white/40">
          Or paste CTOgo order UUID
          <input
            value={manualOrderId}
            onChange={(e) => setManualOrderId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-[12px] text-white"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          />
        </label>
        <button
          type="button"
          disabled={busy || !opsSecret || !manualOrderId.trim()}
          onClick={() => void loadSheet(manualOrderId.trim())}
          className="rounded-lg border border-white/15 px-3 py-2 text-[11px] font-semibold text-white/80 disabled:opacity-40"
        >
          Load fill sheet
        </button>
      </div>

      <p className="mt-3 text-[11px] text-white/35">
        Dex’s own order # (e.g. 1786…) is not a CTOgo id. CTOgo orders appear only after you{' '}
        <strong className="font-semibold text-white/55">Approve</strong> a Dex spend on a project
        roadmap.
      </p>

      <ul className="mt-6 space-y-2">
        {pending.length === 0 && recentAny.length === 0 && !busy ? (
          <li className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-5 text-[12px] text-white/45">
            Nothing queued yet. Open a project → Roadmap → Approve a DexScreener item (with title /
            pitch / image). Then click Load again.
          </li>
        ) : null}
        {pending.map((p) => (
          <li key={p.orderId}>
            <button
              type="button"
              onClick={() => void loadSheet(p.orderId)}
              className={`w-full rounded-xl border px-3 py-2 text-left text-[12px] ${
                selectedId === p.orderId
                  ? 'border-[#c8ff3d]/40 bg-[#c8ff3d]/10'
                  : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              <span className="font-semibold text-white/90">
                {p.ticker || '—'} · {p.offer || 'Dex'}
              </span>
              <span className="mt-0.5 block text-white/40">
                {p.status}
                {p.hasCharge ? ' · charge' : ''}
                {p.hasDeposit ? ' · deposit' : ' · need deposit'}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {recentAny.length > 0 && pending.length === 0 ? (
        <div className="mt-6">
          <p className="text-[11px] font-medium text-white/40">Recent CTOgo orders (any status)</p>
          <ul className="mt-2 space-y-1">
            {recentAny.map((o) => (
              <li key={o.orderId}>
                <button
                  type="button"
                  onClick={() => void loadSheet(o.orderId)}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-[11px] text-white/70"
                >
                  {o.ticker || '—'} · {o.provider || o.adapter || 'provider'} · {o.status}
                  <span className="mt-0.5 block font-mono text-[10px] text-white/35">{o.orderId}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {sheet ? (
        <div className="mt-8 space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">Fill sheet</p>
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                sheet.ready ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-400/15 text-amber-200'
              }`}
            >
              {sheet.ready ? 'Ready' : 'Incomplete'}
            </span>
          </div>
          {!sheet.ready ? (
            <p className="text-[12px] text-amber-200">Missing: {sheet.hardMissing?.join(', ')}</p>
          ) : null}
          {sheet.softWarnings?.length ? (
            <p className="text-[11px] text-white/40">{sheet.softWarnings[0]}</p>
          ) : null}

          <dl className="space-y-2 text-[12px]">
            {(
              [
                ['Chain', fill?.chain],
                ['Token', fill?.tokenAddress],
                ['Package', fill?.packageLabel],
                ['Title', fill?.title],
                ['Pitch', fill?.pitch],
                ['Image', fill?.squareImageUrl],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5 border-b border-white/[0.06] pb-2">
                <dt className="text-white/40">{k}</dt>
                <dd className="break-all font-medium text-white/85">{v || '—'}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap gap-2">
            <a
              href="https://marketplace.dexscreener.com/product/ad/order"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-white/80"
            >
              Open Dex order form
            </a>
            <button
              type="button"
              onClick={() => void markFed()}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-white/80"
            >
              Mark form fed
            </button>
          </div>

          <div className="space-y-2 border-t border-white/[0.08] pt-4">
            <p className="text-[12px] font-semibold text-white/80">Helio capture (after Pay with QR)</p>
            <label className="block text-[11px] text-white/45">
              Charge URL
              <input
                value={chargeUrl}
                onChange={(e) => setChargeUrl(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-2 text-[12px] text-white"
                placeholder="https://moonpay.hel.io/charge/…"
              />
            </label>
            <label className="block text-[11px] text-white/45">
              Deposit address
              <input
                value={depositAddress}
                onChange={(e) => setDepositAddress(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-2 text-[12px] text-white"
                placeholder="Solana address from QR / transfer UI"
              />
            </label>
            <label className="block text-[11px] text-white/45">
              Deposit amount (USDC)
              <input
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="mt-1 w-40 rounded-lg border border-white/10 bg-black/40 px-2.5 py-2 text-[12px] text-white"
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => void capture()}
              className="rounded-lg bg-[#c8ff3d] px-4 py-2 text-[12px] font-bold text-[#090b14] disabled:opacity-40"
            >
              Save capture
            </button>
          </div>

          <div className="space-y-2 border-t border-white/[0.08] pt-4">
            <p className="text-[12px] font-semibold text-white/80">Stage D settle (real Mainnet money)</p>
            <p className="text-[11px] text-white/40">
              Dry-run checks deposit only. Live pay sends USDC from keeper/ops wallet — cheapest Dex
              package is typically $299.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy || !selectedId}
                onClick={() => void settle(true)}
                className="rounded-lg border border-white/15 px-3 py-2 text-[11px] font-semibold text-white/80 disabled:opacity-40"
              >
                Dry-run settle
              </button>
              <button
                type="button"
                disabled={busy || !selectedId}
                onClick={() => {
                  if (
                    !window.confirm(
                      'Send real Mainnet USDC to the Helio deposit now? This spends real money.',
                    )
                  ) {
                    return;
                  }
                  void settle(false);
                }}
                className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-[11px] font-bold text-amber-100 disabled:opacity-40"
              >
                Live settle (pay now)
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
