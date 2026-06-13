import { httpJson }        from '../../../core/http.mjs';
import { getCache }        from '../../../core/cache.mjs';
import { getBreaker }      from '../../../core/circuit-breaker.mjs';
import { predict }         from '../../../core/prediction.mjs';
import { ArbitrageAgent }  from '../../../ai-agents/arbitrage.js';

const cache   = getCache('pred-markets', { defaultTtlMs: 30_000 });
const breaker = getBreaker('pred-market-apis', { threshold: 5 });
const arbAgent = new ArbitrageAgent({ minGap: 0.05 });

const POLY_URL  = 'https://gamma-api.polymarket.com';
const PRED_URL  = 'https://api.predict.fun';

async function fetchPoly(params = '') {
  return breaker.call(async () => {
    const key = `poly:${params}`;
    const c = cache.get(key);
    if (c) return c;
    const r = await httpJson(`${POLY_URL}/markets?closed=false&limit=50${params}`);
    const data = r.data?.data ?? r.data ?? [];
    cache.set(key, data);
    return data;
  }).catch(() => []);
}

async function fetchPredFun(params = '') {
  return breaker.call(async () => {
    const key = `pred:${params}`;
    const c = cache.get(key);
    if (c) return c;
    const r = await httpJson(`${PRED_URL}/markets?status=active&limit=50${params}`);
    const data = r.data?.markets ?? r.data ?? [];
    cache.set(key, data);
    return data;
  }).catch(() => []);
}

export async function polymarkets(args = {}) {
  const markets = await fetchPoly(args.query ? `&search=${encodeURIComponent(args.query)}` : '');
  if (!markets.length) return { ok: false, error: 'No markets found or API unavailable' };

  const limit = args.limit ? Number(args.limit) : 10;
  const top = markets.slice(0, limit);

  const scored = await Promise.all(top.map(async m => {
    const pred = await predict({ text: m.question ?? m.title ?? '', market: m.id, chain: 'polygon' });
    return { ...m, jellyScore: pred.jellyScore, signal: pred.signal };
  }));

  return { ok: true, platform: 'polymarket', count: markets.length, markets: scored };
}

export async function kalshiMarkets(args = {}) {
  const apiKey = process.env.KALSHI_API_KEY;
  const result = await breaker.call(async () => {
    const key = `kalshi:${args.query ?? 'top'}`;
    const c = cache.get(key);
    if (c) return c;
    const headers = apiKey ? { Authorization: `Token ${apiKey}` } : {};
    const r = await httpJson(`https://trading-api.kalshi.com/trade-api/v2/markets?limit=50`, { headers });
    const data = r.data?.markets ?? [];
    cache.set(key, data);
    return data;
  }).catch(() => []);

  const limit = args.limit ? Number(args.limit) : 10;
  return { ok: true, platform: 'kalshi', count: result.length, markets: result.slice(0, limit) };
}

export async function predictFunMarkets(args = {}) {
  const markets = await fetchPredFun(args.query ? `&search=${encodeURIComponent(args.query)}` : '');
  const limit = args.limit ? Number(args.limit) : 10;
  return { ok: true, platform: 'predict.fun', count: markets.length, markets: markets.slice(0, limit) };
}

export async function compareMarkets(args = {}) {
  if (!args.query) return { ok: false, error: 'Missing --query (search term to compare across platforms)' };
  const [poly, pred] = await Promise.all([
    fetchPoly(`&search=${encodeURIComponent(args.query)}`),
    fetchPredFun(`&search=${encodeURIComponent(args.query)}`),
  ]);
  return {
    ok:         true,
    query:      args.query,
    polymarket: poly.slice(0, 5),
    predictFun: pred.slice(0, 5),
    note:       'Kalshi requires US eligibility — check manually at kalshi.com',
  };
}

export async function arbitrage(args = {}) {
  return arbAgent.execute({ query: args.query });
}

// Enhanced functions
export async function monitorPrices(args = {}) {
  if (!args.marketId) return { ok: false, error: 'Missing --marketId' };
  const [poly, pred] = await Promise.all([
    fetchPoly(`&ids=${args.marketId}`),
    fetchPredFun(`&ids=${args.marketId}`),
  ]);
  const polyMarket = poly.find(m => m.id === args.marketId);
  const predMarket = pred.find(m => m.id === args.marketId);

  const result = {
    ok: true,
    marketId: args.marketId,
    polymarket: polyMarket ? { price: polyMarket.latestPrice, volume: polyMarket.volume } : null,
    predictFun: predMarket ? { price: predMarket.latestPrice, volume: predMarket.volume } : null,
    spread: null,
  };

  if (polyMarket && predMarket) {
    const p1 = Number(polyMarket.latestPrice);
    const p2 = Number(predMarket.latestPrice);
    result.spread = Math.abs(p1 - p2);
    result.arbitrageOpportunity = result.spread > 0.03; // 3% spread
  }

  return result;
}

export async function setAlert(args = {}) {
  if (!args.marketId || !args.threshold) return { ok: false, error: 'Missing --marketId or --threshold' };
  const threshold = Number(args.threshold);
  const memory = await import('../../../../memory/index.js').then(m => m.createMemory());
  const alerts = await memory.get('priceAlerts') || [];
  alerts.push({ marketId: args.marketId, threshold, createdAt: Date.now() });
  await memory.set('priceAlerts', alerts);
  return { ok: true, message: `Alert set for market ${args.marketId} at ${threshold}` };
}

export async function checkAlerts(args = {}) {
  const memory = await import('../../../../memory/index.js').then(m => m.createMemory());
  const alerts = await memory.get('priceAlerts') || [];
  const current = await monitorPrices({ marketId: alerts[0]?.marketId });
  const triggered = alerts.filter(a => {
    const price = current[a.marketId]?.price;
    return price && Math.abs(price - a.threshold) > 0.01; // 1 cent difference
  });
  return { ok: true, alerts: triggered, current: current };
}
