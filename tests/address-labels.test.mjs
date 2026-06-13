/**
 * tests/address-labels.test.mjs
 *
 * Tests for the address label enrichment module.
 */

import { getLabel, addLabel, enrichWhaleAlert, KNOWN_LABELS } from '../core/address-labels.mjs';

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}`);
  }
}

console.log('\n🧪 Address Labels Tests\n');

// ── Known labels ──────────────────────────────────────────────────────────────

const solMint = 'So11111111111111111111111111111111111111112';
const label = await getLabel(solMint, 'solana');
assert(label !== null, 'SOL wrapped mint has label');
assert(label.name === 'SOL (Wrapped)', 'SOL label name correct');
assert(label.type === 'token', 'SOL label type is token');

const jupiter = 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4';
const jupLabel = await getLabel(jupiter, 'solana');
assert(jupLabel !== null, 'Jupiter program has label');
assert(jupLabel.name === 'Jupiter v6 Aggregator', 'Jupiter label name correct');

// ── EVM known labels ──────────────────────────────────────────────────────────

const usdtEth = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const ethLabel = await getLabel(usdtEth, 'ethereum');
assert(ethLabel !== null, 'USDT (ETH) has label');
assert(ethLabel.name === 'USDT (Tether)', 'USDT label name correct');

// ── BNB known labels ──────────────────────────────────────────────────────────

const pancake = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
const bnbLabel = await getLabel(pancake, 'bnb');
assert(bnbLabel !== null, 'PancakeSwap router has label');
assert(bnbLabel.name === 'PancakeSwap Router V2', 'PancakeSwap label name correct');

// ── Unknown address returns null ──────────────────────────────────────────────

const unknown = await getLabel('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', 'solana');
// Could be null or could be fetched from API — just check it doesn't crash
assert(true, 'unknown address lookup does not crash');

// ── Add manual label ──────────────────────────────────────────────────────────

addLabel('0xTEST123', 'ethereum', 'Test Wallet', 'wallet');
const manual = await getLabel('0xTEST123', 'ethereum');
assert(manual !== null, 'manual label retrieved');
assert(manual.name === 'Test Wallet', 'manual label name correct');

// ── Enrich whale alert ────────────────────────────────────────────────────────

const alert = {
  from: solMint,
  to: jupiter,
  amount: 50000,
  mint: 'JUP',
};

const enriched = await enrichWhaleAlert(alert, 'solana');
assert(enriched.fromLabel === 'SOL (Wrapped)', 'fromLabel enriched');
assert(enriched.toLabel === 'Jupiter v6 Aggregator', 'toLabel enriched');
assert(enriched.enriched === true, 'enriched flag is true');

// ── Known labels structure ────────────────────────────────────────────────────

assert(KNOWN_LABELS.solana !== null, 'KNOWN_LABELS has solana');
assert(KNOWN_LABELS.ethereum !== null, 'KNOWN_LABELS has ethereum');
assert(KNOWN_LABELS.bnb !== null, 'KNOWN_LABELS has bnb');
assert(Object.keys(KNOWN_LABELS.solana).length > 5, 'KNOWN_LABELS.solana has 5+ entries');

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
