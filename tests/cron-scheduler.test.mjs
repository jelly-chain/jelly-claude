/**
 * tests/cron-scheduler.test.mjs
 *
 * Tests for the cron scheduler.
 */

import { CronScheduler } from '../core/cron-scheduler.mjs';

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

console.log('\n🧪 Cron Scheduler Tests\n');

// ── Registration ──────────────────────────────────────────────────────────────

const scheduler = new CronScheduler();
let callCount = 0;

scheduler.register('test-job', async () => { callCount++; }, 100);
scheduler.register('another-job', async () => {}, 200);

const status = scheduler.status();
assert(status.jobCount === 2, '2 jobs registered');
assert(status.running === false, 'not running before start');

// ── Start and run ─────────────────────────────────────────────────────────────

scheduler.start();
assert(scheduler.status().running === true, 'running after start');

// Wait for a few ticks
await new Promise(r => setTimeout(r, 350));

assert(callCount >= 3, `test-job called at least 3 times (got ${callCount})`);

const jobStatus = scheduler.status();
assert(jobStatus.jobs['test-job'].runs >= 3, 'test-job runs >= 3');
assert(jobStatus.jobs['test-job'].lastRun > 0, 'test-job has lastRun');

// ── Enable / Disable ──────────────────────────────────────────────────────────

scheduler.disable('test-job');
const before = callCount;
await new Promise(r => setTimeout(r, 250));
assert(callCount === before, 'disabled job does not run');

scheduler.enable('test-job');
await new Promise(r => setTimeout(r, 250));
assert(callCount > before, 're-enabled job runs again');

// ── One-shot ──────────────────────────────────────────────────────────────────

let oneShotRan = false;
scheduler.registerOnce('one-shot', async () => { oneShotRan = true; }, 50);
await new Promise(r => setTimeout(r, 150));
assert(oneShotRan === true, 'one-shot job ran');

// ── Unregister ────────────────────────────────────────────────────────────────

scheduler.unregister('another-job');
assert(scheduler.status().jobCount === 2, 'unregistered job removed'); // test-job + one-shot (still counted)

// ── Stop ──────────────────────────────────────────────────────────────────────

scheduler.stop();
assert(scheduler.status().running === false, 'not running after stop');

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
