#!/usr/bin/env node
/**
 * modules/roast.mjs - Top-level roast command
 * Roasts a file or directory for questionable code choices.
 * 
 * Usage: node modules/roast.mjs <path>
 */

import { join } from 'node:path';

// Forward to the real roast module
const targetPath = process.argv[2];
if (!targetPath) {
  console.log(JSON.stringify({ ok: false, error: 'Usage: node modules/roast.mjs <file-or-directory>' }));
  process.exit(1);
}

// Dynamically import and run
import('./audit/roast.mjs').then(m => m.default || m).then(fn => {
  if (fn) fn(targetPath);
}).catch(err => {
  console.error('Roast failed:', err.message);
  process.exit(1);
});