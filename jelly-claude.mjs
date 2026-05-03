#!/usr/bin/env node
import './core/env.mjs';
import { platformInfo, isWindows } from './core/platform.mjs';
import { sh } from './core/shell.mjs';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const pinfo = platformInfo();
const ROOT  = new URL('.', import.meta.url).pathname.replace(/\/$/, '');

const ENV   = join(ROOT, '.env');
const TORQ  = join(ROOT, 'config', 'torq.json');

function readEnv() {
  try { return readFileSync(ENV, 'utf8'); } catch { return ''; }
}

function hasAnthropicKey(env) { return /^ANTHROPIC_API_KEY=.+/m.test(env); }
function hasOpenRouterKey(env) { return /^OPENROUTER_API_KEY=.+/m.test(env); }

async function main() {
  const env = readEnv();
  const useAnthropicKey  = hasAnthropicKey(env);
  const useOpenRouterKey = hasOpenRouterKey(env);

  console.log('\n  Jelly-Claude v2.0');
  console.log(`  Platform: ${pinfo.os} (${pinfo.arch})`);
  console.log(`  Home:     ${pinfo.home}`);

  let claudeEnv = { ...process.env };

  if (useOpenRouterKey && !useAnthropicKey) {
    const torqCfg = existsSync(TORQ) ? JSON.parse(readFileSync(TORQ, 'utf8')) : {};
    const models  = torqCfg.openrouter ?? {};
    Object.assign(claudeEnv, {
      ANTHROPIC_BASE_URL:              `http://127.0.0.1:${torqCfg.proxyPort ?? 7788}`,
      ANTHROPIC_API_KEY:               process.env.OPENROUTER_API_KEY,
      ANTHROPIC_DEFAULT_OPUS_MODEL:    models.opus   ?? 'google/gemma-4-31b-it:free',
      ANTHROPIC_DEFAULT_SONNET_MODEL:  models.sonnet ?? 'arcee-ai/trinity-large-preview:free',
      ANTHROPIC_DEFAULT_HAIKU_MODEL:   models.haiku  ?? 'nvidia/nemotron-3-super-120b-a12b',
      CLAUDE_CODE_SUBAGENT_MODEL:      models.subagent ?? 'nvidia/nemotron-3-super-120b-a12b:free',
    });
    console.log('  Mode:     OpenRouter (proxy)');
    sh(`node ${JSON.stringify(join(ROOT, 'proxy.mjs'))}`, { shell: pinfo.shell }).catch(() => {});
    await new Promise(r => setTimeout(r, 800));
  } else if (useAnthropicKey) {
    console.log('  Mode:     Anthropic (direct)');
  } else {
    console.log('  Mode:     No API key — Claude will prompt for login');
  }

  console.log('');

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
