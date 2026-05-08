import { spawn } from 'node:child_process';
import { platform } from 'node:os';
import { writeFileSync, unlinkSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { SHELL } from './platform.mjs';

const _isWin = platform() === 'win32';

export async function sh(cmd, { cwd = process.cwd(), timeoutMs = 30000, shell } = {}) {
  const sh  = shell ?? SHELL.bin;
  const arg = _isWin ? '/c' : '-c';

  return new Promise((resolve, reject) => {
    let timer = null;
    const p = spawn(sh, [arg, cmd], {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false,
    });

    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        try { p.kill(_isWin ? undefined : 'SIGTERM'); } catch {}
      }, timeoutMs);
    }

    let stdout = '', stderr = '';
    p.stdout.on('data', chunk => { stdout += chunk; });
    p.stderr.on('data', chunk => { stderr += chunk; });

    p.on('close', (code) => {
      if (timer) clearTimeout(timer);
      resolve({ ok: code === 0, code, stdout: stdout.trim(), stderr: stderr.trim() });
    });

    p.on('error', err => {
      if (timer) clearTimeout(timer);
      reject(err);
    });
  });
}

export async function shOrThrow(cmd, opts) {
  const r = await sh(cmd, opts);
  if (!r.ok) throw new Error(`sh failed: ${r.code} ${r.stderr}`);
  return r;
}

export async function which(cmd) {
  if (_isWin) {
    const r = await sh(`where ${cmd}`, { timeoutMs: 5000 });
    return r.ok ? r.stdout.split('\n')[0].trim() : null;
  }
  const r = await sh(`command -v ${cmd}`, { timeoutMs: 5000 });
  return r.ok ? r.stdout.trim() : null;
}

export async function runNodeScript(scriptContent, { cwd = process.cwd(), timeoutMs = 30000 } = {}) {
  let tmpDir, tmpFile;
  try {
    tmpDir  = mkdtempSync(join(tmpdir(), 'jelly-'));
    tmpFile = join(tmpDir, 'script.cjs');
    writeFileSync(tmpFile, scriptContent, 'utf8');
    return await sh(`node "${tmpFile}"`, { cwd, timeoutMs });
  } finally {
    try { if (tmpFile) unlinkSync(tmpFile); } catch {}
    try { if (tmpDir) { const { rmSync } = await import('node:fs'); rmSync(tmpDir, { recursive: true, force: true }); } } catch {}
  }
}

export default { sh, shOrThrow, which, runNodeScript };
