import { httpJson }   from '../../../core/http.mjs';
import { getCache }   from '../../../core/cache.mjs';
import { getBreaker } from '../../../core/circuit-breaker.mjs';

const cache   = getCache('defi', { defaultTtlMs: 120_000 });
const breaker = getBreaker('defi-apis', { threshold: 5 });
const LLAMA   = 'https://yields.llama.fi';
const JUPITER = 'https://quote-api.jup.ag/v6';
const JUP_PRICE = 'https://price.jup.ag/v4';

async function fetchWithCache(key, url, opts) {
  return breaker.call(async () => {
    const c = cache.get(key);
    if (c) return c;
    const r = await httpJson(url, opts);
    if (r.ok && r.data) cache.set(key, r.data);
    return r.ok ? r.data : null;
  }).catch(() => null);
}

export async function yields(args = {}) {
  const data = await fetchWithCache('yields:pools', `${LLAMA}/pools`);
  if (!data) return { ok: false, error: 'Could not fetch yield data' };

  let pools = data.data ?? data;
  if (args.chain) pools = pools.filter(p => (p.chain ?? '').toLowerCase() === args.chain.toLowerCase());
  if (args.token) pools = pools.filter(p => (p.symbol ?? '').toUpperCase().includes(args.token.toUpperCase()));
  if (args.minApy) pools = pools.filter(p => (p.apy ?? 0) >= Number(args.minApy));

  pools = pools.sort((a, b) => (b.apy ?? 0) - (a.apy ?? 0));
  const limit = args.limit ? Number(args.limit) : 10;

  return {
    ok: true, chain: args.chain ?? 'all', token: args.token ?? 'all',
    count: pools.length,
    topPools: pools.slice(0, limit).map(p => ({
      pool:     p.pool,
      project:  p.project,
      chain:    p.chain,
      symbol:   p.symbol,
      apy:      p.apy,
      tvlUsd:   p.tvlUsd,
    })),
  };
}

export async function pools(args = {}) {
  return yields({ ...args, minApy: args.minApy ?? 5 });
}

export async function jupiterQuote(args = {}) {
  if (!args.inputMint || !args.outputMint || !args.amount) {
    return { ok: false, error: 'Missing --inputMint, --outputMint, or --amount (lamports)' };
  }
  const url = `${JUPITER}/quote?inputMint=${args.inputMint}&outputMint=${args.outputMint}&amount=${args.amount}&slippageBps=${args.slippage ?? 50}`;
  const r = await httpJson(url);
  if (!r.ok) return { ok: false, error: `Jupiter API error: ${r.status}` };
  return { ok: true, quote: r.data };
}

export async function price(args = {}) {
  if (!args.ids) return { ok: false, error: 'Missing --ids (comma-separated mint addresses or symbols)' };
  const url = `${JUP_PRICE}/price?ids=${encodeURIComponent(args.ids)}`;
  const data = await fetchWithCache(`price:${args.ids}`, url);
  if (!data) return { ok: false, error: 'Could not fetch prices' };
  return { ok: true, prices: data.data ?? data };
}
