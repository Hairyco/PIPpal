/**
 * Keeper tick — claim queued campaign orders, submit on-chain disburse (when configured),
 * confirm receipt, one auto-retry, then manual_review.
 *
 * Cost: free to build; production needs paid Solana RPC + Supabase (free tier then paid).
 * On-chain submit requires KEEPER_SECRET_KEY + REX_MVP_PROGRAM_ID + RPC — skipped safely when missing.
 */

import { audit, mwConfigured, sbFetch } from '../lib/mw/supabase.js';
import { invoiceWithServiceFee } from '../lib/mw/fees.js';
import { fulfilOrder } from '../lib/mw/adapters.js';

function assertCron(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return; // local/dev without cron auth
  const auth = req.headers.authorization || '';
  if (auth !== `Bearer ${secret}`) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }
}

async function claimQueuedOrders(limit = 5) {
  const params = new URLSearchParams({
    select: '*,mw_projects(*),mw_provider_offers(*),mw_providers(*)',
    status: 'in.(queued,retrying)',
    order: 'created_at.asc',
    limit: String(limit),
  });
  return sbFetch(`mw_campaign_orders?${params}`);
}

async function markOrder(id, patch) {
  return sbFetch(`mw_campaign_orders?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
  });
}

/**
 * Placeholder on-chain submit. When KEEPER_SECRET_KEY is unset, records a dry-run failure
 * so ops can use manual_review — never pretends a mainnet payment succeeded.
 */
async function submitDisburse({ order, project, provider }) {
  if (!process.env.KEEPER_SECRET_KEY || !process.env.SOLANA_RPC_URL) {
    return {
      ok: false,
      dryRun: true,
      error:
        'Keeper wallet / RPC not configured — payment left for manual_review (free to configure locally; RPC is paid for production).',
    };
  }
  // Live Anchor CPI wiring lands with deployed program id + IDL; keep fail-closed.
  return {
    ok: false,
    dryRun: false,
    error: `On-chain disburse client not bound yet for program ${process.env.REX_MVP_PROGRAM_ID || 'unset'}; order ${order.id} / vault ${project.marketing_vault} / supplier ${provider.wallet_address}.`,
  };
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    assertCron(req);

    if (!mwConfigured()) {
      return res.status(503).json({
        ok: false,
        error: 'Supabase not configured',
        hint: 'Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (free tier available).',
      });
    }

    const orders = (await claimQueuedOrders()) || [];
    const results = [];

    for (const order of orders) {
      const project = order.mw_projects;
      const offer = order.mw_provider_offers;
      const provider = order.mw_providers;

      if (!project || project.spend_paused || !project.spend_unlocked) {
        await markOrder(order.id, {
          status: 'manual_review',
          last_error: 'Project spend paused or not unlocked',
        });
        results.push({ id: order.id, status: 'manual_review', reason: 'paused' });
        continue;
      }
      if (!provider?.active || provider.wallet_address === 'PENDING_WHITELIST') {
        await markOrder(order.id, {
          status: 'manual_review',
          last_error: 'Provider inactive or not whitelisted',
        });
        results.push({ id: order.id, status: 'manual_review', reason: 'provider' });
        continue;
      }

      const attemptNo = (order.attempt_count || 0) + 1;
      const idempotencyKey = `${order.id}:${attemptNo}`;
      await sbFetch('mw_payment_attempts', {
        method: 'POST',
        body: JSON.stringify({
          order_id: order.id,
          attempt_no: attemptNo,
          idempotency_key: idempotencyKey,
          status: 'started',
        }),
      });

      await markOrder(order.id, { status: 'paying', attempt_count: attemptNo });

      // Recompute fee math on-chain args (20% on top).
      const fees = invoiceWithServiceFee(order.invoice_lamports);
      if (fees.totalDebitLamports !== BigInt(order.total_debit_lamports)) {
        await markOrder(order.id, {
          status: 'manual_review',
          last_error: 'Fee math mismatch vs stored total',
          attempt_count: attemptNo,
        });
        results.push({ id: order.id, status: 'manual_review', reason: 'fee_mismatch' });
        continue;
      }

      const submit = await submitDisburse({ order, project, provider });
      if (!submit.ok) {
        const max = order.max_auto_attempts || 2;
        const nextStatus = attemptNo >= max ? 'manual_review' : 'retrying';
        await markOrder(order.id, {
          status: nextStatus,
          last_error: submit.error,
          attempt_count: attemptNo,
        });
        await sbFetch(
          `mw_payment_attempts?order_id=eq.${order.id}&attempt_no=eq.${attemptNo}`,
          {
            method: 'PATCH',
            body: JSON.stringify({ status: 'failed', error: submit.error }),
          },
        );
        await audit(
          'keeper_payment_failed',
          { orderId: order.id, attemptNo, error: submit.error, dryRun: !!submit.dryRun },
          project.id,
        );
        results.push({ id: order.id, status: nextStatus, error: submit.error });
        continue;
      }

      await sbFetch('mw_payment_receipts', {
        method: 'POST',
        body: JSON.stringify({
          order_id: order.id,
          invoice_id: order.invoice_id,
          tx_signature: submit.signature,
          supplier_wallet: provider.wallet_address,
          invoice_lamports: order.invoice_lamports,
          service_fee_lamports: order.service_fee_lamports,
          total_debit_lamports: order.total_debit_lamports,
          actor_wallet: submit.actor || null,
        }),
      });

      const fulfilment = await fulfilOrder({
        adapterType: provider.adapter_type,
        order,
        offer,
        project,
      });
      await sbFetch('mw_provider_fulfilments', {
        method: 'POST',
        body: JSON.stringify({
          order_id: order.id,
          adapter_type: provider.adapter_type,
          status: fulfilment.status,
          external_ref: fulfilment.externalRef,
          notes: fulfilment.notes,
        }),
      });

      await markOrder(order.id, { status: 'paid', last_error: null, attempt_count: attemptNo });
      await audit('keeper_payment_paid', { orderId: order.id, signature: submit.signature }, project.id);
      results.push({ id: order.id, status: 'paid', signature: submit.signature });
    }

    // Sweep warnings (30d / 7d) — no funds moved here; on-chain sweep is separate ix.
    try {
      const warnProjects = await sbFetch(
        'mw_projects?marketing_attached=eq.true&spend_paused=eq.false&select=id,mint,ticker,last_marketing_activity_at',
      );
      const now = Date.now();
      for (const p of warnProjects || []) {
        if (!p.last_marketing_activity_at) continue;
        const idleMs = now - new Date(p.last_marketing_activity_at).getTime();
        const idleDays = idleMs / (24 * 60 * 60 * 1000);
        for (const warnDays of [30, 7]) {
          const dueAfter = 180 - warnDays;
          if (idleDays < dueAfter) continue;
          try {
            await sbFetch('mw_sweep_warnings', {
              method: 'POST',
              body: JSON.stringify({ project_id: p.id, warn_days: warnDays }),
            });
            await audit(
              'sweep_warning',
              { mint: p.mint, ticker: p.ticker, warnDays, idleDays: Math.floor(idleDays) },
              p.id,
            );
          } catch {
            /* unique constraint = already warned */
          }
        }
      }
    } catch {
      /* warnings are best-effort */
    }

    return res.status(200).json({ ok: true, processed: results.length, results });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ ok: false, error: err.message || String(err) });
  }
}
