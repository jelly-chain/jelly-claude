import { spawn } from 'node:child_process';
import { platform } from 'node:os';
import { SHELL } from './platform.mjs';

const _isWin = platform() === 'win32';

export async function sh(cmd, { cwd = process.cwd(), timeoutMs = 30000, shell } = {}) {
  const sh  = shell ?? SHELL.bin;
  const arg = _isWin ? '/c' : '-c';

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => p.kill(_isWin ? undefined : 'SIGTERM'), timeoutMs);
    const p = spawn(sh, [arg, cmd], { 
      cwd, 
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: timeoutMs,
      shell: false,
    });
    
    let stdout = '', stderr = '';
    p.stdout.on('data', chunk => stdout += chunk);
    p.stderr.on('data', chunk => stderr += chunk);
    
    p.on('close', (code, signal) => {
      clearTimeout(timer);
      resolve({ ok: code === 0, code, signal, stdout: stdout.trim(), stderr: stderr.trim() });
    });
    
    p.on('error', reject);
  });
}

export async function shOrThrow(cmd, opts) {
  const r = await sh(cmd, opts);
  if (!r.ok) throw new Error(`sh failed: ${r.code} ${r.stderr}`);
  return r;
}

export async function which(cmd) {
  const r = await sh(`command -v ${cmd}`, { timeoutMs: 5000 });
  return r.ok ? r.stdout.trim() : null;
}

export default { sh, shOrThrow, which };
