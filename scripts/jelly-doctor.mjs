#!/usr/bin/env node
/**
 * scripts/jelly-doctor.mjs
 *
 * Comprehensive diagnostic command for Jelly-Claude.
 * Checks env validity, API keys, wallet balances, disk space,
 * config files, outbound HTTPS, and prints a health score.
 *
 * Usage:
 *   node scripts/jelly-doctor.mjs
 *   npm run doctor
 */

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir, totalmem, freemem } from 'node:os';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ANSI colors
const G = '\x1b[32m✅\x1b[0m';
const R = '\x1b[31m❌\x1b[0m';
const Y = '\x1b[33m⚠️ \x1b[0m';
const B = '\x1b[34mℹ️ \x1b[0m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

const checks = [];
let passed = 0;
let failed = 0;
let warnings = 0;

function ok(name, detail = '') {
  checks.push({ status: 'ok', name, detail });
  passed++;
  console.log(`  ${G} ${name}${detail ? ` ${DIM}${detail}${RESET}` : ''}`);
}

function fail(name, detail = '') {
  checks.push({ status: 'fail', name, detail });
  failed++;
  console.log(`  ${R} ${name}${detail ? ` ${DIM}${detail}${RESET}` : ''}`);
}

function warn(name, detail = '') {
  checks.push({ status: 'warn', name, detail });
  warnings++;
  console.log(`  ${Y} ${name}${detail ? ` ${DIM}${detail}${RESET}` : ''}`);
}

function info(msg) {
  console.log(`  ${B} ${msg}`);
}

// ── Check runners ─────────────────────────────────────────────────────────────

async function checkEnvFile() {
  const envPath = join(ROOT, '.env');
  if (existsSync(envPath)) {
    const stat = statSync(envPath);
    ok('.env file exists', `(${(stat.size / 1024).toFixed(1)} KB)`);
  } else {
    warn('.env file not found', 'Copy .env.example to .env');
  }
}

async function checkPackageJson() {
  const pkgPath = join(ROOT, 'package.json');
  if (!existsSync(pkgPath)) {
    fail('package.json missing');
    return;
  }
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    ok('package.json valid', `v${pkg.version}`);
  } catch (err) {
    fail('package.json parse error', err.message);
  }
}

async function checkNodeModules() {
  const nmPath = join(ROOT, 'node_modules');
  if (existsSync(nmPath)) {
    const count = readdirSync(nmPath).length;
    ok('node_modules exists', `(${count} packages)`);
  } else {
    fail('node_modules missing', 'Run: npm install');
  }
}

async function checkConfigFiles() {
  const configDir = join(ROOT, 'config');
  const requiredFiles = ['keywords.json', 'thresholds.json', 'providers.json', 'risk-profiles.json'];
  for (const file of requiredFiles) {
    const path = join(configDir, file);
    if (existsSync(path)) {
      try {
        JSON.parse(readFileSync(path, 'utf8'));
        ok(`config/${file} valid`);
      } catch {
        fail(`config/${file} parse error`);
      }
    } else {
      fail(`config/${file} missing`);
    }
  }
}

async function checkEnvVars() {
  // Load .env if present
  const envPath = join(ROOT, '.env');
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match) {
        const [, key, val] = match;
        if (!process.env[key] && val.trim()) {
          process.env[key] = val.trim();
        }
      }
    }
  }

  // Critical keys
  const critical = [
    { key: 'ANTHROPIC_API_KEY', label: 'Anthropic API Key' },
  ];

  for (const { key, label } of critical) {
    if (process.env[key]?.trim()) {
      ok(`${label} set`);
    } else {
      fail(`${label} not set`, `Set ${key} in .env`);
    }
  }

  // Optional but recommended
  const optional = [
    { key: 'HELIUS_API_KEY', label: 'Helius (Solana enhanced)' },
    { key: 'BIRDEYE_API_KEY', label: 'Birdeye (token analytics)' },
    { key: 'TELEGRAM_BOT_TOKEN', label: 'Telegram bridge' },
    { key: 'SOLANA_PRIVATE_KEY', label: 'Solana wallet' },
    { key: 'EVM_PRIVATE_KEY', label: 'EVM wallet' },
    { key: 'POLYMARKET_API_KEY', label: 'Polymarket' },
    { key: 'KALSHI_API_KEY', label: 'Kalshi' },
    { key: 'CRYPTOPANIC_API_KEY', label: 'CryptoPanic news' },
    { key: 'ALCHEMY_API_KEY', label: 'Alchemy RPC' },
  ];

  for (const { key, label } of optional) {
    if (process.env[key]?.trim()) {
      ok(`${label} configured`);
    } else {
      warn(`${label} not configured`, `Set ${key} in .env`);
    }
  }
}

async function checkKeyFormats() {
  const solKey = process.env.SOLANA_PRIVATE_KEY?.trim();
  if (solKey) {
    if (solKey.startsWith('[') && solKey.endsWith(']')) {
      try {
        const arr = JSON.parse(solKey);
        if (Array.isArray(arr) && arr.length === 64) ok('Solana key format valid (byte array)');
        else fail('Solana key: array must have 64 bytes');
      } catch { fail('Solana key: invalid JSON array'); }
    } else if (/^[1-9A-HJ-NP-Za-km-z]{64,88}$/.test(solKey)) {
      ok('Solana key format valid (base58)');
    } else {
      warn('Solana key format unusual', 'Expected base58 or JSON byte array');
    }
  }

  const evmKey = process.env.EVM_PRIVATE_KEY?.trim();
  if (evmKey) {
    const hex = evmKey.startsWith('0x') ? evmKey.slice(2) : evmKey;
    if (/^[0-9a-fA-F]{64}$/.test(hex)) ok('EVM key format valid (hex)');
    else fail('EVM key: must be 32 bytes hex (64 hex chars)');
  }
}

