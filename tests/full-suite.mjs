#!/usr/bin/env node
/**
 * tests/full-suite.mjs
 *
 * Comprehensive test suite for the entire Jelly-Claude ecosystem.
 * Runs all core tests and module smoke tests.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

async function runCoreTests() {
  const tests = [
    'tests/app-error.test.mjs',
    'tests/prediction-journal.test.mjs',
    'tests/agent-heartbeat.test.mjs',
    'tests/cron-scheduler.test.mjs',
    'tests/nonce-manager.test.mjs',
    'tests/multi-signal.test.mjs',
    'tests/address-labels.test.mjs',
  ];

  let total = 0;
  let passed = 0;

  for (const test of tests) {
    if (!existsSync(test)) continue;
    console.log(`\n🧪 Running ${test.split('/').pop()}...\n`);
    try {
      const mod = await import(`./${test.split('/').pop()}`);
      // Tests are self-executing
    } catch (e) {
      console.log(`  ❌ ${test} failed: ${e.message}`);
    }
  }

  return { passed, total };
}

async function runModuleSmokeTests() {
  const modules = [
    'modules/market/run.mjs',
    'modules/scanner/run.mjs',
    'modules/portfolio/run.mjs',
    'modules/prediction-markets/run.mjs',
    'modules/defi/run.mjs',
    'modules/bridge/run.mjs',
    'modules/wallet/run.mjs',
  ];

  for (const mod of modules) {
    if (!existsSync(mod)) continue;
    try {
      console.log(`\n🔍 Smoke test: ${mod}...\n`);
      // Import and check exports
      await import(`../${mod}`);
      console.log(`  ✅ ${mod} loads successfully`);
    } catch (e) {
      console.log(`  ❌ ${mod} failed: ${e.message}`);
    }
  }
}

async function main() {
  console.log('\n🪼 Jelly-Claude Full Test Suite\n');
  console.log('═'.repeat(50));

  await runCoreTests();
  await runModuleSmokeTests();

  console.log('\n' + '═'.repeat(50));
  console.log('Test suite complete.\n');
}

main().catch(console.error);