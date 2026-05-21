#!/usr/bin/env node
/**
 * core/ink-ui/main.mjs — Jelly Octopus Ink splash screen.
 *
 * Reads display options from environment variables:
 *   JELLY_SPLASH_MODE    'anthropic' | 'openrouter' | 'none'
 *   JELLY_SPLASH_PORT    proxy port number (default 7788)
 *   JELLY_SPLASH_OPUS    opus model label
 *   JELLY_SPLASH_SONNET  sonnet model label
 *   JELLY_SPLASH_HAIKU   haiku model label
 *
 * Run directly: node core/ink-ui/main.mjs
 * Called via:   core/splash.mjs showSplash() → child_process.spawn
 */

// TTY guard — must be at the top so any invocation path is safe
if (!process.stdout.isTTY || process.env.JELLY_NO_SPLASH === '1') {
  process.exit(0);
}

import { Canvas } from './canvas.mjs';
import { OctopusInk } from './animation.mjs';

const opts = {
  mode:   process.env.JELLY_SPLASH_MODE ?? 'none',
  port:   Number(process.env.JELLY_SPLASH_PORT ?? 7788),
  models: {
    opus:   process.env.JELLY_SPLASH_OPUS   || undefined,
    sonnet: process.env.JELLY_SPLASH_SONNET || undefined,
    haiku:  process.env.JELLY_SPLASH_HAIKU  || undefined,
  },
};

// Get terminal dimensions
const width = process.stdout.columns || 80;
const height = process.stdout.rows || 24;
const canvas = new Canvas(width, height);
const ink = new OctopusInk(canvas, opts);

// Start animation
ink.start();

// Keep process alive until interrupted
process.on('SIGINT', () => {
  ink.stop();
  process.exit(0);
});

['SIGTERM', 'SIGHUP'].forEach(signal => {
  process.on(signal, () => {
    ink.stop();
    process.exit(0);
  });
});