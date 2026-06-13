/**
 * tests/prediction-journal.test.mjs
 *
 * Tests for the prediction journal.
 */

import { recordPrediction, readPredictions, computeAccuracy, getUnresolved } from '../core/prediction-journal.mjs';

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

console.log('\n🧪 Prediction Journal Tests\n');

// ── Record a prediction ───────────────────────────────────────────────────────

const pred = recordPrediction({
  market: 'polymarket:0xtest123',
  question: 'Will BTC reach $100K by end of 2025?',
  platform: 'polymarket',
  signal: 'bullish',
  jellyScore: 75,
  confidence: 0.82,
  riskScore: 0.35,
  edgeScore: 65,
  marketPrice: 0.45,
  agent: 'predictor',
});

assert(pred.id.startsWith('pred_'), 'prediction has id');
assert(pred.market === 'polymarket:0xtest123', 'market is preserved');
assert(pred.jellyScore === 75, 'jellyScore is preserved');
assert(pred.outcome === null, 'outcome starts as null');
assert(pred.correct === null, 'correct starts as null');
assert(pred.ts > 0, 'timestamp set');
assert(pred.datetime.length > 0, 'datetime set');

// ── Read predictions ──────────────────────────────────────────────────────────

const preds = readPredictions(new Date().getFullYear(), new Date().getMonth() + 1);
assert(preds.length > 0, 'readPredictions returns results');
assert(preds[0].id !== undefined, 'predictions have id field');

// ── Get unresolved ────────────────────────────────────────────────────────────

const unresolved = getUnresolved();
assert(unresolved.length > 0, 'getUnresolved returns unresolved predictions');
assert(unresolved[0].outcome === null, 'unresolved predictions have null outcome');

// ── Compute accuracy ──────────────────────────────────────────────────────────

const accuracy = computeAccuracy();
assert(typeof accuracy.total === 'number', 'accuracy has total');
assert(typeof accuracy.resolved === 'number', 'accuracy has resolved');
assert(typeof accuracy.winRate === 'number', 'accuracy has winRate');
assert(accuracy.winRate >= 0 && accuracy.winRate <= 1, 'winRate is between 0 and 1');
assert(typeof accuracy.recommendedMinJellyScore === 'number', 'accuracy has recommendedMinJellyScore');

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
