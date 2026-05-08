import { ensurePortFree } from '../core/proxy-guard.mjs';

const PORT = parseInt(process.env.JELLY_PROXY_PORT ?? '7788', 10);

const result = await ensurePortFree(PORT);

if (!result.ok) {
  process.stderr.write(`  ERROR: ${result.message}\n`);
  process.stderr.write(`  Stop the process on port ${PORT} and retry, or set JELLY_PROXY_PORT to a different port.\n`);
  process.exit(1);
}

if (result.action === 'killed') {
  process.stdout.write(`  Cleared stale proxy on port ${PORT}.\n`);
} else {
  process.stdout.write(`  Port ${PORT} is free.\n`);
}

process.exit(0);
