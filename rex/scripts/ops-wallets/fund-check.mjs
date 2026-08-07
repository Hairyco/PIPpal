#!/usr/bin/env node
/**
 * Check Mainnet SOL + USDC balances for ops payer wallets (no transfers).
 *   node scripts/ops-wallets/fund-check.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rexRoot = path.resolve(__dirname, '../..');
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

function loadEnvFile(p) {
  if (!fs.existsSync(p)) return {};
  const out = {};
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    let v = line.slice(i + 1);
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[line.slice(0, i)] = v;
  }
  return out;
}

const env = { ...loadEnvFile(path.join(rexRoot, '.env.local')), ...process.env };
const doc = JSON.parse(
  fs.readFileSync(path.join(__dirname, '.secrets', 'ops-wallets.json'), 'utf8'),
);

const rpc =
  env.SOLANA_RPC_URL && env.SOLANA_RPC_URL !== '[Encrypted]'
    ? env.SOLANA_RPC_URL
    : 'https://api.mainnet-beta.solana.com';

const connection = new Connection(rpc, 'confirmed');
const TOKEN_PROGRAM = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

async function usdcBalance(owner) {
  const resp = await connection.getParsedTokenAccountsByOwner(owner, {
    mint: new PublicKey(USDC_MINT),
  });
  let total = 0;
  for (const { account } of resp.value) {
    total += Number(account.data.parsed.info.tokenAmount.uiAmount || 0);
  }
  return total;
}

console.log({ rpcHost: (() => { try { return new URL(rpc).host; } catch { return 'rpc'; } })() });
const invoiceNeed = Number(process.env.FUND_USDC_NEED || 350);
const results = [];
for (const w of doc.wallets) {
  const pk = new PublicKey(w.publicKey);
  const lamports = await connection.getBalance(pk);
  const sol = lamports / LAMPORTS_PER_SOL;
  const usdc = await usdcBalance(pk);
  results.push({
    label: w.label,
    publicKey: w.publicKey,
    sol: Number(sol.toFixed(6)),
    usdc: Number(usdc.toFixed(2)),
    fundedEnough:
      usdc >= invoiceNeed && sol >= 0.01
        ? true
        : false,
  });
}

const anyReady = results.some((r) => r.fundedEnough);
console.log(JSON.stringify({ invoiceNeedUsdc: invoiceNeed, anyReady, wallets: results }, null, 2));
if (!anyReady) {
  console.log(`
Fund ONE active payer before live Helio settle:
  Prefer: ${results[0]?.publicKey} (${results[0]?.label})
  Send: ≥ $${invoiceNeed} USDC (mint ${USDC_MINT}) + ~0.05 SOL for fees
  Then: node scripts/ops-wallets/settle.mjs --orderId=… --live
`);
  process.exitCode = 2;
}
