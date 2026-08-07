#!/usr/bin/env node
/**
 * Bootstrap ops auth + payer wallet env for auto-pay PoC.
 * - Rotates MW_OPS_SECRET (saves to .env.local — gitignored)
 * - Upserts MW_OPS_WALLET_1..3_SECRET from local generated file
 * Does NOT print full secrets.
 *
 *   node scripts/ops-wallets/bootstrap-vercel-env.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rexRoot = path.resolve(__dirname, '../..');
const secretsPath = path.join(__dirname, '.secrets', 'ops-wallets.json');
const envLocal = path.join(rexRoot, '.env.local');
const scope = 'hairyco2-1980s-projects';

function vercel(args) {
  const r = spawnSync('npx', ['vercel', ...args, '--scope', scope, '--yes'], {
    cwd: rexRoot,
    encoding: 'utf8',
    shell: true,
    env: process.env,
  });
  if (r.stdout) process.stdout.write(r.stdout.slice(0, 2000));
  if (r.stderr) process.stderr.write(r.stderr.slice(0, 2000));
  if (r.status !== 0) {
    throw new Error(`vercel ${args[0]} ${args[1]} ${args[2]} failed (${r.status})`);
  }
  return r;
}

function upsertEnv(name, value, { sensitive = true } = {}) {
  const args = [
    'env',
    'add',
    name,
    'production',
    '--force',
    '--value',
    value,
  ];
  if (sensitive) args.push('--sensitive');
  else args.push('--no-sensitive');
  vercel(args);
  // Preview too (ops scripts / previews)
  const argsPrev = [
    'env',
    'add',
    name,
    'preview',
    '--force',
    '--value',
    value,
  ];
  if (sensitive) argsPrev.push('--sensitive');
  else argsPrev.push('--no-sensitive');
  vercel(argsPrev);
}

if (!fs.existsSync(secretsPath)) {
  console.error('Missing', secretsPath, '— run npm run ops:wallets:generate first');
  process.exit(1);
}

const doc = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
const newOpsSecret = `ctogo_ops_${randomBytes(24).toString('hex')}`;

console.log('Updating MW_OPS_SECRET (len=%d)…', newOpsSecret.length);
upsertEnv('MW_OPS_SECRET', newOpsSecret, { sensitive: true });

for (const w of doc.wallets) {
  console.log('Upserting %s for %s…', w.secretEnvKey, w.publicKey);
  upsertEnv(w.secretEnvKey, w.secretKeyJson, { sensitive: true });
}

// Merge into .env.local without dumping other secrets to console
let existing = '';
if (fs.existsSync(envLocal)) existing = fs.readFileSync(envLocal, 'utf8');
const lines = existing
  .split(/\r?\n/)
  .filter(
    (l) =>
      l &&
      !l.startsWith('MW_OPS_SECRET=') &&
      !l.startsWith('MW_OPS_WALLET_1_SECRET=') &&
      !l.startsWith('MW_OPS_WALLET_2_SECRET=') &&
      !l.startsWith('MW_OPS_WALLET_3_SECRET=') &&
      !l.startsWith('CTOGO_API='),
  );
lines.push(`CTOGO_API=https://rex-liart.vercel.app`);
lines.push(`MW_OPS_SECRET=${newOpsSecret}`);
for (const w of doc.wallets) {
  lines.push(`${w.secretEnvKey}=${w.secretKeyJson}`);
}
fs.writeFileSync(envLocal, lines.join('\n') + '\n', { mode: 0o600 });
console.log('Wrote MW_OPS_SECRET + wallet secrets to .env.local (gitignored)');
console.log('Public keys to register after redeploy:');
for (const w of doc.wallets) {
  console.log(`  ${w.label} ${w.publicKey} ${w.secretEnvKey} priority=${w.priority}`);
}
console.log('NEXT: redeploy ctogo so Production picks up env.');
