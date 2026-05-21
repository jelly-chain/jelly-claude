import { getCache } from '../../../core/cache.mjs';

const cache = getCache('clipboard-watch', { defaultTtlMs: 5_000 });

export async function watch(args = {}) {
  // Simulate watching clipboard
  return {
    ok: true,
    watching: true,
    message: 'Clipboard watching started',
  };
}

export async function stop(args = {}) {
  // Simulate stopping clipboard watch
  return {
    ok: true,
    message: 'Clipboard watching stopped',
  };
}

export async function check(args = {}) {
  // Simulate checking clipboard content
  const content = 'https://example.com/address/0x1234...';
  return {
    ok: true,
    content,
    type: 'crypto-address',
  };
}