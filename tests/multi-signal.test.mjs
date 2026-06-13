/**
 * tests/multi-signal.test.mjs
 *
 * Tests for the multi-signal correlation detector.
 */

import { MultiSignalCorrelator } from '../core/multi-signal-correlator.mjs';

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

console.log('\n🧪 Multi-Signal Correlator Tests\n');

// ── Basic construction ────────────────────────────────────────────────────────

const correlator = new MultiSignalCorrelator({ windowMs: 5000, minSignals: 3 });
const status = correlator.status();
assert(status.started === false, 'not started by default');
assert(status.windowMs === 5000, 'windowMs is 5000');
assert(status.minSignals === 3, 'minSignals is 3');

// ── Manual ingestion ──────────────────────────────────────────────────────────

correlator.start();
assert(correlator.status().started === true, 'started after start()');

// Ingest different signal types for the same token
correlator.ingest('anomaly', { type: 'volume_spike', token: 'JUP', severity: 'medium' });
correlator.ingest('signal', { type: 'keyword', token: 'JUP', severity: 'high' });
correlator.ingest('price_move', { type: 'price_move', token: 'JUP', severity: 'medium', changePct: 5 });

// Should have generated a composite event
const composites = correlator.getComposites();
assert(composites.length === 1, 'one composite event generated');
assert(composites[0].token === 'JUP', 'composite token is JUP');
assert(composites[0].distinctSignals.length >= 3, '3+ distinct signals');
assert(composites[0].severity === 'high', 'severity is high (one signal was high)');

// ── Deduplication ─────────────────────────────────────────────────────────────

// Same token within 5 minutes should not generate another composite
correlator.ingest('anomaly', { type: 'tvl_shock', token: 'JUP', severity: 'medium' });
assert(correlator.getComposites().length === 1, 'deduplicated within 5min window');

// ── Different token ───────────────────────────────────────────────────────────

correlator.ingest('anomaly', { type: 'volume_spike', token: 'SOL', severity: 'critical' });
correlator.ingest('signal', { type: 'keyword', token: 'SOL', severity: 'medium' });
correlator.ingest('whale_activity', { type: 'whale_activity', token: 'SOL', severity: 'high', count: 5 });

assert(correlator.getComposites().length === 2, 'second composite for different token');

// ── Stop ──────────────────────────────────────────────────────────────────────

correlator.stop();
assert(correlator.status().started === false, 'not started after stop');

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
