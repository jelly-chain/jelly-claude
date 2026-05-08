import { rmSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const NC     = '\x1b[0m';

function ok(msg)   { console.log(`${GREEN}  ✓ ${msg}${NC}`); }
function warn(msg) { console.log(`${YELLOW}  ⚠ ${msg}${NC}`); }
function info(msg) { console.log(`${CYAN}  ▶ ${msg}${NC}`); }

const args = process.argv.slice(2);
const force = args.includes('--force') || args.includes('-f');
const logsOnly = args.includes('--logs-only');

async function confirm(question) {
  if (force) return true;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, ans => { rl.close(); resolve(ans.trim().toLowerCase() === 'y'); });
  });
}

function removeIfExists(p, label) {
  if (existsSync(p)) {
    rmSync(p, { recursive: true, force: true });
    ok(`Removed: ${label}`);
  } else {
    warn(`Not found (skipped): ${label}`);
  }
}

function clearDir(p, label) {
  if (!existsSync(p)) { warn(`Not found (skipped): ${label}`); return; }
  for (const entry of readdirSync(p)) {
    const full = join(p, entry);
    try { rmSync(full, { recursive: true, force: true }); } catch {}
  }
  ok(`Cleared: ${label}`);
}

async function run() {
  console.log('');
  console.log(`${CYAN}  Jelly-Claude Reset Utility${NC}`);
  console.log('');

  if (logsOnly) {
    info('Clearing logs only...');
    clearDir(join(ROOT, 'logs'), 'logs/');
    console.log(`\n${GREEN}  ✓ Logs cleared.${NC}\n`);
    return;
  }

  console.log(`${YELLOW}  This will clear:${NC}`);
  console.log('    • logs/            (runtime logs)');
  console.log('    • node_modules/    (reinstall with npm install)');
  console.log('');
  console.log(`${RED}  It will NOT delete:${NC}`);
  console.log('    • .env             (your API keys)');
  console.log('    • ~/.jelly-claude/ (your wallets and service keys)');
  console.log('');

  const yes = await confirm('  Proceed? [y/N] ');
  if (!yes) { console.log('\n  Cancelled.\n'); return; }

  console.log('');
  info('Resetting...');
  clearDir(join(ROOT, 'logs'), 'logs/');
  removeIfExists(join(ROOT, 'node_modules'), 'node_modules/');

  console.log('');
  console.log(`${GREEN}  ✓ Reset complete.${NC}`);
  console.log('');
  console.log('  To restore:');
  console.log('    npm install');
  console.log('');
}

run().catch(e => { console.error(e); process.exit(1); });
