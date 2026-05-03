import { httpJson }    from '../core/http.mjs';
import { metrics }     from '../core/metrics.mjs';
import { audit }       from '../core/audit.mjs';
import { bus }         from '../core/events.mjs';
import { createLogger } from '../core/logger.mjs';
import { getCache }    from '../core/cache.mjs';
import { getBreaker }  from '../core/circuit-breaker.mjs';

const log     = createLogger('arbitrage-agent');
const cache   = getCache('arbitrage', { defaultTtlMs: 10_000 });
const breaker = getBreaker('prediction-market-apis', { threshold: 5 });

const POLYMARKET = 'https://gamma-api.polymarket.com';
const KALSHI     = 'https://trading-api.kalshi.com/trade-api/v2';
const PREDICTFUN = 'https://api.predict.fun';

export class ArbitrageAgent {
  constructor(opts = {}) {
    this._minGap    = opts.minGap    ?? 0.05;
    this._platforms = opts.platforms ?? ['polymarket', 'kalshi', 'predictfun'];
  }

  async execute(input = {}, memory) {
    const t = metrics.startTimer('arbitrage.execute');
    metrics.incMetric('arbitrage.calls');

    const [poly, pred] = await Promise.allSettled([
      this._fetchPolymarkets(input.query),
      this._fetchPredictFunMarkets(input.query),
    ]);

    const gaps = this._findGaps(
      poly.value ?? [],
      pred.value ?? [],
    );

    const opportunities = gaps.filter(g => g.gap >= this._minGap);

    const result = {
      ok: true,
      scanned: (poly.value?.length ?? 0) + (pred.value?.length ?? 0),
      opportunities: opportunities.length,
      topOpportunities: opportunities.slice(0, 5),
      ts: Date.now(),
    };

    if (opportunities.length > 0) {
      bus.signal({ type: 'arbitrage', opportunities });
      audit.write({ type: 'arbitrage_found', count: opportunities.length });
      log.info('ArbitrageAgent: opportunities found', { count: opportunities.length });
    }

    if (memory) {
      await memory.set('lastArbitrage', result);
      memory.history.push({ type: 'arbitrage', opportunities: opportunities.length });
    }

    t.end({ agent: 'arbitrage' });
    return result;
  }

  _findGaps(polyMarkets, predMarkets) {
    const gaps = [];
    for (const pm of polyMarkets) {
      for (const pfm of predMarkets) {
        if (!this._sameEvent(pm, pfm)) continue;
        const gap = Math.abs((pm.bestBid ?? 0.5) - (pfm.bestBid ?? 0.5));
        if (gap >= this._minGap) {
          gaps.push({
            event:     pm.question,
            polyPrice: pm.bestBid,
            predPrice: pfm.bestBid,
            gap:       parseFloat(gap.toFixed(4)),
            direction: pm.bestBid > pfm.bestBid ? 'buy_predictfun_sell_poly' : 'buy_poly_sell_predictfun',
            poly:      pm,
            pred:      pfm,
          });
        }
      }
    }
    return gaps.sort((a, b) => b.gap - a.gap);
  }

  _sameEvent(a, b) {
    const normalize = s => (s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const aWords = normalize(a.question).slice(0, 20);
    const bWords = normalize(b.question).slice(0, 20);
    if (aWords.length < 5 || bWords.length < 5) return false;
    let matches = 0;
    for (let i = 0; i < Math.min(aWords.length, bWords.length, 10); i++) {
      if (aWords[i] === bWords[i]) matches++;
    }
    return matches >= 5;
  }

  async _fetchPolymarkets(query) {
    return breaker.call(async () => {
      const key = `poly:${query ?? 'top'}`;
      const c = cache.get(key);
      if (c) return c;
      const r = await httpJson(`${POLYMARKET}/markets?closed=false&limit=100`);
      const markets = (r.data?.data ?? r.data ?? []).slice(0, 50);
      cache.set(key, markets);
      return markets;
    }).catch(() => []);
  }

  async _fetchPredictFunMarkets(query) {
    return breaker.call(async () => {
      const key = `pred:${query ?? 'top'}`;
      const c = cache.get(key);
      if (c) return c;
      const r = await httpJson(`${PREDICTFUN}/markets?status=active&limit=100`);
      const markets = (r.data?.markets ?? r.data ?? []).slice(0, 50);
      cache.set(key, markets);
      return markets;
    }).catch(() => []);
  }
}

export default ArbitrageAgent;
