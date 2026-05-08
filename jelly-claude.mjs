#!/usr/bin/env node
import './core/env.mjs';
import { showSplash } from './core/splash.mjs';
import { platformInfo, isWindows } from './core/platform.mjs';
import { sh } from './core/shell.mjs';
import { ensurePortFree, waitForPort } from './core/proxy-guard.mjs';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const pinfo = platformInfo();
const ROOT  = new URL('.', import.meta.url).pathname.replace(/\/$/, '');

const ENV   = join(ROOT, '.env');
const TORQ  = join(ROOT, 'config', 'torq.json');

function readEnv() {
  try { return readFileSync(ENV, 'utf8'); } catch { return ''; }
}

function hasAnthropicKey(env)  { return /^ANTHROPIC_API_KEY=.+/m.test(env); }
function hasOpenRouterKey(env) { return /^OPENROUTER_API_KEY=.+/m.test(env); }

/** True when --telegram is present in argv. */
const isTelegram = process.argv.includes('--telegram');

async function main() {
  const env = readEnv();
  const useAnthropicKey  = hasAnthropicKey(env);
  const useOpenRouterKey = hasOpenRouterKey(env);

  let claudeEnv  = { ...process.env };
  let bridgeOpts = {};

  if (useOpenRouterKey && !useAnthropicKey) {
    const torqCfg   = existsSync(TORQ) ? JSON.parse(readFileSync(TORQ, 'utf8')) : {};
    const models    = torqCfg.openrouter ?? {};
    const proxyPort = torqCfg.proxyPort ?? 7788;

    await showSplash({
      mode: 'openrouter',
      models: {
        opus:    models.opus    ?? 'deepseek/deepseek-v4-pro',
        sonnet:  models.sonnet  ?? 'x-ai/grok-4.3',
        haiku:   models.haiku   ?? 'nvidia/nemotron-3-nano-30b-a3b:exacto',
      },
      port: proxyPort,
    });

    console.log('  Mode:     OpenRouter (proxy)');

    const guard = await ensurePortFree(proxyPort);
    if (!guard.ok) {
      console.error(`\n  ✗ ${guard.message}`);
      console.error('  Stop the existing process on port ' + proxyPort + ' and retry.');
      process.exit(1);
    }
    if (guard.action === 'killed') {
      console.log(`  ↺ Cleared stale proxy on port ${proxyPort}`);
    }

    sh(`node ${JSON.stringify(join(ROOT, 'proxy.mjs'))}`, { shell: pinfo.shell, timeoutMs: 0 }).catch(() => {});

    const ready = await waitForPort(proxyPort, { timeoutMs: 10_000 });
    if (!ready.ok) {
      console.error('\n  ✗ Proxy did not start within 10 seconds — aborting.');
      process.exit(1);
    }

    const resolvedModels = {
      opus:    models.opus    ?? 'deepseek/deepseek-v4-pro',
      sonnet:  models.sonnet  ?? 'x-ai/grok-4.3',
      haiku:   models.haiku   ?? 'nvidia/nemotron-3-nano-30b-a3b:exacto',
    };

    Object.assign(claudeEnv, {
      ANTHROPIC_BASE_URL:              `http://127.0.0.1:${proxyPort}`,
      ANTHROPIC_API_KEY:               process.env.OPENROUTER_API_KEY,
      ANTHROPIC_DEFAULT_OPUS_MODEL:    resolvedModels.opus,
      ANTHROPIC_DEFAULT_SONNET_MODEL:  resolvedModels.sonnet,
      ANTHROPIC_DEFAULT_HAIKU_MODEL:   resolvedModels.haiku,
      CLAUDE_CODE_SUBAGENT_MODEL:      models.subagent ?? 'qwen/qwen3-next-80b-a3b-thinking',
    });

    bridgeOpts = { mode: 'openrouter', models: resolvedModels };

  } else if (useAnthropicKey) {
    await showSplash({ mode: 'anthropic' });
    console.log('  Mode:     Anthropic (direct)');
    bridgeOpts = { mode: 'anthropic' };
  } else {
    await showSplash({ mode: 'none' });
    console.log('  Mode:     No API key — Claude will prompt for login');
    bridgeOpts = { mode: 'none' };
  }

  console.log(`\n  Jelly-Claude v2.0`);
  console.log(`  Platform: ${pinfo.os} (${pinfo.arch})`);
  console.log(`  Home:     ${pinfo.home}`);
  console.log('');

  // ── Telegram bridge mode ──────────────────────────────────────────────────
  if (isTelegram) {
    const tgToken  = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const tgChatId = process.env.TELEGRAM_CHAT_ID?.trim();

    if (!tgToken || !tgChatId) {
      console.error('  ✗ --telegram requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env');
      console.error('  Create a bot via @BotFather and find your chat ID via @userinfobot.');
      process.exit(1);
    }

    console.log('  ✅ Telegram bridge active — waiting for messages from your bot');
    console.log(`  Chat ID: ${tgChatId}`);
    console.log('  Commands: /status  /stop\n');

    // Strip --telegram from the args forwarded to claude
    const claudeArgs = process.argv.slice(2).filter(a => a !== '--telegram');

    const claudeProc = spawn('claude', claudeArgs, {
      env:   claudeEnv,
      stdio: ['pipe', 'pipe', 'inherit'],
    });

    claudeProc.on('error', (err) => {
      console.error('\n  Failed to launch Claude Code:', err.message);
      process.exit(1);
    });

    const { startTelegramBridge } = await import('./core/tg-bridge.mjs');
    await startTelegramBridge(claudeProc, bridgeOpts);

    await new Promise((resolve) => claudeProc.on('exit', resolve));
    return;
  }

  // ── Normal (non-Telegram) mode ────────────────────────────────────────────
  const spawnEnv = Object.entries(claudeEnv)
    .map(([k, v]) => (isWindows ? `set ${k}=${v}&&` : `${k}=${JSON.stringify(v)}`))
    .join(isWindows ? '' : ' ');

  const cmd = isWindows
    ? `${spawnEnv} claude`
    : `env ${spawnEnv} claude`;

  const result = await sh(cmd, { timeoutMs: 0 }).catch(e => ({ ok: false, stderr: e.message }));
  if (!result.ok) {
    console.error('\n  Failed to launch Claude Code:', result.stderr);
    process.exit(1);
  }
}

main();