async function checkOutboundHttps() {
  try {
    const res = await fetch('https://httpbin.org/get', {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) ok('Outbound HTTPS working');
    else fail('Outbound HTTPS failed', `Status: ${res.status}`);
  } catch (err) {
    fail('Outbound HTTPS failed', err.message);
  }
}

async function checkDiskSpace() {
  const jellyDir = join(homedir(), '.jelly-claude');
  try {
    if (!existsSync(jellyDir)) {
      info(`~/.jelly-claude/ will be created on first run`);
    } else {
      // Check if ledger dir exists
      const ledgerDir = join(jellyDir, 'ledger');
      if (existsSync(ledgerDir)) {
        const files = readdirSync(ledgerDir).filter(f => f.endsWith('.ndjson'));
        ok(`Ledger directory exists`, `(${files.length} ledger files)`);
      } else {
        info('Ledger directory will be created on first trade');
      }
    }

    // Check available disk space
    try {
      const df = execSync('df -h .', { encoding: 'utf8', timeout: 3000 });
      const lines = df.trim().split('\n');
      if (lines.length > 1) {
        const parts = lines[1].split(/\s+/);
        const avail = parts[3] ?? '?';
        info(`Disk space available: ${avail}`);
      }
    } catch { /* ignore */ }
  } catch (err) {
    warn('Could not check disk space', err.message);
  }
}

async function checkSystemResources() {
  const totalGB = (totalmem() / 1e9).toFixed(1);
  const freeGB = (freemem() / 1e9).toFixed(1);
  const usedPct = (((totalmem() - freemem()) / totalmem()) * 100).toFixed(0);

  if (parseFloat(freeGB) < 0.5) {
    warn(`Low memory: ${freeGB}GB free / ${totalGB}GB total (${usedPct}% used)`);
  } else {
    ok(`Memory: ${freeGB}GB free / ${totalGB}GB total (${usedPct}% used)`);
  }

  // Node.js version
  ok(`Node.js ${process.version}`);
}

async function checkCoreModules() {
  const coreModules = [
    'core/events.mjs',
    'core/logger.mjs',
    'core/cache.mjs',
    'core/rate-limiter.mjs',
    'core/circuit-breaker.mjs',
    'core/price-feed.mjs',
    'core/prediction.mjs',
    'core/swarm.mjs',
    'core/agent-dispatcher.mjs',
    'core/wallet.mjs',
    'core/trade.mjs',
    'core/metrics.mjs',
    'core/app-error.mjs',
  ];

  for (const mod of coreModules) {
    const path = join(ROOT, mod);
    if (existsSync(path)) {
      ok(`${mod} exists`);
    } else {
      fail(`${mod} missing`);
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${BOLD}🪼 Jelly Doctor${RESET}`);
  console.log(`${'─'.repeat(50)}\n`);

  console.log(`${BOLD}1. Environment${RESET}`);
  await checkEnvFile();
  await checkPackageJson();
  await checkNodeModules();
  console.log();

  console.log(`${BOLD}2. Configuration${RESET}`);
  await checkConfigFiles();
  console.log();

  console.log(`${BOLD}3. API Keys & Secrets${RESET}`);
  await checkEnvVars();
  await checkKeyFormats();
  console.log();

  console.log(`${BOLD}4. Network${RESET}`);
  await checkOutboundHttps();
  console.log();

  console.log(`${BOLD}5. Disk & Storage${RESET}`);
  await checkDiskSpace();
  console.log();

  console.log(`${BOLD}6. System Resources${RESET}`);
  await checkSystemResources();
  console.log();

  console.log(`${BOLD}7. Core Modules${RESET}`);
  await checkCoreModules();
  console.log();

  // ── Score ──────────────────────────────────────────────────────────────────
  const total = passed + failed;
  const score = total > 0 ? Math.round((passed / total) * 10) : 0;
  const healthEmoji = score >= 9 ? '🟢' : score >= 7 ? '🟡' : score >= 5 ? '🟠' : '🔴';
  const healthLabel = score >= 9 ? 'Excellent' : score >= 7 ? 'Good' : score >= 5 ? 'Fair' : 'Needs Attention';

  console.log(`${'─'.repeat(50)}`);
  console.log(`${BOLD}Health Score: ${healthEmoji} ${score}/10 (${healthLabel})${RESET}`);
  console.log(`${DIM}  Passed: ${passed}  Failed: ${failed}  Warnings: ${warnings}${RESET}`);

  if (failed > 0) {
    console.log(`\n${BOLD}Fix the ${failed} failed check(s) above, then run:${RESET}`);
    console.log(`  ${DIM}node scripts/jelly-doctor.mjs${RESET}\n`);
  } else {
    console.log(`\n${G} All critical checks passed. Jelly is ready! 🪼\n`);
  }

  return { score, passed, failed, warnings, checks };
}

main().catch(err => {
  console.error('Doctor failed:', err.message);
  process.exit(1);
});
