import '../../core/env.mjs';
import { showSplash } from '../../core/splash.mjs';
import { dispatch } from '../../core/run.mjs';

process.on('unhandledRejection', (reason) => {
  process.stderr.write(`[prediction-markets] Unhandled rejection: ${reason?.message ?? reason}\n`);
  process.stdout.write(JSON.stringify({ ok: false, error: String(reason?.message ?? reason), module: 'prediction-markets' }) + '\n');
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  process.stderr.write(`[prediction-markets] Uncaught exception: ${err.message}\n`);
  process.stdout.write(JSON.stringify({ ok: false, error: err.message, module: 'prediction-markets' }) + '\n');
  process.exit(1);
});

await showSplash();

let tools;
try {
  tools = await import('./tools/index.mjs');
} catch (err) {
  process.stderr.write(`[prediction-markets] Failed to load tools: ${err.message}\n`);
  process.stdout.write(JSON.stringify({ ok: false, error: err.message, module: 'prediction-markets' }) + '\n');
  process.exit(1);
}

dispatch(tools, 'prediction-markets');
