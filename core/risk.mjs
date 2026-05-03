import { createLogger } from './logger.mjs';
import { bus } from './events.mjs';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROFILES  = JSON.parse(readFileSync(join(__dirname, '../config/risk-profiles.json'), 'utf8'));
const STRATEGIES = JSON.parse(readFileSync(join(__dirname, '../config/strategies.json'), 'utf8'));

const log = createLogger('risk');

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
    const { jellyScore = 0, confidence = 0, riskScore = 1 } = prediction;

    const checks = {
      jellyScoreOk:  jellyScore  >= this._config.jellyScoreMin,
      confidenceOk:  confidence  >= this._config.confidenceMin,
      riskScoreOk:   riskScore   <= this._config.riskScoreMax,
      leverageOk:    !tradeParams.leverage || tradeParams.leverage <= this._config.maxLeverage,
    };

    const passed = Object.values(checks).every(Boolean);
    const sizePct = this._computeSize(jellyScore, tradeParams);

    const assessment = {
      ok:         passed,
      profile:    this._profile,
      jellyScore,
      sizePct,
      maxPositionPct: this._config.maxPositionPct,
      checks,
      stopLossPct:    this._config.stopLossPct,
      takeProfitPct:  this._config.takeProfitPct,
      reason:     passed ? 'All risk checks passed' : this._failReason(checks),
    };

    if (!passed) bus.risk({ type: 'blocked', assessment });
    log.info('RiskAssessor.assess', assessment);
    return assessment;
  }

  _computeSize(jellyScore, tradeParams) {
    const rules = STRATEGIES.jellyScore;
    let pct = 0;
    if (jellyScore >= rules.fullSize.min) pct = rules.fullSize.sizePct;
    else if (jellyScore >= rules.halfSize.min) pct = rules.halfSize.sizePct;
    return Math.min(pct, this._config.maxPositionPct * (pct / 100) * 20);
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
      if (factors[key] != null) {
        total += factors[key] * weight;
        weightUsed += weight;
      }
    }

    const raw = weightUsed > 0 ? total / weightUsed : 0;
    const confidence = Math.min(Math.max(raw, 0), 1);
    const jellyScore = Math.round(confidence * 100);

    return { confidence: parseFloat(confidence.toFixed(4)), jellyScore, factors, weights: this._weights };
  }

  fromPrediction(prediction) {
    return {
      confidence: prediction.confidence,
      jellyScore: prediction.jellyScore,
      signal:     prediction.signal,
      riskScore:  prediction.riskScore,
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
