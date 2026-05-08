import { createLogger } from './logger.mjs';
import { bus } from './events.mjs';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROFILES   = JSON.parse(readFileSync(join(__dirname, '../config/risk-profiles.json'), 'utf8'));
const STRATEGIES = JSON.parse(readFileSync(join(__dirname, '../config/strategies.json'), 'utf8'));

const log = createLogger('risk');

function safeNum(v, fallback = 0) {
  const n = Number(v);
  return isFinite(n) ? n : fallback;
}

function clamp(v, lo = 0, hi = 1) {
  return Math.min(Math.max(safeNum(v, lo), lo), hi);
}

export class RiskAssessor {
  constructor(opts = {}) {
    this._profile = opts.profile ?? 'balanced';
    this._config  = PROFILES[this._profile] ?? PROFILES.balanced;
  }

  setProfile(name) {
    if (!PROFILES[name]) throw new Error(`Unknown risk profile: ${name}`);
    this._profile = name;
    this._config  = PROFILES[name];
    log.info('Risk profile changed', { profile: name });
  }

  assess(prediction, tradeParams = {}) {
    const jellyScore  = safeNum(prediction.jellyScore, 0);
    const confidence  = clamp(safeNum(prediction.confidence, 0));
    const riskScore   = clamp(safeNum(prediction.riskScore, 1));
    const leverage    = safeNum(tradeParams.leverage, 0);

    const checks = {
      jellyScoreOk:  jellyScore  >= safeNum(this._config.jellyScoreMin, 0),
      confidenceOk:  confidence  >= clamp(safeNum(this._config.confidenceMin, 0)),
      riskScoreOk:   riskScore   <= clamp(safeNum(this._config.riskScoreMax, 1)),
      leverageOk:    leverage === 0 || leverage <= safeNum(this._config.maxLeverage, Infinity),
    };

    const passed  = Object.values(checks).every(Boolean);
    const sizePct = this._computeSize(jellyScore, tradeParams);

    const assessment = {
      ok:             passed,
      profile:        this._profile,
      jellyScore,
      sizePct,
      maxPositionPct: safeNum(this._config.maxPositionPct, 5),
      checks,
      stopLossPct:    safeNum(this._config.stopLossPct, 40),
      takeProfitPct:  safeNum(this._config.takeProfitPct, 200),
      reason:         passed ? 'All risk checks passed' : this._failReason(checks),
    };

    if (!passed) bus.risk({ type: 'blocked', assessment });
    log.info('RiskAssessor.assess', assessment);
    return assessment;
  }

  _computeSize(jellyScore, tradeParams) {
    const rules  = STRATEGIES.jellyScore;
    const jelly  = safeNum(jellyScore, 0);
    let pct = 0;
    if (jelly >= safeNum(rules.fullSize?.min, 80)) pct = safeNum(rules.fullSize?.sizePct, 100);
    else if (jelly >= safeNum(rules.halfSize?.min, 60)) pct = safeNum(rules.halfSize?.sizePct, 50);

    const maxPosPct = safeNum(this._config.maxPositionPct, 5);
    const raw = maxPosPct * (pct / 100);
    return isFinite(raw) ? parseFloat(raw.toFixed(4)) : 0;
  }

  _failReason(checks) {
    const failed = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
    return `Failed checks: ${failed.join(', ')}`;
  }

  profiles() {
    return Object.keys(PROFILES);
  }

  currentProfile() {
    return { name: this._profile, config: this._config };
  }
}

export class ConfidenceEngine {
  constructor(opts = {}) {
    this._weights = opts.weights ?? {
      keyword:   0.30,
      volume:    0.20,
      tvl:       0.20,
      price:     0.15,
      whale:     0.10,
      sentiment: 0.05,
    };
  }

  score(factors = {}) {
    let total = 0;
    let weightUsed = 0;

    for (const [key, weight] of Object.entries(this._weights)) {
      const w = safeNum(weight, 0);
      if (factors[key] != null) {
        const f = clamp(safeNum(factors[key], 0));
        total += f * w;
        weightUsed += w;
      }
    }

    const raw        = weightUsed > 0 ? total / weightUsed : 0;
    const confidence = clamp(raw);
    const jellyScore = Math.round(confidence * 100);

    return { confidence: parseFloat(confidence.toFixed(4)), jellyScore, factors, weights: this._weights };
  }

  fromPrediction(prediction) {
    return {
      confidence: clamp(safeNum(prediction.confidence, 0)),
      jellyScore: safeNum(prediction.jellyScore, 0),
      signal:     prediction.signal,
      riskScore:  clamp(safeNum(prediction.riskScore, 0)),
    };
  }
}

let _assessor = null;
let _engine   = null;

export function getRiskAssessor(opts) {
  if (!_assessor) _assessor = new RiskAssessor(opts);
  return _assessor;
}

export function getConfidenceEngine(opts) {
  if (!_engine) _engine = new ConfidenceEngine(opts);
  return _engine;
}

export function assessTrade(prediction, tradeParams) {
  return getRiskAssessor().assess(prediction, tradeParams);
}

export default { RiskAssessor, ConfidenceEngine, getRiskAssessor, getConfidenceEngine, assessTrade };
