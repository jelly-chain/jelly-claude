import { httpJson } from '../../../core/http.mjs';
import { getCache } from '../../../core/cache.mjs';

const cache = getCache('blockchain', { defaultTtlMs: 60_000 });

async function fetchBlockchainData(url, key) {
  return breaker.call(async () => {
    const c = cache.get(key);
    if (c) return c;
    const r = await httpJson(url);
    if (r.ok) cache.set(key, r.data);
    return r.ok ? r.data : null;
  }).catch(() => null);
}

export async function getBlock(args = {}) {
  if (!args.height && !args.hash) return { ok: false, error: 'Missing --height or --hash' };
  const chain = args.chain || 'ethereum';
  const url = chain === 'solana' ? `https://api.mainnet-beta.solana.com` : `https://mainnet.infura.io/v1/jsonrpc`;
  // Simplified: return mock data
  return {
    ok: true,
    height: args.height || 123456,
    hash: args.hash || '0x...',
    timestamp: Date.now(),
    transactions: [],
  };
}

export async function getTransaction(args = {}) {
  if (!args.hash) return { ok: false, error: 'Missing --hash' };
  const chain = args.chain || 'ethereum';
  // Mock data
  return {
    ok: true,
    hash: args.hash,
    from: '0xfrom',
    to: '0xto',
    value: 1.23,
    fee: 0.001,
  };
}

export async function getBalance(args = {}) {
  if (!args.address) return { ok: false, error: 'Missing --address' };
  const chain = args.chain || 'ethereum';
  // Mock data
  return {
    ok: true,
    address: args.address,
    chain,
    balance: 1.23,
  };
}

export async function getBlockHeight(args = {}) {
  const chain = args.chain || 'ethereum';
  // Mock data
  return { ok: true, chain, height: 123456 };
}

export async function getTransactions(args = {}) {
  const chain = args.chain || 'ethereum';
  const address = args.address;
  if (!address) return { ok: false, error: 'Missing --address' };
  // Mock data
  return {
    ok: true,
    chain,
    address,
    transactions: [
      { hash: '0x...', from: address, to: '0x...', value: 1.23 },
      { hash: '0x...', from: '0x...', to: address, value: 0.5 },
    ],
  };
}