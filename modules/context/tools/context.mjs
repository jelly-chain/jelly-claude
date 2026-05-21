import { getCache } from '../../../core/cache.mjs';

const cache = getCache('context', { defaultTtlMs: 60_000 });

export async function store(args = {}) {
  if (!args.key) return { ok: false, error: 'Missing --key' };
  if (!args.value) return { ok: false, error: 'Missing --value' };
  // Store in cache
  cache.set(args.key, args.value);
  return { ok: true, message: 'Context stored successfully' };
}

export async function retrieve(args = {}) {
  if (!args.key) return { ok: false, error: 'Missing --key' };
  const value = cache.get(args.key);
  if (value === undefined) return { ok: false, error: 'Key not found' };
  return { ok: true, key: args.key, value };
}

export async function deleteContext(args = {}) {
  if (!args.key) return { ok: false, error: 'Missing --key' };
  cache.delete(args.key);
  return { ok: true, message: 'Context deleted' };
}

export async function list(args = {}) {
  // In a real implementation, we would list all keys. For now, return a mock list.
  return {
    ok: true,
    keys: ['user:preferences', 'agent:config', 'session:data'],
  };
}