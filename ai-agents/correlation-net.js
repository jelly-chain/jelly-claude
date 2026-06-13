import { metrics }      from '../core/metrics.mjs';
import { audit }        from '../core/audit.mjs';
import { createLogger } from '../core/logger.mjs';
import { httpJson }     from '../core/rate-limiter.mjs';
import { getCache }     from '../core/cache.mjs';

const cache = getCache('correlation', { defaultTtlMs: 21_600_000 }); // 6h
const CG_ID_MAP = {
  BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', BNB: 'binancecoin',
  MATIC: 'matic-network', ARB: 'arbitrum', AVAX: 'avalanche-2',
  LINK: 'chainlink', UNI: 'uniswap', DOGE: 'dogecoin',
};

// Compute Pearson correlation between two arrays of equal length
function pearsonR(xs, ys) {
  const n = xs.length;
  if (n < 3) return { r: 0, pValue: 1, ci95: [0, 0], significant: false };
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
  const dx  = Math.sqrt(xs.reduce((s, x) => s + (x - mx) ** 2, 0));
  const dy  = Math.sqrt(ys.reduce((s, y) => s + (y - my) ** 2, 0));
  if (dx === 0 || dy === 0) return { r: 0, pValue: 1, ci95: [0, 0], significant: false };
  const r = parseFloat((num / (dx * dy)).toFixed(4));

  // t-statistic for significance test
  const t = r * Math.sqrt((n - 2) / (1 - r * r));
  // Approximate p-value using t-distribution (two-tailed)
  // For n > 30, t-distribution approaches normal
  const df = n - 2;
  const pValue = df > 30 ? 2 * (1 - normalCDF(Math.abs(t))) : approximateTTestPValue(t, df);

  // Fisher z-transformation for 95% confidence interval
  const z = 0.5 * Math.log((1 + r) / (1 - r));
  const se = 1 / Math.sqrt(n - 3);
  const zLower = z - 1.96 * se;
  const zUpper = z + 1.96 * se;
  const ci95 = [
    parseFloat(((Math.exp(2 * zLower) - 1) / (Math.exp(2 * zLower) + 1)).toFixed(4)),
    parseFloat(((Math.exp(2 * zUpper) - 1) / (Math.exp(2 * zUpper) + 1)).toFixed(4)),
  ];

  return { r, pValue: parseFloat(pValue.toFixed(6)), ci95, significant: pValue < 0.05 };
}

// Standard normal CDF approximation
function normalCDF(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327;
  const p = d * Math.exp(-x * x / 2) * (t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.8212560 + t * 1.3302744)))));
  return x > 0 ? 1 - p : p;
}

// Approximate t-test p-value for small samples
function approximateTTestPValue(t, df) {
  const x = df / (df + t * t);
  // Regularized incomplete beta function approximation
  return Math.min(1, Math.max(0, x * (0.5 + 0.5 * Math.tanh(t / 2))));
}

async function fetchDailyReturns(symbol, days = 30) {
  const cgId = CG_ID_MAP[symbol.toUpperCase()];
  if (!cgId) return null;
  const cacheKey = `returns:${symbol}:${days}`;
  return cache.getOrFetch(cacheKey, async () => {
    const r = await httpJson(
      `https://api.coingecko.com/api/v3/coins/${cgId}/market_chart?vs_currency=usd&days=${days}&interval=daily`,
      { timeoutMs: 12_000 }
    );
    if (!r.ok || !r.data?.prices) return null;
    const prices = r.data.prices.map(p => p[1]);
    // Compute log returns
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      if (prices[i - 1] > 0) returns.push(Math.log(prices[i] / prices[i - 1]));
    }
    return returns;
  }, 21_600_000);
}

const log = createLogger('correlation-net');

export class CorrelationNetAgent {
  constructor(opts = {}) {
    this._window = opts.window ?? 30;
    this._threshold = opts.threshold ?? 0.7;
  }

  async execute(input, memory) {
    const t = metrics.startTimer('correlation-net.execute');
    metrics.incMetric('correlation_net.calls');

    const { action } = input;

    switch (action) {
      case 'calculate':
        return this.calculateCorrelation(input.assets, memory);
      case 'matrix':
        return this.correlationMatrix(input.assets, memory);
      case 'hedge':
        return this.suggestHedge(input.position, input.target, memory);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  async calculateCorrelation(assets, memory) {
    if (!assets || assets.length < 2) {
      throw new Error('At least 2 assets required');
    }

    const [a, b] = assets;
    let correlation = 0;

    try {
      const [rA, rB] = await Promise.all([fetchDailyReturns(a, this._window), fetchDailyReturns(b, this._window)]);
      if (rA && rB && rA.length > 5 && rB.length > 5) {
        const len = Math.min(rA.length, rB.length);
        const stats = pearsonR(rA.slice(-len), rB.slice(-len));
        correlation = stats.r;
        result = {
          assets,
          correlation: stats.r,
          pValue: stats.pValue,
          confidenceInterval: stats.ci95,
          significant: stats.significant,
          dataPoints: len,
          strength: Math.abs(stats.r) > 0.8 ? 'strong' : Math.abs(stats.r) > 0.5 ? 'moderate' : 'weak',
          direction: stats.r > 0 ? 'positive' : stats.r < 0 ? 'negative' : 'neutral',
          window: this._window,
          source: 'coingecko_daily_returns',
        };
      } else {
        log.warn('Insufficient returns data for correlation, using 0', { a, b });
      }
    } catch (err) {
      log.warn('Correlation fetch failed', { error: err.message });
    }

    result = result ?? {
      assets,
      correlation: 0,
      pValue: 1,
      confidenceInterval: [0, 0],
      significant: false,
      dataPoints: 0,
      strength: 'weak',
      direction: 'neutral',
      window: this._window,
      source: 'coingecko_daily_returns',
    };

    if (typeof audit.correlationCalc === 'function') audit.correlationCalc(result);

    if (memory) {
      memory.history.push({ type: 'correlation', ...result });
    }

    return result;
  }

  async correlationMatrix(assets, memory) {
    const matrix = {};
    const returnsMap = {};

    // Fetch all returns in parallel
    await Promise.allSettled(assets.map(async a => {
      const r = await fetchDailyReturns(a, this._window);
      if (r) returnsMap[a] = r;
    }));

    for (const a of assets) {
      matrix[a] = {};
      for (const b of assets) {
        if (a === b) {
          matrix[a][b] = { r: 1, pValue: 0, significant: true };
        } else if (returnsMap[a] && returnsMap[b]) {
          const len = Math.min(returnsMap[a].length, returnsMap[b].length);
          const stats = pearsonR(returnsMap[a].slice(-len), returnsMap[b].slice(-len));
          matrix[a][b] = stats;
        } else {
          matrix[a][b] = null; // data unavailable
        }
      }
    }

    const result = { assets, matrix, timestamp: Date.now() };

    if (memory) {
      await memory.set('lastCorrelationMatrix', result);
    }

    return result;
  }

  async suggestHedge(position, target, memory) {
    const correlation = await this.calculateCorrelation([position, target], memory);

    const hedge = {
      position,
      target,
      correlation: correlation.correlation,
      hedgeRatio: this._threshold / correlation.correlation,
      action: correlation.correlation > this._threshold ? 'hedge' : 'monitor',
      amount: 0.5,
    };

    if (memory) {
      memory.history.push({ type: 'hedge_suggestion', ...hedge });
    }

    return hedge;
  }
}

export default CorrelationNetAgent;