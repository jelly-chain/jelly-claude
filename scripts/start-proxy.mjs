#!/usr/bin/env node
// Start the OpenRouter proxy with preflight port check, then exit (proxy runs as orphan)
import { ensurePortFree, waitForPort } from '../core/proxy-guard.mjs';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const PORT = parseInt(process.env.JELLY_PROXY_PORT ?? '7789', 10);
const PROXY_FILE = join(ROOT, 'proxy.mjs');

if (!existsSync(PROXY_FILE)) {
  process.stderr.write(`  ERROR: proxy.mjs not found at ${PROXY_FILE}\n`);
  process.exit(1);
}

// Preflight: ensure port is free
const preflight = await ensurePortFree(PORT);
if (!preflight.ok) {
  process.stderr.write(`  ERROR: ${preflight.message}\n`);
  process.exit(1);
}
if (preflight.action === 'killed') {
  process.stdout.write(`  Cleared stale proxy on port ${PORT}.\n`);
}

// Spawn proxy detached so it survives the launcher
const proxy = spawn(process.execPath, [PROXY_FILE], {
  cwd: ROOT,
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, PROXY_PORT: String(PORT) },
  detached: true,
});

proxy.stdout.on('data', (d) => process.stdout.write(d));
proxy.stderr.on('data', (d) => process.stderr.write(d));

proxy.on('error', (err) => {
  process.stderr.write(`  ERROR: Proxy failed to start: ${err.message}\n`);
  process.exit(1);
});

// Wait for port to be ready, then unref and exit
const ready = await waitForPort(PORT, { timeoutMs: 10_000 });
if (!ready.ok) {
  process.stderr.write(`  ERROR: Proxy did not start on port ${PORT} within 10 seconds.\n`);
  proxy.kill();
  process.exit(1);
}

process.stdout.write(`  Proxy ready on port ${PORT}.\n`);
proxy.unref();
process.exit(0);
