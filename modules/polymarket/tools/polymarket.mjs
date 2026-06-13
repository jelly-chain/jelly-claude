import { httpJson } from '../../../core/http.mjs';
import { getCache } from '../../../core/cache.mjs';
import { getBreaker } from '../../../core/circuit-breaker.mjs';
import { createLogger } from '../../../core/logger.mjs';

const cache = getCache('polymarket', { defaultTtlMs: 60_000 });
const breaker = getBreaker('polymarket-apis', { threshold: 5 });
const log = createLogger('polymarket-module');

const POLYMARKET_API = 'https://gamma-api.polymarket.com';

/**
 * Get active Polymarket markets.
 */
export async function markets(args = {}) {
  const url = `${POLYMARKET_API}/markets?limit=50${args.query ? '&search=' + encodeURIComponent(args.query) : ''}`;
  const r = await breaker.call(async () => {
    const key = `polymarket:markets:${args.query ?? ''}`;
    const c = cache.get(key);
    if (c) return c;
    const res = await httpJson(url);
    const data = res.data ?? [];
    cache.set(key, data);
    return data;
  }).catch(() => []);
  return { ok: true, count: r.length, markets: r.slice(0, args.limit ? Number(args.limit) : 20) };
}

/**
 * Get market details by condition ID.
 */
export async function market(args = {}) {
  if (!args.conditionId) return { ok: false, error: 'Missing --conditionId' };
  const url = `${POLYMARKET_API}/markets?condition_id=${args.conditionId}`;
  const r = await breaker.call(async () => {
    const key = `polymarket:market:${args.conditionId}`;
    const c = cache.get(key);
    if (c) return c;
    const res = await httpJson(url);
    const data = res.data?.[0] ?? null;
    cache.set(key, data);
    return data;
  }).catch(() => null);
  if (!r) return { ok: false, error: 'Market not found' };
  return { ok: true, market: r };
}

/**
 * Place a trade on Polymarket.
 */
export async function trade(args = {}) {
  if (!args.conditionId) return { ok: false, error: 'Missing --conditionId' };
  if (!args.outcome) return { ok: false, error: 'Missing --outcome (YES/NO)' };
  if (!args.amount) return { ok: false, error: 'Missing --amount' };

  return {
    ok: true,
    conditionId: args.conditionId,
    outcome: args.outcome,
    amount: args.amount,
    message: `Simulated trade on Polymarket: ${args.amount} on ${args.outcome}`,
  };
}

/**
 * Get user's Polymarket portfolio.
 */
export async function portfolio(args = {}) {
  return {
    ok: true,
    usdcBalance: 0,
    positions: [],
    totalValue: 0,
    message: 'Connect wallet to view live portfolio',
  };
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
      { platform: 'polymarket', price: 0.62, volume: 1000000 },
      { platform: 'kalshi', price: 0.58, volume: 500000 },
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
        platform1: 'polymarket',
        price1: 0.62,
        platform2: 'kalshi',
        price2: 0.58,
        spread: 0.04,
        action: 'buy on polymarket, sell on kalshi',
        estimatedProfit: 0.03,
      },
    ],
  };
}

/**
 * Set a price alert for a Polymarket market.
 */
export async function setAlert(args = {}) {
  if (!args.marketId) return { ok: false, error: 'Missing --marketId' };
  if (!args.threshold) return { ok: false, error: 'Missing --threshold' };

  const alerts = await memory.get('polymarketAlerts') || [];
  const newAlert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    marketId: args.marketId,
    threshold: parseFloat(args.threshold),
    direction: args.direction || 'above',
    createdAt: Date.now(),
  };
  alerts.push(newAlert);
  await memory.set('polymarketAlerts', alerts);

  return { ok: true, message: 'Alert set', alertId: newAlert.id };
}

/**
 * Check active Polymarket alerts.
 */
export async function checkAlerts(args = {}) {
  const alerts = await memory.get('polymarketAlerts') || [];
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