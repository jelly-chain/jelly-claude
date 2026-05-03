import { createLogger } from './logger.mjs';
import { getCache } from './cache.mjs';
import { getBreaker } from './circuit-breaker.mjs';
import { bus } from './events.mjs';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEYWORDS = JSON.parse(readFileSync(join(__dirname, '../config/keywords.json'), 'utf8'));
const THRESHOLDS = JSON.parse(readFileSync(join(__dirname, '../config/thresholds.json'), 'utf8'));

const log     = createLogger('prediction');
const cache   = getCache('prediction', { defaultTtlMs: 30_000 });
const breaker = getBreaker('prediction-engine', { threshold: 5, timeoutMs: 60_000 });

export class JellyPredictor {
  constructor(opts = {}) {
    this._chains  = opts.chains  ?? ['solana', 'bnb', 'polygon', 'base', 'ethereum'];
    this._verbose = opts.verbose ?? false;
  }

  async predict(input) {
    const cacheKey = `pred:${JSON.stringify(input)}`;
    const cached = cache.get(cacheKey);
    if (cached) { log.debug('cache hit', { key: cacheKey }); return cached; }

    return breaker.call(async () => {
      const signal     = this._scoreKeywords(input.text ?? input.keyword ?? '');
      const confidence = this._computeConfidence(input, signal);
      const riskScore  = this._computeRisk(input);
      const jellyScore = Math.round(confidence * 100);

      const result = {
        ok:          true,
        signal:      signal.direction,
        jellyScore,
        confidence:  parseFloat(confidence.toFixed(4)),
        riskScore:   parseFloat(riskScore.toFixed(4)),
        factors:     signal.factors,
        suggestion:  this._suggest(jellyScore, input.side),
        chain:       input.chain ?? 'unknown',
        market:      input.market ?? null,
        ts:          Date.now(),
      };

      cache.set(cacheKey, result);
      bus.prediction(result);
      log.info('prediction', result);
      return result;
    });
  }

  async batchPredict(inputs) {
    return Promise.all(inputs.map(i => this.predict(i)));
  }

  async scoreMarket(market) {
    const text = [market.question, market.description, market.category].filter(Boolean).join(' ');
    return this.predict({ text, market: market.id, chain: market.chain });
  }

  _scoreKeywords(text = '') {
    const lower = text.toLowerCase();
    const factors = [];
    let bullCount = 0, bearCount = 0, highPri = false;

    for (const kw of KEYWORDS.highPriority) {
      if (lower.includes(kw)) { highPri = true; factors.push({ type: 'highPriority', keyword: kw, weight: -2 }); bearCount += 2; }
    }
    for (const kw of KEYWORDS.bullish) {
      if (lower.includes(kw)) { factors.push({ type: 'bullish', keyword: kw, weight: 1 }); bullCount++; }
    }
    for (const kw of KEYWORDS.bearish) {
      if (lower.includes(kw)) { factors.push({ type: 'bearish', keyword: kw, weight: -1 }); bearCount++; }
    }

    const total = bullCount + bearCount;
    const direction = total === 0 ? 'neutral' : (bullCount > bearCount ? 'bullish' : 'bearish');
    const strength  = total === 0 ? 0 : Math.abs(bullCount - bearCount) / total;
    return { direction, strength, bullCount, bearCount, factors, highPriority: highPri };
  }

  _computeConfidence(input, signal) {
    let conf = 0.5;
    conf += signal.strength * 0.3;
    if (input.volumeMultiplier && input.volumeMultiplier >= THRESHOLDS.volume.spikeMultiplier) conf += 0.1;
    if (input.tvlChangePct    && Math.abs(input.tvlChangePct) >= THRESHOLDS.tvl.shockPct) conf += 0.1;
    if (input.whaleActivity) conf += 0.05;
    if (input.marketPrice != null) {
      const extremity = Math.abs(input.marketPrice - 0.5);
      conf += extremity * 0.05;
    }
    return Math.min(Math.max(conf, 0), 1);
  }

  _computeRisk(input) {
    let risk = 0.3;
    if (input.leverage  && input.leverage  > 2) risk += 0.1 * (input.leverage  - 2);
    if (input.newToken) risk += 0.2;
    if (input.lowLiquidity) risk += 0.15;
    if (input.unauditedContract) risk += 0.2;
    if (input.highVolatility) risk += 0.1;
    return Math.min(Math.max(risk, 0), 1);
  }

  _suggest(jellyScore, side) {
    if (jellyScore >= 80) return `Strong signal — full position size on ${side ?? 'YES'}.`;
    if (jellyScore >= 60) return `Moderate signal — half position size on ${side ?? 'YES'}.`;
    return 'Weak signal — do not trade.';
  }
}

let _instance = null;
export function getPredictor(opts) {
  if (!_instance) _instance = new JellyPredictor(opts);
  return _instance;
}

export async function predict(input) {
  return getPredictor().predict(input);
}

export default { JellyPredictor, getPredictor, predict };
