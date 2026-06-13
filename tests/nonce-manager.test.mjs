/**
 * tests/nonce-manager.test.mjs
 *
 * Tests for the EVM nonce manager.
 */

import { NonceManager } from '../core/nonce-manager.mjs';

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

console.log('\n🧪 Nonce Manager Tests\n');

// ── Basic nonce management ────────────────────────────────────────────────────

const nm = new NonceManager();

// Mock the _fetchNonce method to return a fixed nonce
nm._fetchNonce = async () => ({
  lastConfirmed: 100,
  pending: new Set(),
  lastFetched: Date.now(),
  lastUsed: Date.now(),
});

const nonce1 = await nm.getNextNonce('ethereum', '0xABC');
assert(nonce1 === 101, 'first nonce is 101');

const nonce2 = await nm.getNextNonce('ethereum', '0xABC');
assert(nonce2 === 102, 'second nonce is 102');

const nonce3 = await nm.getNextNonce('ethereum', '0xABC');
assert(nonce3 === 103, 'third nonce is 103');

// ── Confirm nonce ─────────────────────────────────────────────────────────────

nm.confirmNonce('ethereum', '0xABC', 101);
const state = nm.getState('ethereum', '0xABC');
assert(state.lastConfirmed === 101, 'lastConfirmed updated after confirm');
assert(state.pending.includes(102), 'nonce 102 still pending');
assert(state.pending.includes(103), 'nonce 103 still pending');
assert(!state.pending.includes(101), 'nonce 101 no longer pending');

// ── Release nonce ─────────────────────────────────────────────────────────────

nm.releaseNonce('ethereum', '0xABC', 103);
const state2 = nm.getState('ethereum', '0xABC');
assert(!state2.pending.includes(103), 'nonce 103 released');

// ── Handle nonce too low ──────────────────────────────────────────────────────

nm.handleNonceTooLow('ethereum', '0xABC', 105);
const state3 = nm.getState('ethereum', '0xABC');
assert(state3.lastConfirmed === 105, 'lastConfirmed bumped after nonce too low');

// ── Different chains are independent ──────────────────────────────────────────

nm._fetchNonce = async () => ({
  lastConfirmed: 50,
  pending: new Set(),
  lastFetched: Date.now(),
  lastUsed: Date.now(),
});

const bnbNonce = await nm.getNextNonce('bnb', '0xABC');
assert(bnbNonce === 51, 'BNB nonce independent (51)');

// ── Reset ─────────────────────────────────────────────────────────────────────

nm.reset('ethereum', '0xABC');
assert(nm.getState('ethereum', '0xABC') === null, 'state cleared after reset');

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
