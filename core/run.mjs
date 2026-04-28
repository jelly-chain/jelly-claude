// core/run.mjs — Standard dispatcher for all modules
// Usage from modules/<domain>/run.mjs:
//   import { dispatch } from "../../core/run.mjs";
//   import * as tools from "./tools/index.mjs";
//   dispatch(tools);
//
// Invocation:
//   node modules/<domain>/run.mjs <tool-name> [--arg value --flag ...]
// Output: JSON to stdout. Errors: { ok:false, error }. Exit 1 on error.

import './env.mjs'; // auto-load .env
import { voiceCommand, speak } from './voice.mjs';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const MODE_FILE = join(process.cwd(), 'logs', 'mode-state.json');
const BUDDY_MODES = new Set(['user', 'edit', 'plan']);

function loadMode() {
  try {
    if (existsSync(MODE_FILE)) {
      const data = JSON.parse(readFileSync(MODE_FILE, 'utf8'));
      if (data && BUDDY_MODES.has(data.mode)) return data.mode;
    }
  } catch {}
  return null;
}

function saveMode(mode) {
  try {
    const dir = dirname(MODE_FILE);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(MODE_FILE, JSON.stringify({ mode }, null, 2));
  } catch {}
}

let _buddyMode = loadMode() || String(process.env.BUDDY_MODE || 'user').toLowerCase();
if (!BUDDY_MODES.has(_buddyMode)) _buddyMode = 'user';

function parseArgs(argv) {
  const [, , toolName, ...rest] = argv;
  const args = {};
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = rest[i + 1];
      if (next === undefined || next.startsWith('--')) {
        args[key] = true;
      } else {
        // cast numerics & bools
        if (/^-?\d+$/.test(next)) args[key] = parseInt(next, 10);
        else if (/^-?\d*\.\d+$/.test(next)) args[key] = parseFloat(next);
        else if (next === 'true') args[key] = true;
        else if (next === 'false') args[key] = false;
        else args[key] = next;
        i++;
      }
    }
  }
  return { toolName, args };
}

function out(obj) {
  try { process.stdout.write(JSON.stringify(obj) + '\n'); }
  catch { process.stdout.write(String(obj) + '\n'); }
}

export async function dispatch(tools, moduleName = '') {
  const { toolName, args } = parseArgs(process.argv);

  // Help / listing
  if (!toolName || toolName === '--help' || toolName === '-h' || toolName === 'help') {
    const names = Object.keys(tools).filter(k => typeof tools[k] === 'function' && k !== 'default');
    out({ ok: true, module: moduleName, tools: names, usage: `node <module>/run.mjs <tool> [--arg value]` });
    return;
  }

  // Global /voice command path available from any module dispatcher:
  // node modules/<any>/run.mjs "/voice set alloy"
  // node modules/<any>/run.mjs "/voice say hello"
  if (toolName && toolName.startsWith('/voice')) {
    const raw = [toolName, ...process.argv.slice(3)].join(' ').trim();
    const result = await voiceCommand(raw);
    out(result);
    if (!result?.ok) process.exit(1);
    return;
  }

  // Global /mode command
  // node modules/<any>/run.mjs "/mode current"
  // node modules/<any>/run.mjs "/mode edit"
  if (toolName && toolName.startsWith('/mode')) {
    const raw = [toolName, ...process.argv.slice(3)].join(' ').trim();
    if (raw === '/mode' || raw === '/mode current') {
      out({ ok: true, mode: _buddyMode, modes: Array.from(BUDDY_MODES) });
      return;
    }
    const m = raw.match(/^\/mode\s+(user|edit|plan)$/i);
    if (!m) {
      out({ ok: false, error: 'Unknown /mode command', usage: ['/mode current', '/mode user', '/mode edit', '/mode plan'] });
      process.exit(1);
    }
    _buddyMode = m[1].toLowerCase();
    saveMode(_buddyMode);
    out({ ok: true, mode: _buddyMode, modes: Array.from(BUDDY_MODES) });
    return;
  }

  const fn = tools[toolName] || (tools.default && tools.default[toolName]);
  if (typeof fn !== 'function') {
    const names = Object.keys(tools).filter(k => typeof tools[k] === 'function' && k !== 'default');
    out({ ok: false, error: `Tool '${toolName}' not found`, available: names });
    process.exit(1);
  }

  try {
    const result = await fn(args);
    if (result && typeof result === 'object') {
      const payload = result.ok === false ? result : { ok: true, ...result };
      emitAndSpeak(payload);
      if (payload.ok !== false) {
        const auto = await voiceCommand('/voice auto status');
        if (auto?.ok && auto?.autoSpeak === true) {
          let spokenText = payload?.message || payload?.text || payload?.summary || payload?.result || '';
          if (!spokenText || typeof spokenText !== 'string') {
            // Auto-summary: speak a short tool + ok signal
            spokenText = `${moduleName || 'tool'} ${toolName} complete`;
          }
          if (spokenText) {
            await speak(spokenText.length > 300 ? spokenText.slice(0, 300) + '...' : spokenText);
          }
        }
      }
    } else {
      out({ ok: true, result });
      const auto = await voiceCommand('/voice auto status');
      if (auto?.ok && auto?.autoSpeak === true && result != null) {
        await speak(String(result));
      }
    }
  } catch (err) {
    out({ ok: false, error: err?.message || String(err), stack: err?.stack });
    process.exit(1);
  }
}

export async function runModule(moduleName, fn) {
  try {
    const res = await fn();
    return { ok: true, module: moduleName, res };
  } catch (err) {
    return { ok: false, module: moduleName, error: err?.message || String(err) };
  }
}

export default dispatch;
