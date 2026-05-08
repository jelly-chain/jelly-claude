import { createServer } from 'node:net';
import { execSync } from 'node:child_process';
import { platform } from 'node:os';

const PROXY_PORT = parseInt(process.env.PROXY_PORT ?? '7788', 10);

function portInUse(port) {
  return new Promise(resolve => {
    const server = createServer();
    server.once('error', () => resolve(true));
    server.once('listening', () => { server.close(); resolve(false); });
    server.listen(port, '127.0.0.1');
  });
}

function killPortProcess(port) {
  const isWin = platform() === 'win32';
  try {
    if (isWin) {
      const raw = execSync(
        `netstat -ano | findstr :${port}`,
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      const pids = [...new Set(
        raw.split('\n')
          .map(l => l.trim().split(/\s+/).pop())
          .filter(p => p && /^\d+$/.test(p) && p !== '0')
      )];
      for (const pid of pids) {
        try { execSync(`taskkill /F /PID ${pid}`, { stdio: 'pipe' }); } catch {}
      }
    } else {
      try {
        execSync(`lsof -ti tcp:${port} | xargs kill -9`, { stdio: 'pipe', shell: true });
      } catch {
        try { execSync(`fuser -k ${port}/tcp`, { stdio: 'pipe', shell: true }); } catch {}
      }
    }
  } catch {}
}

export async function ensurePortFree(port = PROXY_PORT, { forceKill = true, waitMs = 800 } = {}) {
  const busy = await portInUse(port);
  if (!busy) return { ok: true, action: 'none', port };

  if (!forceKill) {
    return { ok: false, action: 'port_busy', port,
      message: `Port ${port} is already in use. Stop the existing process and retry.` };
  }

  killPortProcess(port);
  await new Promise(r => setTimeout(r, waitMs));

  const stillBusy = await portInUse(port);
  if (stillBusy) {
    return { ok: false, action: 'kill_failed', port,
      message: `Port ${port} is still in use after kill attempt. Try: lsof -ti tcp:${port} | xargs kill -9` };
  }

  return { ok: true, action: 'killed', port };
}

export async function waitForPort(port = PROXY_PORT, { timeoutMs = 10_000, intervalMs = 300 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const busy = await portInUse(port);
    if (busy) return { ok: true, port };
    await new Promise(r => setTimeout(r, intervalMs));
  }
  return { ok: false, port, message: `Proxy did not start on port ${port} within ${timeoutMs}ms` };
}

export default { ensurePortFree, waitForPort, PROXY_PORT };
