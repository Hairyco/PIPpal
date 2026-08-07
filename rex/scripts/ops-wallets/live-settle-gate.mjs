#!/usr/bin/env node
/**
 * Live Helio settle gate — refuses unless FUND_OK=1 and --live.
 * Plan: only after dry-run pass + funded wallet + explicit human OK.
 *
 *   set FUND_OK=1
 *   node scripts/ops-wallets/live-settle-gate.mjs --orderId=UUID
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const orderId = process.argv.find((a) => a.startsWith('--orderId='))?.slice(10);

if (process.env.FUND_OK !== '1') {
  console.error(
    'Refusing live settle: set FUND_OK=1 only after you funded a payer and explicitly want to spend USDC.',
  );
  process.exit(1);
}
if (!orderId) {
  console.error('Need --orderId=');
  process.exit(1);
}

console.log('Running fund-check…');
const check = spawnSync('node', [path.join(__dirname, 'fund-check.mjs')], {
  cwd: path.resolve(__dirname, '../..'),
  encoding: 'utf8',
  shell: true,
  env: process.env,
});
process.stdout.write(check.stdout || '');
process.stderr.write(check.stderr || '');
if (check.status !== 0) {
  console.error('Payer not funded enough — abort live settle.');
  process.exit(1);
}

console.log('Broadcasting live Helio settle…');
const live = spawnSync(
  'node',
  [path.join(__dirname, 'settle.mjs'), `--orderId=${orderId}`, '--live'],
  {
    cwd: path.resolve(__dirname, '../..'),
    encoding: 'utf8',
    shell: true,
    env: process.env,
  },
);
process.stdout.write(live.stdout || '');
process.stderr.write(live.stderr || '');
process.exit(live.status ?? 1);
