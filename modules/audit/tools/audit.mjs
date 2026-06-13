import { getCache } from '../../../core/cache.mjs';

const cache = getCache('audit', { defaultTtlMs: 60_000 });

export async function log(args = {}) {
  if (!args.action) return { ok: false, error: 'Missing --action' };
  const entry = {
    timestamp: Date.now(),
    action: args.action,
    user: args.user || 'unknown',
    details: args.details || {},
  };
  const logs = await getLogs();
  logs.push(entry);
  await saveLogs(logs);
  return { ok: true, entry };
}

export async function query(args = {}) {
  const logs = await getLogs();
  let result = logs;
  if (args.action) result = result.filter(l => l.action === args.action);
  if (args.user) result = result.filter(l => l.user === args.user);
  if (args.start) result = result.filter(l => l.timestamp >= new Date(args.start).getTime());
  if (args.end) result = result.filter(l => l.timestamp <= new Date(args.end).getTime());
  return { ok: true, logs: result };
}

export async function check(args = {}) {
  const logs = await getLogs();
  let count = logs.length;
  let recent = logs[logs.length - 1];
  return { ok: true, total: count, recent };
}

async function getLogs() {
  const cached = await cache.get('audit-logs');
  if (cached) return cached;
  const logs = [];
  cache.set('audit-logs', logs);
  return logs;
}

async function saveLogs(logs) {
  cache.set('audit-logs', logs);
}