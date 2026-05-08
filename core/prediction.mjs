import { createLogger } from './logger.mjs';
import { getCache } from './cache.mjs';
import { getBreaker } from './circuit-breaker.mjs';
import { bus } from './events.mjs';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KEYWORDS   = JSON.parse(readFileSync(join(__dirname, '../config/keywords.json'), 'utf8'));
const THRESHOLDS = JSON.parse(readFileSync(join(__dirname, '../config/thresholds.json'), 'utf8'));

const log     = createLogger('prediction');
const cache   = getCache('prediction', { defaultTtlMs: 30_000 });
const breaker = getBreaker('prediction-engine', { threshold: 5, timeoutMs: 60_000 });

function safeNum(v, fallback = 0) {
  const n = Number(v);
  return isFinite(n) ? n : fallback;
}

function clamp(v, lo = 0, hi = 1) {
  return Math.min(Math.max(safeNum(v, lo), lo), hi);
}

const EDGE_TIERS = [
  { min: 80, label: 'exceptional', desc: 'Exceptional edge — rare opportunity' },
  { min: 60, label: 'strong',      desc: 'Strong edge — high-confidence entry' },
  { min: 40, label: 'moderate',    desc: 'Moderate edge — cautious entry' },
  { min: 0,  label: 'weak',        desc: 'Weak edge — avoid or monitor only' },
];

function getEdgeTier(edgeScore100) {
  for (const t of EDGE_TIERS) {
    if (edgeScore100 >= t.min) return { label: t.label, desc: t.desc };
  }
  return { label: 'none', desc: 'No measurable edge' };
}

export class JellyPredictor {
  constructor(opts = {}) {
    this._chains  = opts.chains  ?? ['solana', 'bnb', 'polygon', 'base', 'ethereum'];
    this._verbose = opts.verbose ?? false;
    this._sentimentHook = opts.sentimentHook ?? null;
  }

  setSentimentHook(fn) {
    if (typeof fn !== 'function') throw new TypeError('sentimentHook must be a function');
    this._sentimentHook = fn;
  }

  async predict(input) {
    const cacheKey = `pred:${JSON.stringify(input)}`;
    const cached = cache.get(cacheKey);
    if (cached) { log.debug('cache hit', { key: cacheKey }); return cached; }

    return breaker.call(async () => {
      const signal = this._scoreKeywords(input.text ?? input.keyword ?? '');

      let externalSentiment = null;
      if (this._sentimentHook) {
        try { externalSentiment = await this._sentimentHook(input); } catch {}
      }

      const divergence  = this._computeMarketDivergence(input);
      const confidence  = this._computeConfidence(input, signal, externalSentiment, divergence);
      const riskScore   = this._computeRisk(input);
      const edgeScore   = this._computeEdgeScore(confidence, riskScore);
      const edgeInfo    = getEdgeTier(edgeScore);
      const jellyScore  = Math.round(clamp(confidence) * 100);

      const result = {
        ok:           true,
        signal:       signal.direction,
        jellyScore,
        confidence:   parseFloat(clamp(confidence).toFixed(4)),
        riskScore:    parseFloat(clamp(riskScore).toFixed(4)),
        edgeScore,
        edgeTier:     edgeInfo.label,
        edgeDesc:     edgeInfo.desc,
        divergence,
        factors:      signal.factors,
        suggestion:   this._suggest(jellyScore, edgeScore, edgeInfo, input.side),
        chain:        input.chain ?? 'unknown',
        market:       input.market ?? null,
        sentimentUsed: externalSentiment != null,
        ts:           Date.now(),
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

    const total     = bullCount + bearCount;
    const direction = total === 0 ? 'neutral' : (bullCount > bearCount ? 'bullish' : 'bearish');
    const strength  = total === 0 ? 0 : Math.abs(bullCount - bearCount) / total;
    return { direction, strength, bullCount, bearCount, factors, highPriority: highPri };
  }

  _computeConfidence(input, signal, externalSentiment, divergence) {
    let conf = 0.5;

    conf += signal.strength * 0.30;

    const vm = safeNum(input.volumeMultiplier);
    const spikeThreshold = safeNum(THRESHOLDS.volume?.spikeMultiplier, 3);
    if (vm >= spikeThreshold) {
      const anomalyBoost = Math.min((vm / spikeThreshold - 1) * 0.05, 0.12);
      conf += 0.08 + anomalyBoost;
    }

    const tvl = safeNum(input.tvlChangePct);
    if (Math.abs(tvl) >= safeNum(THRESHOLDS.tvl?.shockPct, 20)) conf += 0.10;

    if (input.whaleActivity) conf += 0.05;

    const mp = safeNum(input.marketPrice, -1);
    if (mp >= 0 && mp <= 1) {
      conf += Math.abs(mp - 0.5) * 0.05;
    }

    if (divergence && divergence.significant) {
      conf += clamp(safeNum(divergence.spread, 0), 0, 0.30) * 0.20;
    }

    if (externalSentiment != null) {
      const s = clamp(safeNum(externalSentiment));
      conf = conf * 0.85 + s * 0.15;
    }

    return clamp(conf);
  }

  _computeRisk(input) {
    let risk = 0.3;
    const lev = safeNum(input.leverage, 0);
    if (lev > 2) risk += 0.1 * (lev - 2);
    if (input.newToken) risk += 0.2;
    if (input.lowLiquidity) risk += 0.15;
    if (input.unauditedContract) risk += 0.2;
    if (input.highVolatility) risk += 0.1;
    return clamp(risk);
  }

  _computeEdgeScore(confidence, riskScore) {
    const inverseRisk = 1 - clamp(riskScore);
    const raw = clamp(confidence) * inverseRisk;
    return Math.round(raw * 100);
  }

  _computeMarketDivergence(input) {
    const prices = input.platformPrices;
    if (!prices || typeof prices !== 'object') return null;

    const vals = Object.values(prices).map(v => safeNum(v, -1)).filter(v => v >= 0 && v <= 1);
    if (vals.length < 2) return null;

    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const spread = parseFloat((max - min).toFixed(4));

    const mispricingMin = safeNum(THRESHOLDS.prediction_markets?.priceMispricingMin, 0.05);
    const maxSpreadPct  = safeNum(THRESHOLDS.prediction_markets?.maxSpreadPct, 3) / 100;

    return {
      spread,
      min: parseFloat(min.toFixed(4)),
      max: parseFloat(max.toFixed(4)),
      significant: spread >= mispricingMin,
      arb: spread >= maxSpreadPct,
      platforms: Object.keys(prices),
    };
  }

  _suggest(jellyScore, edgeScore, edgeInfo, side) {
    const sideLabel = side ?? 'YES';
    if (jellyScore >= 80) {
      if (edgeScore >= 60) return `${edgeInfo.desc} (edge ${edgeScore}/100) — full position on ${sideLabel}.`;
      return `Strong signal (Jelly ${jellyScore}) — full position size on ${sideLabel}.`;
    }
    if (jellyScore >= 60) {
      if (edgeScore >= 40) return `Moderate signal + edge ${edgeScore}/100 — half position on ${sideLabel}.`;
      return `Moderate signal (Jelly ${jellyScore}) — half position size on ${sideLabel}.`;
    }
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
