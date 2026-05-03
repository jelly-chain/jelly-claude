import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JELLY_DIR, WALLETS_DIR, KEYS_FILE, SKILLS_DIR, AGENTS_DIR, HOME, isWindows } from './platform.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const REPO_ROOT    = resolve(__dirname, '..');
export const CORE_DIR     = __dirname;
export const MODULES_DIR  = join(REPO_ROOT, 'modules');
export const CONFIG_DIR   = join(REPO_ROOT, 'config');
export const MEMORY_DIR   = join(REPO_ROOT, 'memory');
export const SCRIPTS_DIR  = join(REPO_ROOT, 'scripts');
export const DOCS_DIR     = join(REPO_ROOT, 'docs');
export const TESTS_DIR    = join(REPO_ROOT, 'tests');
export const LOGS_DIR     = join(REPO_ROOT, 'logs');
export const AGENTS_SRC   = join(REPO_ROOT, 'ai-agents');

export {
  HOME,
  JELLY_DIR,
  WALLETS_DIR,
  KEYS_FILE,
  SKILLS_DIR,
  AGENTS_DIR,
};

export const SOLANA_WALLET = join(WALLETS_DIR, 'solana.json');
export const EVM_WALLET    = join(WALLETS_DIR, 'evm.json');
export const MODE_FILE     = join(LOGS_DIR, 'mode-state.json');
export const AUDIT_FILE    = join(LOGS_DIR, 'audit.jsonl');
export const METRICS_FILE  = join(LOGS_DIR, 'metrics.json');
export const CACHE_DIR     = join(LOGS_DIR, 'cache');

export function modulePath(name, ...rest) {
  return join(MODULES_DIR, name, ...rest);
}

export function configPath(name) {
  return join(CONFIG_DIR, name);
}

export function logPath(name) {
  return join(LOGS_DIR, name);
}

export default {
  REPO_ROOT, CORE_DIR, MODULES_DIR, CONFIG_DIR, LOGS_DIR,
  JELLY_DIR, WALLETS_DIR, KEYS_FILE, SKILLS_DIR, AGENTS_DIR,
  SOLANA_WALLET, EVM_WALLET, MODE_FILE, AUDIT_FILE,
  modulePath, configPath, logPath,
};
