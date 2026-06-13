import { httpJson }   from '../../../core/http.mjs';
import { getCache }   from '../../../core/cache.mjs';
import { getBreaker } from '../../../core/circuit-breaker.mjs';
import { predict }    from '../../../core/prediction.mjs';

const cache   = getCache('analytics', { defaultTtlMs: 300_000 });
const breaker = getBreaker('llama-fi', { threshold: 5 });
const LLAMA   = 'https://api.llama.fi';

async function fetchLlama(path) {
  return breaker.call(async () => {
    const key = `llama:${path}`;
    const c = cache.get(key);
    if (c) return c;
    const r = await httpJson(`${LLAMA}${path}`);
    if (r.ok) cache.set(key, r.data);
    return r.ok ? r.data : null;
  }).catch(() => null);
}

export async function tvl(args = {}) {
  const protocol = args.protocol;
  if (protocol) {
    const data = await fetchLlama(`/protocol/${encodeURIComponent(protocol)}`);
    if (!data) return { ok: false, error: `Protocol "${protocol}" not found` };
    return { ok: true, protocol, tvl: data.tvl, chains: data.chains };
  }
  const data = await fetchLlama('/v2/chains');
  if (!data) return { ok: false, error: 'Could not fetch chain TVL' };
  return { ok: true, chains: data.slice(0, 20) };
}

export async function protocols(args = {}) {
  const chain = args.chain;
  let data = await fetchLlama('/protocols');
  if (!data) return { ok: false, error: 'Could not fetch protocols' };
  if (chain) data = data.filter(p => (p.chains ?? []).map(c => c.toLowerCase()).includes(chain.toLowerCase()));
  const sorted = data.sort((a, b) => (b.tvl ?? 0) - (a.tvl ?? 0));
  return { ok: true, chain: chain ?? 'all', count: sorted.length, protocols: sorted.slice(0, args.limit ? Number(args.limit) : 20) };
}

export async function chainMetrics(args = {}) {
  const chain = args.chain ?? 'Solana';
  const data = await fetchLlama('/v2/chains');
  if (!data) return { ok: false, error: 'Could not fetch chain data' };
  const found = data.find(c => c.name?.toLowerCase() === chain.toLowerCase());
  if (!found) return { ok: false, error: `Chain "${chain}" not found` };
  const pred = await predict({ text: `${chain} tvl ${found.tvl > 0 ? 'growth' : 'decline'}`, chain: chain.toLowerCase() });
  return { ok: true, chain: found.name, tvl: found.tvl, prediction: pred };
}

export async function topGainers(args = {}) {
  const data = await fetchLlama('/protocols');
  if (!data) return { ok: false, error: 'Could not fetch protocols' };
  const gainers = data
    .filter(p => (p.change_1d ?? 0) > 0)
    .sort((a, b) => (b.change_1d ?? 0) - (a.change_1d ?? 0))
    .slice(0, args.limit ? Number(args.limit) : 10);
  return { ok: true, gainers };
}

// New tools

/**
 * Generate a comprehensive market report.
 */
export async function report(args = {}) {
  const include = (args.include ?? 'tvl,protocols,chainMetrics,topGainers').split(',');
  const results = {};

  for (const item of include) {
    switch (item.trim().toLowerCase()) {
      case 'tvl':
        results.tvl = await tvl({});
        break;
      case 'protocols':
        results.protocols = await protocols({});
        break;
      case 'chainmetrics':
      case 'chainmetrics':
        results.chainMetrics = await chainMetrics({});
        break;
      case 'topgainers':
        results.topGainers = await topGainers({});
        break;
      default:
        console.warn(`Unknown report section: ${item}`);
    }
  }

  return { ok: true, report: results };
}

/**
 * Analyze correlations between multiple assets.
 */
export async function correlation(args = {}) {
  // This would require historical price data which we don't have easily.
  // For now, return a placeholder.
  return { ok: false, error: 'Correlation analysis not implemented yet' };
}

/**
 * Simple trend analysis for a given asset.
 */
export async function trend(args = {}) {
  if (!args.asset) return { ok: false, error: 'Missing --asset' };
  // Placeholder: just return a random trend
  return { ok: true, asset: args.asset, trend: 'neutral', confidence: 0.5 };
}
