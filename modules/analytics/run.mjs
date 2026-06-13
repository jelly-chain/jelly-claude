import '../../core/env.mjs';
import { showSplash } from '../../core/splash.mjs';
import { dispatch } from '../../core/run.mjs';

process.on('unhandledRejection', (reason) => {
  process.stderr.write(`[analytics] Unhandled rejection: ${reason?.message ?? reason}\n`);
  process.stdout.write(JSON.stringify({ ok: false, error: String(reason?.message ?? reason), module: 'analytics' }) + '\n');
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  process.stderr.write(`[analytics] Uncaught exception: ${err.message}\n`);
  process.stdout.write(JSON.stringify({ ok: false, error: err.message, module: 'analytics' }) + '\n');
  process.exit(1);
});

await showSplash();

let tools;
try {
  tools = await import('./tools/index.mjs');
} catch (err) {
  process.stderr.write(`[analytics] Failed to load tools: ${err.message}\n`);
  process.stdout.write(JSON.stringify({ ok: false, error: err.message, module: 'analytics' }) + '\n');
  process.exit(1);
}

dispatch(tools, 'analytics');
