import { httpJson }   from '../../../core/http.mjs';
import { getCache }   from '../../../core/cache.mjs';
import { getBreaker } from '../../../core/circuit-breaker.mjs';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_BASE = 'https://api.helius.xyz/v0';

const heliusCache = getCache('helius', { defaultTtlMs: 300_000 });
const heliusBreaker = getBreaker('helius', { threshold: 5 });

async function fetchHelius(path) {
  if (!HELIUS_API_KEY) {
    throw new Error('HELIUS_API_KEY is not set');
  }
  const key = `helius:${path}`;
  const cached = heliusCache.get(key);
  if (cached) return cached;
  const url = `${HELIUS_BASE}${path}?api-key=${HELIUS_API_KEY}`;
  const res = await httpJson(url);
  if (res.ok) {
    heliusCache.set(key, res.data);
    return res.data;
  }
  return null;
}

export async function getSolanaTransactions(args = {}) {
  const address = args.address;
  if (!address) return { ok: false, error: 'Address is required' };
  const data = await fetchHelius(`/addresses/${address}/transactions`);
  if (!data) return { ok: false, error: 'Could not fetch transactions' };
  return { ok: true, address, transactions: data };
}

export async function getSolanaTokenHoldings(args = {}) {
  const address = args.address;
  if (!address) return { ok: false, error: 'Address is required' };
  const data = await fetchHelius(`/addresses/${address}/tokens`);
  if (!data) return { ok: false, error: 'Could not fetch token holdings' };
  return { ok: true, address, tokenHoldings: data };
}

export async function getSolanaAddressInfo(args = {}) {
  const address = args.address;
  if (!address) return { ok: false, error: 'Address is required' };
  const data = await fetchHelius(`/addresses/${address}`);
  if (!data) return { ok: false, error: 'Could not fetch address info' };
  return { ok: true, address, info: data };
}