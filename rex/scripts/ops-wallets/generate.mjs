#!/usr/bin/env node
/**
 * Generate 3 contingency Helio payer keypairs (local only).
 * Does NOT fund them and does NOT Live settle.
 *
 *   cd rex
 *   npm run ops:wallets:generate
 *
 * Writes scripts/ops-wallets/.secrets/ops-wallets.json (gitignored).
 * Prints public keys + Vercel env names to register via /api/mw-ops-wallets.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Keypair } from '@solana/web3.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const secretDir = path.join(__dirname, '.secrets');
const outPath = path.join(secretDir, 'ops-wallets.json');

fs.mkdirSync(secretDir, { recursive: true });

if (fs.existsSync(outPath) && !process.argv.includes('--force')) {
  console.error(`Already exists: ${outPath}`);
  console.error('Pass --force to overwrite (destroys previous local secrets).');
  process.exit(1);
}

const wallets = [1, 2, 3].map((n) => {
  const kp = Keypair.generate();
  return {
    label: `helio-payer-${n}`,
    publicKey: kp.publicKey.toBase58(),
    secretEnvKey: `MW_OPS_WALLET_${n}_SECRET`,
    secretKeyJson: JSON.stringify(Array.from(kp.secretKey)),
    priority: n * 10,
  };
});

const doc = {
  at: new Date().toISOString(),
  note: 'LOCAL SECRETS — never commit. Add secretKeyJson values to Vercel env, then POST register public keys.',
  wallets: wallets.map(({ label, publicKey, secretEnvKey, secretKeyJson, priority }) => ({
    label,
    publicKey,
    secretEnvKey,
    priority,
    secretKeyJson,
  })),
};

fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
fs.chmodSync(outPath, 0o600);

console.log(`
Generated 3 ops payer wallets → ${outPath}

Next (no spend yet):
1. Vercel → ctogo → Environment Variables — add each:
`);
for (const w of wallets) {
  console.log(`   ${w.secretEnvKey} = ${w.secretKeyJson.slice(0, 24)}… (full JSON array from file)`);
}
console.log(`
2. Redeploy ctogo.
3. Register public keys (ops secret required):
`);
for (const w of wallets) {
  console.log(`   POST /api/mw-ops-wallets action=register`);
  console.log(`     label=${w.label} publicKey=${w.publicKey} secretEnvKey=${w.secretEnvKey} priority=${w.priority}`);
}
console.log(`
Fund wallets with Mainnet USDC + SOL for fees ONLY when you are ready for live pay (plan: very end).
`);
