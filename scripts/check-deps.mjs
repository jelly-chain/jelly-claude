import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const NC     = '\x1b[0m';

function ok(msg)   { console.log(`${GREEN}  ✓ ${msg}${NC}`); }
function fail(msg) { console.log(`${RED}  ✗ ${msg}${NC}`); }
function warn(msg) { console.log(`${YELLOW}  ⚠ ${msg}${NC}`); }
function info(msg) { console.log(`${CYAN}  ▶ ${msg}${NC}`); }

function hasCommand(cmd) {
  const finder = process.platform === 'win32' ? `where ${cmd}` : `command -v ${cmd}`;
  try { execSync(finder, { stdio: 'pipe', shell: true }); return true; } catch { return false; }
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const result = {};
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 1) continue;
    const k = trimmed.slice(0, eqIdx).trim();
    const v = trimmed.slice(eqIdx + 1).trim();
    result[k] = v;
  }
  return result;
}

function isSet(val) {
  return val && val.trim().length > 0;
}

const OPTIONAL_API_KEYS = [
  { key: 'ANTHROPIC_API_KEY',       desc: 'Claude (paid) — https://console.anthropic.com',    group: 'AI' },
  { key: 'OPENROUTER_API_KEY',      desc: 'OpenRouter (free models) — https://openrouter.ai', group: 'AI' },
  { key: 'BIRDEYE_API_KEY',         desc: 'Birdeye Solana analytics — https://birdeye.so',     group: 'Data' },
  { key: 'HELIUS_API_KEY',          desc: 'Helius RPC/webhooks — https://helius.xyz',           group: 'Data' },
  { key: 'BNBCHAIN_API_KEY',        desc: 'BNBChain explorer API',                             group: 'Data' },
  { key: 'TELEGRAM_BOT_TOKEN',      desc: 'Telegram bot notifications — @BotFather',           group: 'Notifications' },
  { key: 'TELEGRAM_CHAT_ID',        desc: 'Telegram target chat ID — @userinfobot',            group: 'Notifications' },
  { key: 'POLYMARKET_API_KEY',      desc: 'Polymarket trading — https://polymarket.com',       group: 'Markets' },
  { key: 'POLYMARKET_SECRET',       desc: 'Polymarket HMAC secret',                           group: 'Markets' },
  { key: 'POLYMARKET_PASSPHRASE',   desc: 'Polymarket passphrase',                            group: 'Markets' },
  { key: 'KALSHI_API_KEY',          desc: 'Kalshi API key — https://kalshi.com',               group: 'Markets' },
  { key: 'KALSHI_API_SECRET',       desc: 'Kalshi API secret',                                group: 'Markets' },
  { key: 'PREDICT_API_KEY',         desc: 'predict.fun API key',                              group: 'Markets' },
  { key: 'BALLDONTLIE_API_KEY',     desc: 'BallDontLie sports data — https://app.balldontlie.io', group: 'Sports' },
  { key: 'SPORTS_API_KEY',          desc: 'api-sports.io multi-sport API',                    group: 'Sports' },
  { key: 'FOOTBALL_DATA_API_KEY',   desc: 'football-data.org football API',                   group: 'Sports' },
  { key: 'ODDS_API_KEY',            desc: 'The Odds API — https://the-odds-api.com',           group: 'Sports' },
  { key: 'ALCHEMY_API_KEY',         desc: 'Alchemy multi-chain RPC — https://alchemy.com',    group: 'RPC' },
];

async function run() {
  console.log('');
  console.log(`${CYAN}  Jelly-Claude Dependency Check${NC}`);
  console.log('');

  let issues = 0;

  info('System dependencies...');
  if (hasCommand('node')) ok(`Node.js ${process.versions.node}`);
  else { fail('Node.js not found'); issues++; }
  if (hasCommand('npm')) ok('npm found');
  else { fail('npm not found'); issues++; }
  if (hasCommand('git')) ok('git found');
  else { warn('git not found (needed for setup.sh)'); }
  if (hasCommand('claude')) ok('Claude Code CLI found');
  else warn('Claude Code CLI not installed — run: npm install -g @anthropic-ai/claude-code');

  info('Node modules...');
  const pkgPath = join(ROOT, 'package.json');
  if (!existsSync(pkgPath)) { fail('package.json not found'); issues++; }
  else {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    const nmPath = join(ROOT, 'node_modules');
    if (!existsSync(nmPath)) {
      warn('node_modules missing — run: npm install');
    } else {
      const deps = Object.keys(pkg.dependencies ?? {});
      let missing = 0;
      for (const dep of deps) {
        if (!existsSync(join(nmPath, dep))) { warn(`Missing: ${dep}`); missing++; }
      }
      if (missing === 0) ok(`All ${deps.length} dependencies installed`);
      else { fail(`${missing} packages missing — run: npm install`); issues++; }
    }
  }

  info('Optional CLI tools...');
  if (hasCommand('solana')) ok('Solana CLI found');
  else warn('Solana CLI not found (optional — Node.js fallback will be used)');
  if (hasCommand('solana-keygen')) ok('solana-keygen found');
  else warn('solana-keygen not found (optional)');

  info('Optional API keys...');
  const envVars   = parseEnvFile(join(ROOT, '.env'));
  const keysVars  = parseEnvFile(
    join(process.env.HOME || process.env.USERPROFILE || '', '.jelly-claude', '.keys')
  );
  const allVars   = { ...process.env, ...keysVars, ...envVars };

  const groups = {};
  for (const { key, desc, group } of OPTIONAL_API_KEYS) {
    if (!groups[group]) groups[group] = { set: [], missing: [] };
    if (isSet(allVars[key])) groups[group].set.push(key);
    else groups[group].missing.push({ key, desc });
  }

  let anyMissing = false;
  for (const [group, { set, missing }] of Object.entries(groups)) {
    if (set.length > 0)  ok(`[${group}] ${set.join(', ')}`);
    for (const { key, desc } of missing) {
      warn(`[${group}] ${key} not set — ${desc}`);
      anyMissing = true;
    }
  }

  const hasAI = isSet(allVars['ANTHROPIC_API_KEY']) || isSet(allVars['OPENROUTER_API_KEY']);
  if (!hasAI) {
    fail('Neither ANTHROPIC_API_KEY nor OPENROUTER_API_KEY is set — Claude will prompt for login');
    issues++;
  }

  if (!anyMissing) ok('All optional API keys are configured');

  console.log('');
  if (issues === 0) console.log(`${GREEN}  ✓ Dependency check passed.${NC}`);
  else { console.log(`${RED}  ✗ ${issues} critical issue(s) found.${NC}`); process.exit(1); }
  console.log('');
}

run().catch(e => { console.error(e); process.exit(1); });
