/**
 * tests/app-error.test.mjs
 *
 * Tests for the structured error taxonomy.
 */

import { AppError, ERROR_CODES, errRateLimited, errTimeout, errInvalidInput, wrapError } from '../core/app-error.mjs';

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

console.log('\n🧪 AppError Tests\n');

// ── Basic construction ────────────────────────────────────────────────────────

const err = new AppError('RATE_LIMITED', 'price-feed', 'Too many requests', { retryAfterMs: 5000 });
assert(err.code === 'RATE_LIMITED', 'code is RATE_LIMITED');
assert(err.source === 'price-feed', 'source is price-feed');
assert(err.retryable === true, 'RATE_LIMITED is retryable');
assert(err.severity === 'warn', 'RATE_LIMITED severity is warn');
assert(err.message === 'Too many requests', 'message is correct');
assert(err.context.retryAfterMs === 5000, 'context preserved');
assert(err.ts > 0, 'timestamp set');
assert(err instanceof Error, 'instanceof Error');
assert(err instanceof AppError, 'instanceof AppError');

// ── Error code definitions ────────────────────────────────────────────────────

assert(ERROR_CODES.RATE_LIMITED.code === 'RATE_LIMITED', 'RATE_LIMITED code');
assert(ERROR_CODES.NETWORK_TIMEOUT.retryable === true, 'TIMEOUT is retryable');
assert(ERROR_CODES.TRADE_BLOCKED.retryable === false, 'TRADE_BLOCKED not retryable');
assert(ERROR_CODES.INTERNAL.severity === 'error', 'INTERNAL severity is error');
assert(typeof ERROR_CODES.CIRCUIT_OPEN === 'object', 'CIRCUIT_OPEN defined');

// ── Convenience factories ─────────────────────────────────────────────────────

const rateErr = errRateLimited('birdeye', 3000, 'https://api.birdeye.so');
assert(rateErr.code === 'RATE_LIMITED', 'errRateLimited creates correct code');
assert(rateErr.context.retryAfterMs === 3000, 'errRateLimited has retryAfterMs');

const timeoutErr = errTimeout('pyth', 'https://hermes.pyth.network', 10000);
assert(timeoutErr.code === 'NETWORK_TIMEOUT', 'errTimeout creates correct code');
assert(timeoutErr.context.url === 'https://hermes.pyth.network', 'errTimeout has url');

const invalidErr = errInvalidInput('trade', 'amount', 'must be positive');
assert(invalidErr.code === 'INVALID_INPUT', 'errInvalidInput creates correct code');
assert(invalidErr.context.field === 'amount', 'errInvalidInput has field');

// ── Error wrapping ────────────────────────────────────────────────────────────

const wrapped = wrapError(new Error('429 Too Many Requests'), 'scanner');
assert(wrapped.code === 'RATE_LIMITED', 'wrapError infers 429 as RATE_LIMITED');

const wrapped2 = wrapError(new Error('ECONNREFUSED 127.0.0.1'), 'wallet');
assert(wrapped2.code === 'NETWORK_UNREACHABLE', 'wrapError infers ECONNREFUSED');

const wrapped3 = wrapError(new Error('timeout of 30000ms exceeded'), 'price-feed');
assert(wrapped3.code === 'NETWORK_TIMEOUT', 'wrapError infers timeout');

// ── toJSON ────────────────────────────────────────────────────────────────────

const json = err.toJSON();
assert(json.code === 'RATE_LIMITED', 'toJSON has code');
assert(json.source === 'price-feed', 'toJSON has source');
assert(json.retryable === true, 'toJSON has retryable');
assert(json.ts > 0, 'toJSON has ts');

// ── toString ──────────────────────────────────────────────────────────────────

const str = err.toString();
assert(str.includes('AppError'), 'toString includes AppError name');
assert(str.includes('Too many requests'), 'toString includes message');

// ── Cause chaining ────────────────────────────────────────────────────────────

const original = new Error('fetch failed');
const chained = new AppError('NETWORK_TIMEOUT', 'price-feed', 'Timed out', {}, original);
assert(chained.cause === original, 'cause is preserved');
assert(chained.stack !== undefined, 'stack exists');

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
