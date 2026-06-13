/**
 * tests/agent-heartbeat.test.mjs
 *
 * Tests for the agent heartbeat sentinel.
 */

import { HeartbeatSentinel, AGENT_STATUS } from '../core/agent-heartbeat.mjs';

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

console.log('\n🧪 Agent Heartbeat Tests\n');

// ── Basic registration and heartbeat ──────────────────────────────────────────

const sentinel = new HeartbeatSentinel({ intervalMs: 100, maxMissed: 2 });

sentinel.register('scanner', { tags: ['scanner'] });
sentinel.register('predictor', { tags: ['prediction'] });

assert(sentinel.getHealthy().length === 2, 'both agents start healthy');

sentinel.heartbeat('scanner');
const status = sentinel.getStatus('scanner');
assert(status.status === AGENT_STATUS.HEALTHY, 'scanner is HEALTHY after heartbeat');
assert(status.missed === 0, 'scanner has 0 missed heartbeats');

// ── Status tracking ───────────────────────────────────────────────────────────

sentinel.heartbeat('predictor');
const all = sentinel.getAllStatus();
assert(Object.keys(all).length === 2, 'getAllStatus returns both agents');

const summary = sentinel.summary();
assert(summary.total === 2, 'summary total is 2');
assert(summary.healthy === 2, 'summary healthy is 2');
assert(summary.stale === 0, 'summary stale is 0');

// ── Manual status override ────────────────────────────────────────────────────

sentinel.setStatus('scanner', AGENT_STATUS.STALE);
assert(sentinel.getStatus('scanner').status === AGENT_STATUS.STALE, 'manual STALE override works');

sentinel.setStatus('scanner', AGENT_STATUS.HEALTHY);
sentinel.heartbeat('scanner');
assert(sentinel.getStatus('scanner').status === AGENT_STATUS.HEALTHY, 'recovery after STALE');

// ── Auto-register on heartbeat ────────────────────────────────────────────────

sentinel.heartbeat('new-agent');
assert(sentinel.getStatus('new-agent') !== null, 'auto-register on heartbeat');
assert(sentinel.getStatus('new-agent').status === AGENT_STATUS.HEALTHY, 'auto-registered agent is HEALTHY');

// ── Unregister ────────────────────────────────────────────────────────────────

sentinel.unregister('new-agent');
assert(sentinel.getStatus('new-agent') === null, 'unregistered agent is gone');
assert(sentinel.summary().total === 2, 'summary total back to 2');

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
