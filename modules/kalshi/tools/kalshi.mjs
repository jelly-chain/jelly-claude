import { httpJson }   from '../../../core/http.mjs';
import { getCache }   from '../../../core/cache.mjs';
import { getBreaker } from '../../../core/circuit-breaker.mjs';
import { createLogger } from '../../../core/logger.mjs';

const cache = getCache('kalshi', { defaultTtlMs: 60_000 });
const breaker = getBreaker('kalshi-apis', { threshold: 5 });
const log = createLogger('kalshi-module');

const KALS_HI_API = 'https://trading-api.kalshi.com/trade-api/v2';

/**
 * Get active Kalshi markets.
 */
export async function markets(args = {}) {
  const url = `${KALS_HI_API}/markets?limit=50${args.query ? '&search=' + encodeURIComponent(args.query) : ''}`;
  const r = await breaker.call(async () => {
    const key = `kalshi:markets:${args.query ?? ''}`;
    const c = cache.get(key);
    if (c) return c;
    const res = await httpJson(url);
    const data = res.data?.markets ?? res.data ?? [];
    cache.set(key, data);
    return data;
  }).catch(() => []);
  return { ok: true, count: r.length, markets: r.slice(0, args.limit ? Number(args.limit) : 20) };
}

/**
 * Get market details by ID.
 */
export async function market(args = {}) {
  if (!args.id) return { ok: false, error: 'Missing --id' };
  const url = `${KALS_HI_API}/markets/${args.id}`;
  const r = await breaker.call(async () => {
    const key = `kalshi:market:${args.id}`;
    const c = cache.get(key);
    if (c) return c;
    const res = await httpJson(url);
    const data = res.data;
    cache.set(key, data);
    return data;
  }).catch(() => null);
  if (!r) return { ok: false, error: 'Market not found' };
  return { ok: true, market: r };
}

/**
 * Place a trade on Kalshi.
 */
export async function trade(args = {}) {
  if (!args.marketId) return { ok: false, error: 'Missing --marketId' };
  if (!args.position) return { ok: false, error: 'Missing --position (YES/NO)' };
  if (!args.amount) return { ok: false, error: 'Missing --amount' };

  // In a real implementation, this would call the Kalshi API
  // For now, simulate the trade
  return {
    ok: true,
    marketId: args.marketId,
    position: args.position,
    amount: args.amount,
    message: `Simulated trade on Kalshi: ${args.amount} USDC on ${args.position}`,
  };
}

/**
 * Get user's Kalshi portfolio.
 */
export async function portfolio(args = {}) {
  // In a real implementation, this would fetch from Kalshi API
  // For now, return mock data
  return {
    ok: true,
    usdcBalance: 1000,
    positions: [],
    totalValue: 1000,
  };
}

/**
 * Get resolved markets.
 */
export async function resolved(args = {}) {
  const url = `${KALS_HI_API}/markets?status=resolved&limit=50${args.query ? '&search=' + encodeURIComponent(args.query) : ''}`;
  const r = await breaker.call(async () => {
    const key = `kalshi:resolved:${args.query ?? ''}`;
    const c = cache.get(key);
    if (c) return c;
    const res = await httpJson(url);
    const data = res.data?.markets ?? res.data ?? [];
    cache.set(key, data);
    return data;
  }).catch(() => []);
  return { ok: true, count: r.length, markets: r.slice(0, args.limit ? Number(args.limit) : 20) };
}

/**
 * Compare market prices across platforms.
 */
export async function compareMarkets(args = {}) {
  if (!args.query) return { ok: false, error: 'Missing --query' };

  // Mock comparison
  return {
    ok: true,
    query: args.query,
    markets: [
      { platform: 'kalshi', price: 0.62, volume: 1000000 },
      { platform: 'polymarket', price: 0.58, volume: 500000 },
      { platform: 'predict_fun', price: 0.55, volume: 200000 },
    ],
    spread: 0.07,
    arbitrageOpportunity: true,
  };
}

/**
 * Detect arbitrage opportunities.
 */
export async function arbitrage(args = {}) {
  const query = args.query ?? 'BTC';
  // Simulated opportunity
  return {
    ok: true,
    query,
    opportunities: [
      {
        marketId: 'btc-2025',
        platform1: 'kalshi',
        price1: 0.62,
        platform2: 'polymarket',
        price2: 0.58,
        spread: 0.04,
        action: 'buy on polymarket, sell on kalshi',
        estimatedProfit: 0.03,
      },
    ],
  };
}

/**
 * Set a price alert for a Kalshi market.
 */
export async function setAlert(args = {}) {
  if (!args.marketId) return { ok: false, error: 'Missing --marketId' };
  if (!args.threshold) return { ok: false, error: 'Missing --threshold' };

  const alerts = await memory.get('kalshiAlerts') || [];
  const newAlert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    marketId: args.marketId,
    threshold: parseFloat(args.threshold),
    direction: args.direction || 'above',
    createdAt: Date.now(),
  };
  alerts.push(newAlert);
  await memory.set('kalshiAlerts', alerts);

  return { ok: true, message: 'Alert set', alertId: newAlert.id };
}

/**
 * Check active Kalshi alerts.
 */
export async function checkAlerts(args = {}) {
  const alerts = await memory.get('kalshiAlerts') || [];
  return { ok: true, count: alerts.length, alerts };
}

/**
 * Get prediction signal for given text.
 */
export async function predictSignal(args = {}) {
  if (!args.text) return { ok: false, error: 'Missing --text' };

  const { predict } = await import('../../../core/prediction.mjs');
  try {
    const prediction = await predict({
      text: args.text,
      chain: args.chain,
      market: args.market,
    });
    return { ok: true, prediction };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// Helper: get memory instance
const memory = await import('../../../memory/index.js').then(m => m.createMemory());