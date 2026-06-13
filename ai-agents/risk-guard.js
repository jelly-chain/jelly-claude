import { getRiskAssessor }   from '../core/risk.mjs';
import { metrics }           from '../core/metrics.mjs';
import { audit }             from '../core/audit.mjs';
import { bus }               from '../core/events.mjs';
import { createLogger }      from '../core/logger.mjs';

const log = createLogger('risk-guard');

export class RiskGuardAgent {
  constructor(opts = {}) {
    this._assessor    = getRiskAssessor({ profile: opts.profile ?? 'balanced' });
    this._hardLimits  = opts.hardLimits ?? {
      maxPositionUsd:  10_000,
      maxLeverage:     10,
      blacklistTokens: [],
    };
    this._blocked = 0;
    this._allowed = 0;
  }

  async execute(input, memory) {
    const t = metrics.startTimer('risk-guard.execute');
    metrics.incMetric('risk_guard.calls');

    const { prediction, tradeParams } = input;
    if (!prediction) throw new Error('RiskGuardAgent requires input.prediction');

    const hardCheck = this._checkHardLimits(tradeParams);
    if (!hardCheck.ok) {
      this._blocked++;
      metrics.incMetric('risk_guard.hard_blocked');
      bus.risk({ type: 'hard_block', reason: hardCheck.reason, tradeParams });
      audit.riskBlock({ reason: hardCheck.reason, type: 'hard', tradeParams });
      t.end();
      return { ok: false, blocked: true, reason: hardCheck.reason, type: 'hard_limit' };
    }

    const assessment = this._assessor.assess(prediction, tradeParams);

    if (!assessment.ok) {
      this._blocked++;
      metrics.incMetric('risk_guard.soft_blocked');
      audit.riskBlock({ reason: assessment.reason, type: 'soft', assessment });
      log.warn('RiskGuardAgent: trade blocked', { reason: assessment.reason, jellyScore: prediction.jellyScore });
      t.end();
      return { ok: false, blocked: true, ...assessment };
    }

    this._allowed++;
    metrics.incMetric('risk_guard.allowed');
    audit.write({ type: 'risk_allowed', assessment, tradeParams });
    log.info('RiskGuardAgent: trade allowed', { jellyScore: prediction.jellyScore, sizePct: assessment.sizePct });

    if (memory) {
      memory.history.push({ type: 'risk_check', ok: true, jellyScore: prediction.jellyScore });
    }

    t.end();
    return { ok: true, blocked: false, ...assessment };
  }

  _checkHardLimits(params = {}) {
    if (params.positionUsd > this._hardLimits.maxPositionUsd) {
      return { ok: false, reason: `Position $${params.positionUsd} exceeds hard limit $${this._hardLimits.maxPositionUsd}` };
    }
    if (params.leverage > this._hardLimits.maxLeverage) {
      return { ok: false, reason: `Leverage ${params.leverage}x exceeds hard limit ${this._hardLimits.maxLeverage}x` };
    }
    if (this._hardLimits.blacklistTokens.includes(params.token)) {
      return { ok: false, reason: `Token ${params.token} is blacklisted` };
    }
    return { ok: true };
  }

  setProfile(name) {
    this._assessor.setProfile(name);
    log.info('RiskGuardAgent: profile changed', { name });
    return this;
  }

  stats() {
    return { blocked: this._blocked, allowed: this._allowed, profile: this._assessor.currentProfile().name };
  }
}

export default RiskGuardAgent;
