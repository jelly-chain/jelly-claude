import { metrics }      from '../core/metrics.mjs';
import { audit }        from '../core/audit.mjs';
import { createLogger } from '../core/logger.mjs';

const log = createLogger('portfolio-drift-detector');

export class PortfolioDriftDetectorAgent {
  constructor(opts = {}) {
    this._targets = opts.targets || {};
    this._threshold = opts.threshold ?? 0.05;
  }

  async execute(input, memory) {
    const t = metrics.startTimer('portfolio-drift-detector.execute');
    metrics.incMetric('portfolio_drift.calls');

    const { action } = input;

    switch (action) {
      case 'check':
        return this.checkDrift(input.positions, memory);
      case 'set_targets':
        return this.setTargets(input.targets, memory);
      case 'rebalance_suggestion':
        return this.rebalanceSuggestion(input.positions, memory);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  setTargets(targets, memory) {
    this._targets = targets;

    if (memory) {
      memory.history.push({ type: 'targets_set', targets });
    }

    return { targets, set: true };
  }

  checkDrift(positions, memory) {
    if (!positions) {
      throw new Error('Positions required for drift check');
    }

    const results = [];
    let totalDrift = 0;

    for (const [chain, tokens] of Object.entries(positions)) {
      for (const [token, data] of Object.entries(tokens)) {
        const target = this._targets[token];
        if (target) {
          const current = data.percentage || 0;
          const drift = Math.abs(current - target);
          totalDrift += drift;

          if (drift > this._threshold) {
            results.push({
              token,
              chain,
              target,
              current,
              drift,
              action: current < target ? 'buy' : 'sell',
            });
          }
        }
      }
    }

    const avgDrift = totalDrift / Object.keys(positions).length;
    const result = { results, avgDrift, threshold: this._threshold };

    audit.portfolioDrift(result);

    if (memory) {
      memory.history.push({ type: 'drift_check', ...result });
    }

    return result;
  }

  async rebalanceSuggestion(positions, memory) {
    const drift = await this.checkDrift(positions, memory);

    const suggestions = drift.results.map(r => ({
      token: r.token,
      chain: r.chain,
      action: r.action,
      amount: Math.abs(r.target - r.current) * 0.5,
    }));

    return { shouldRebalance: suggestions.length > 0, suggestions };
  }
}

export default PortfolioDriftDetectorAgent;