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

const SKILLS_REPO_NAME  = 'jelly-claude-skills';
const SKILLS_REPO_URL   = `https://github.com/jelly-chain/${SKILLS_REPO_NAME}.git`;
const BUNDLED_SKILLS_DIR = join(ROOT, 'bundled', 'skills');
const CLAUDE_SKILLS_DIR  = join(
  process.env.HOME || process.env.USERPROFILE || '',
  '.claude', 'skills'
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

function installSkillsFromDir(skillsDir) {
  if (!existsSync(skillsDir)) { fail(`Skills directory not found: ${skillsDir}`); return 0; }

  const claudeSkillsDir = CLAUDE_SKILLS_DIR;
  mkdirSync(claudeSkillsDir, { recursive: true });

  const entries = readdirSync(skillsDir).filter(e => statSync(join(skillsDir, e)).isDirectory());
  let installed = 0;

  for (const skill of entries) {
    const skillDir = join(skillsDir, skill);
    const installSh = join(skillDir, 'install.sh');
    if (existsSync(installSh)) {
      try {
        execSync(`bash "${installSh}"`, { stdio: 'pipe', cwd: skillDir });
        ok(`Installed skill: ${skill}`);
        installed++;
      } catch {
        warn(`install.sh failed for ${skill} — copying manually`);
        const dest = join(claudeSkillsDir, skill);
        mkdirSync(dest, { recursive: true });
        try {
          for (const f of readdirSync(skillDir)) {
            copyFileSync(join(skillDir, f), join(dest, f));
          }
          ok(`Copied skill: ${skill}`);
          installed++;
        } catch { fail(`Could not install skill: ${skill}`); }
      }
    } else {
      const dest = join(claudeSkillsDir, skill);
      mkdirSync(dest, { recursive: true });
      try {
        for (const f of readdirSync(skillDir)) {
          const src = join(skillDir, f);
          if (!statSync(src).isDirectory()) copyFileSync(src, join(dest, f));
        }
        ok(`Installed skill: ${skill}`);
        installed++;
      } catch { fail(`Could not install skill: ${skill}`); }
    }
  }
  return installed;
}

async function run() {
  console.log('');
  console.log(`${CYAN}  Jelly-Claude Skills Installer${NC}`);
  console.log('');

  const args = process.argv.slice(2);
  const customDir = args.find(a => !a.startsWith('--'));

  let skillsDir;

  if (customDir && existsSync(customDir)) {
    skillsDir = join(customDir, 'skills');
    if (!existsSync(skillsDir)) skillsDir = customDir;
    info(`Using provided skills directory: ${skillsDir}`);
  } else {
    const sibling = join(PARENT, SKILLS_REPO_NAME);
    try {
      gitCloneOrPull(SKILLS_REPO_URL, sibling);
      skillsDir = join(sibling, 'skills');
      if (!existsSync(skillsDir)) skillsDir = sibling;
    } catch (e) {
      warn(`Could not clone ${SKILLS_REPO_NAME}: ${e.message}`);
      if (existsSync(BUNDLED_SKILLS_DIR)) {
        warn('Falling back to bundled skills...');
        skillsDir = BUNDLED_SKILLS_DIR;
      } else {
        fail('No bundled skills found and external clone failed.');
        fail('Run: npm run install-skills  (after restoring internet access)');
        process.exit(1);
      }
    }
  }

  info('Installing skills...');
  const count = installSkillsFromDir(skillsDir);

  console.log('');
  if (count > 0) {
    console.log(`${GREEN}  ✓ ${count} skill(s) installed to ~/.claude/skills/${NC}`);
  } else {
    warn('No skills were installed.');
  }
  console.log('');
}

run().catch(e => { console.error(e); process.exit(1); });
