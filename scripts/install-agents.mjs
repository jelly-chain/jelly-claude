import { existsSync, readdirSync, statSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PARENT = dirname(ROOT);

const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const NC     = '\x1b[0m';

function ok(msg)   { console.log(`${GREEN}  ✓ ${msg}${NC}`); }
function fail(msg) { console.log(`${RED}  ✗ ${msg}${NC}`); }
function warn(msg) { console.log(`${YELLOW}  ⚠ ${msg}${NC}`); }
function info(msg) { console.log(`${CYAN}  ▶ ${msg}${NC}`); }

const AGENTS_REPO_NAME  = 'jelly-claude-agents';
const AGENTS_REPO_URL   = `https://github.com/jelly-chain/${AGENTS_REPO_NAME}.git`;
const BUNDLED_AGENTS_DIR = join(ROOT, 'bundled', 'agents');
const CLAUDE_AGENTS_DIR  = join(
  process.env.HOME || process.env.USERPROFILE || '',
  '.claude', 'agents'
);

function gitCloneOrPull(repoUrl, targetDir) {
  if (existsSync(join(targetDir, '.git'))) {
    info(`Pulling latest ${basename(targetDir)}...`);
    try { execSync(`git -C "${targetDir}" pull --quiet`, { stdio: 'pipe' }); ok('Pulled latest'); }
    catch { warn('git pull failed — using existing version'); }
  } else if (existsSync(targetDir)) {
    ok(`${basename(targetDir)} directory found (using as-is)`);
  } else {
    info(`Cloning ${repoUrl}...`);
    execSync(`git clone "${repoUrl}" "${targetDir}"`, { stdio: 'inherit' });
    ok(`Cloned ${basename(targetDir)}`);
  }
}

function installAgentsFromDir(agentsDir) {
  if (!existsSync(agentsDir)) { fail(`Agents directory not found: ${agentsDir}`); return 0; }

  const claudeAgentsDir = CLAUDE_AGENTS_DIR;
  mkdirSync(claudeAgentsDir, { recursive: true });

  const entries = readdirSync(agentsDir).filter(e => {
    const full = join(agentsDir, e);
    return statSync(full).isDirectory() || e.endsWith('.md') || e.endsWith('.json');
  });

  let installed = 0;

  for (const entry of entries) {
    const src = join(agentsDir, entry);
    const isDir = statSync(src).isDirectory();

    if (isDir) {
      const installSh = join(src, 'install.sh');
      if (existsSync(installSh)) {
        try {
          execSync(`bash "${installSh}"`, { stdio: 'pipe', cwd: src });
          ok(`Installed agent: ${entry}`);
          installed++;
          continue;
        } catch { warn(`install.sh failed for ${entry} — copying manually`); }
      }
      const dest = join(claudeAgentsDir, entry);
      mkdirSync(dest, { recursive: true });
      try {
        for (const f of readdirSync(src)) {
          const fsrc = join(src, f);
          if (!statSync(fsrc).isDirectory()) copyFileSync(fsrc, join(dest, f));
        }
        ok(`Installed agent: ${entry}`);
        installed++;
      } catch { fail(`Could not install agent: ${entry}`); }
    } else {
      try {
        copyFileSync(src, join(claudeAgentsDir, entry));
        ok(`Installed agent file: ${entry}`);
        installed++;
      } catch { fail(`Could not copy: ${entry}`); }
    }
  }
  return installed;
}

async function run() {
  console.log('');
  console.log(`${CYAN}  Jelly-Claude Agent Template Installer${NC}`);
  console.log('');

  const args = process.argv.slice(2);
  const customDir = args.find(a => !a.startsWith('--'));

  let agentsDir;

  if (customDir && existsSync(customDir)) {
    agentsDir = customDir;
    info(`Using provided agents directory: ${agentsDir}`);
  } else {
    const sibling = join(PARENT, AGENTS_REPO_NAME);
    try {
      gitCloneOrPull(AGENTS_REPO_URL, sibling);
      const subDir = join(sibling, 'agents');
      agentsDir = existsSync(subDir) ? subDir : sibling;
    } catch (e) {
      warn(`Could not clone ${AGENTS_REPO_NAME}: ${e.message}`);
      if (existsSync(BUNDLED_AGENTS_DIR)) {
        warn('Falling back to bundled agent templates...');
        agentsDir = BUNDLED_AGENTS_DIR;
      } else {
        fail('No bundled agents found and external clone failed.');
        fail('Run: npm run install-agents  (after restoring internet access)');
        process.exit(1);
      }
    }
  }

  info('Installing agent templates...');
  const count = installAgentsFromDir(agentsDir);

  console.log('');
  if (count > 0) {
    console.log(`${GREEN}  ✓ ${count} agent template(s) installed to ~/.claude/agents/${NC}`);
  } else {
    warn('No agent templates were installed.');
  }
  console.log('');
}

run().catch(e => { console.error(e); process.exit(1); });
