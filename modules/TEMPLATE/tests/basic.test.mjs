/**
 * Basic tests for [MODULE_NAME] module
 *
 * Run with: node --test modules/[module-name]/tests/basic.test.mjs
 */

import { toolOne, toolTwo } from '../tools/index.mjs';

// Mock core modules if needed
// import { setupTestMocks } from '../../core/test-utils.mjs';

async function runTests() {
  console.log('[MODULE_NAME] Basic Tests\n');

  // Test 1: toolOne with valid input
  console.log('Test 1: toolOne with valid input');
  try {
    const result = await toolOne({ requiredParam: 'test' });
    console.assert(result.ok === true, 'toolOne should succeed with valid input');
    console.log('✓ Passed\n');
  } catch (err) {
    console.log(`✗ Failed: ${err.message}\n`);
  }

  // Test 2: toolOne with missing required param
  console.log('Test 2: toolOne with missing required param');
  try {
    const result = await toolOne({});
    console.assert(result.ok === false, 'toolOne should fail without required param');
    console.assert(result.error !== undefined, 'Should return error message');
    console.log('✓ Passed\n');
  } catch (err) {
    console.log(`✗ Failed: ${err.message}\n`);
  }

  // Test 3: toolTwo
  console.log('Test 3: toolTwo');
  try {
    const result = await toolTwo();
    console.assert(result.ok === true, 'toolTwo should succeed');
    console.log('✓ Passed\n');
  } catch (err) {
    console.log(`✗ Failed: ${err.message}\n`);
  }

  console.log('Tests complete.');
}

runTests().catch(console.error);
