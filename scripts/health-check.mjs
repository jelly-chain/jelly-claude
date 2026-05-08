import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
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

function portFree(port) {
  return new Promise(resolve => {
    const s = createServer();
    s.once('error', () => resolve(false));
    s.once('listening', () => { s.close(); resolve(true); });
    s.listen(port, '127.0.0.1');
  });
}

function hasCommand(cmd) {
  try {
    execSync(
      process.platform === 'win32' ? `where ${cmd}` : `command -v ${cmd}`,
      { stdio: 'pipe', shell: true }
    );
    return true;
  } catch { return false; }
}

async function run() {
  console.log('');
  console.log(`${CYAN}  ╔══════════════════════════════════════════════════╗${NC}`);
  console.log(`${CYAN}  ║         Jelly-Claude Health Check                ║${NC}`);
  console.log(`${CYAN}  ╚══════════════════════════════════════════════════╝${NC}`);
  console.log('');

  let issues = 0;

  info('Checking runtime...');
  const nodeVer = process.versions.node.split('.').map(Number);
  if (nodeVer[0] >= 18) ok(`Node.js v${process.versions.node}`);
  else { fail(`Node.js v${process.versions.node} — v18+ required`); issues++; }

  if (hasCommand('claude')) ok('Claude Code CLI found');
  else warn('Claude Code CLI not installed — run: npm install -g @anthropic-ai/claude-code');

  info('Checking key files...');
  const required = ['proxy.mjs', 'jelly-claude.mjs', 'package.json', 'CLAUDE.md', 'core/prediction.mjs'];
  for (const f of required) {
    if (existsSync(join(ROOT, f))) ok(f);
    else { fail(`Missing: ${f}`); issues++; }
  }

  info('Checking .env...');
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) {
    warn('.env not found — run setup.sh first');
  } else {
    const envContent = readFileSync(envPath, 'utf8');
    const hasKey = /^(ANTHROPIC_API_KEY|OPENROUTER_API_KEY)=.+/m.test(envContent);
    if (hasKey) ok('.env has API key');
    else warn('.env found but no API key set (add ANTHROPIC_API_KEY or OPENROUTER_API_KEY)');
  }

  info('Checking proxy port 7788...');
  const free = await portFree(7788);
  if (free) ok('Port 7788 is free (proxy not yet running)');
  else ok('Port 7788 is in use (proxy running)');

  info('Checking config files...');
  const configs = ['config/risk-profiles.json', 'config/strategies.json', 'config/thresholds.json', 'config/keywords.json'];
  for (const c of configs) {
    if (existsSync(join(ROOT, c))) ok(c);
    else { fail(`Missing config: ${c}`); issues++; }
  }

  info('Checking wallet and keys files...');
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const jellyDir  = join(homeDir, '.jelly-claude');
  const walletDir = join(jellyDir, 'wallets');
  const keysFile  = join(jellyDir, '.keys');

  if (existsSync(join(walletDir, 'solana.pub'))) ok('Solana wallet found');
  else warn('Solana wallet not found — run setup.sh');

  if (existsSync(join(walletDir, 'evm.pub'))) ok('EVM wallet found');
  else warn('EVM wallet not found — run setup.sh');

  if (existsSync(keysFile)) ok('.keys file found');
  else warn('.keys file not found — run setup.sh to create it');

  info('Checking skills and agents...');
  const claudeDir  = join(homeDir, '.claude');
  const skillsDir  = join(claudeDir, 'skills');
  const agentsDir  = join(claudeDir, 'agents');
  if (existsSync(skillsDir)) ok('Skills directory found');
  else warn('Skills not installed — run: npm run install-skills');
  if (existsSync(agentsDir)) ok('Agents directory found');
  else warn('Agents not installed — run: npm run install-agents');

  console.log('');
  if (issues === 0) {
    console.log(`${GREEN}  ✓ All health checks passed.${NC}`);
  } else {
    console.log(`${RED}  ✗ ${issues} issue(s) found. Run setup.sh to fix.${NC}`);
    process.exit(1);
  }
  console.log('');
}

run().catch(e => { console.error(e); process.exit(1); });
