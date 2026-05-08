/**
 * core/splash.mjs
 *
 * Renders the Jelly-Claude Ink terminal splash screen by forking a short-lived
 * subprocess so Ink's terminal manipulation is isolated from the main runtime.
 *
 * Skips entirely when:
 *   - stdout is not a TTY (CI/pipe)
 *   - JELLY_NO_SPLASH=1 env var is set (power-user / script opt-out)
 *
 * Fails silently if Node or the Ink dependencies are unavailable.
 *
 * @param {object} [opts]
 * @param {string} [opts.mode]    'anthropic' | 'openrouter' | 'none' — auto-detected if omitted
 * @param {object} [opts.models]  { opus, sonnet, haiku } — read from env vars if omitted
 * @param {number} [opts.port]    proxy port (default 7788)
 * @returns {Promise<void>}
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MAIN_MJS  = join(__dirname, 'ink-ui', 'main.mjs');

/** Infer mode from environment when no explicit opts are provided. */
function detectMode() {
  const hasAnthropic  = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);
  if (hasAnthropic && !hasOpenRouter) return 'anthropic';
  if (hasOpenRouter && !hasAnthropic) return 'openrouter';
  if (hasAnthropic)                   return 'anthropic';
  return 'none';
}

export function showSplash(opts = {}) {
  if (!process.stdout.isTTY) return Promise.resolve();
  if (process.env.JELLY_NO_SPLASH === '1') return Promise.resolve();

  const mode = opts.mode ?? detectMode();

  return new Promise((resolve) => {
    const env = {
      ...process.env,
      JELLY_SPLASH_MODE:   mode,
      JELLY_SPLASH_PORT:   String(opts.port ?? 7788),
      JELLY_SPLASH_OPUS:   opts.models?.opus   ?? process.env.ANTHROPIC_DEFAULT_OPUS_MODEL   ?? '',
      JELLY_SPLASH_SONNET: opts.models?.sonnet ?? process.env.ANTHROPIC_DEFAULT_SONNET_MODEL ?? '',
      JELLY_SPLASH_HAIKU:  opts.models?.haiku  ?? process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL  ?? '',
    };

    const child = spawn(process.execPath, [MAIN_MJS], {
      env,
      stdio: 'inherit',
    });

    child.on('close', resolve);
    child.on('error', resolve);  // fail silently — splash is non-critical
  });
}
