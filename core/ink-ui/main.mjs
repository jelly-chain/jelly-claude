#!/usr/bin/env node
/**
 * core/ink-ui/main.mjs — standalone Ink splash entry point.
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

import React from 'react';
import { render } from 'ink';
import { SplashApp } from './app.mjs';

const opts = {
  mode:   process.env.JELLY_SPLASH_MODE ?? 'none',
  port:   Number(process.env.JELLY_SPLASH_PORT ?? 7788),
  models: {
    opus:   process.env.JELLY_SPLASH_OPUS   || undefined,
    sonnet: process.env.JELLY_SPLASH_SONNET || undefined,
    haiku:  process.env.JELLY_SPLASH_HAIKU  || undefined,
  },
};

const { waitUntilExit } = render(React.createElement(SplashApp, opts));
await waitUntilExit();
