import { platform, homedir as _homedir, arch } from 'node:os';
import { join, sep } from 'node:path';

export const OS = platform();
export const isWindows = OS === 'win32';
export const isMac     = OS === 'darwin';
export const isLinux   = OS === 'linux';
export const ARCH      = arch();
export const HOME      = _homedir();
export const SEP       = sep;

export const JELLY_DIR   = join(HOME, '.jelly-claude');
export const WALLETS_DIR = join(JELLY_DIR, 'wallets');
export const KEYS_FILE   = join(JELLY_DIR, '.keys');
export const CLAUDE_DIR  = join(HOME, '.claude');
export const SKILLS_DIR  = join(CLAUDE_DIR, 'skills');
export const AGENTS_DIR  = join(CLAUDE_DIR, 'agents');

export const SHELLS = {
  win32:  { bin: 'cmd.exe',  flag: '/c'  },
  darwin: { bin: '/bin/bash', flag: '-c' },
  linux:  { bin: '/bin/bash', flag: '-c' },
};

export const SHELL = SHELLS[OS] ?? SHELLS.linux;

export function normPath(p) {
  if (isWindows) return p.replace(/\//g, '\\');
  return p.replace(/\\/g, '/');
}

export function homePath(...parts) {
  return join(HOME, ...parts);
}

export function jellyPath(...parts) {
  return join(JELLY_DIR, ...parts);
}

export function skillPath(skillName) {
  return join(SKILLS_DIR, skillName, 'SKILL.md');
}

export function agentPath(agentName) {
  return join(AGENTS_DIR, `${agentName}.md`);
}

export function platformInfo() {
  return {
    os: OS,
    arch: ARCH,
    home: HOME,
    isWindows,
    isMac,
    isLinux,
    shell: SHELL.bin,
    jellyDir: JELLY_DIR,
    walletsDir: WALLETS_DIR,
    skillsDir: SKILLS_DIR,
    agentsDir: AGENTS_DIR,
  };
}

export default { OS, isWindows, isMac, isLinux, HOME, SHELL, normPath, homePath, jellyPath, platformInfo };
