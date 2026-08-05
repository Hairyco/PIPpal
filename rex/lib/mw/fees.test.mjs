/**
 * Tiny Node check for 20%-on-top fee math (no network).
 * Run: node rex/lib/mw/fees.test.mjs
 */
import { invoiceWithServiceFee, usdWithServiceFee } from './fees.js';
import assert from 'assert';

const a = invoiceWithServiceFee(100_000_000n);
assert.equal(a.serviceFeeLamports, 20_000_000n);
assert.equal(a.totalDebitLamports, 120_000_000n);

const b = usdWithServiceFee(100);
assert.equal(b.serviceFeeUsd, 20);
assert.equal(b.totalDebitUsd, 120);

console.log('mw fees ok');
