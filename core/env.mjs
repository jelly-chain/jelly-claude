// core/env.mjs — .env loader + typed accessors
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

let _loaded = false;

export function loadEnv(cwd = process.cwd()) {
  if (_loaded) return;
  const envPath = join(cwd, '.env');
  if (!existsSync(envPath)) { _loaded = true; return; }
  try {
    const content = readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) return;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    });
  } catch (e) {
    console.error('env load failed:', e.message);
  }
  _loaded = true;
}

// Auto-load on import
loadEnv();

export function env(key, fallback = undefined) {
  return process.env[key] ?? fallback;
}

export function requireEnv(key) {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
}

export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
export const OPENROUTER_HTTP_REFERER = process.env.OPENROUTER_HTTP_REFERER || 'http://localhost';
export const OPENROUTER_X_TITLE = process.env.OPENROUTER_X_TITLE || 'Buddy';
export const PROXY_PORT = parseInt(process.env.PROXY_PORT || '7788', 10);
export const BRAVE_SEARCH_API_KEY = process.env.BRAVE_SEARCH_API_KEY || '';
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

export default { loadEnv, env, requireEnv, OPENROUTER_API_KEY, PROXY_PORT };
