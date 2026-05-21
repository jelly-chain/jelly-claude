import '../../core/env.mjs';
import { showSplash } from '../../core/splash.mjs';
import { dispatch } from '../../core/run.mjs';

// Error handling
process.on('unhandledRejection', (reason) => {
  const moduleName = '[MODULE_NAME]';
  process.stderr.write(`${moduleName} Unhandled rejection: ${reason?.message ?? reason}\n`);
  process.stdout.write(JSON.stringify({
    ok: false,
    error: String(reason?.message ?? reason),
    module: '[MODULE_NAME]'
  }) + '\n');
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  const moduleName = '[MODULE_NAME]';
  process.stderr.write(`${moduleName} Uncaught exception: ${err.message}\n`);
  process.stdout.write(JSON.stringify({
    ok: false,
    error: err.message,
    module: '[MODULE_NAME]'
  }) + '\n');
  process.exit(1);
});

await showSplash();

let tools;
try {
  tools = await import('./tools/index.mjs');
} catch (err) {
  process.stderr.write(`[MODULE_NAME] Failed to load tools: ${err.message}\n`);
  process.stdout.write(JSON.stringify({
    ok: false,
    error: err.message,
    module: '[MODULE_NAME]'
  }) + '\n');
  process.exit(1);
}

// Optional: Initialize module-specific resources
// const resource = await initResource();

try {
  dispatch(tools, '[MODULE_NAME]');
} catch (err) {
  process.stderr.write(`[MODULE_NAME] Dispatch error: ${err.message}\n`);
  process.exit(1);
}
