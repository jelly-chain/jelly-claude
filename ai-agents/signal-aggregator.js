import { metrics }      from '../core/metrics.mjs';
import { audit }        from '../core/audit.mjs';
import { createLogger } from '../core/logger.mjs';

const log = createLogger('signal-aggregator');

export class SignalAggregatorAgent {
  constructor(opts = {}) {
    this._signals = [];
    this._weights = opts.weights || { predictor: 1, scanner: 0.8, arbitrage: 1.2 };
    this._threshold = opts.threshold ?? 0.6;
  }

  async execute(input, memory) {
    const t = metrics.startTimer('signal-aggregator.execute');
    metrics.incMetric('signal_aggregator.calls');

    const { action } = input;

    switch (action) {
      case 'add':
        return this.addSignal(input.signal, memory);
      case 'score':
        return this.calculateScore(memory);
      case 'top':
        return this.getTopSignals(input.n ?? 5, memory);
      case 'clear':
        return this.clear();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  addSignal(signal, memory) {
    if (!signal || !signal.source || signal.score === undefined) {
      throw new Error('Signal must have source and score');
    }

    const weighted = {
      ...signal,
      weightedScore: signal.score * (this._weights[signal.source] || 1),
    };

    this._signals.push(weighted);

    if (memory) {
      memory.history.push({ type: 'signal_added', ...weighted });
    }

    audit.signal({ type: 'added', signal: weighted });
    return { added: true, weightedScore: weighted.weightedScore };
  }

  calculateScore(memory) {
    if (this._signals.length === 0) {
      return { average: 0, count: 0, top: [] };
    }

    const total = this._signals.reduce((sum, s) => sum + s.weightedScore, 0);
    const average = total / this._signals.length;

    const result = {
      average,
      count: this._signals.length,
      top: [...this._signals].sort((a, b) => b.weightedScore - a.weightedScore).slice(0, 5),
      threshold: this._threshold,
      actionable: average > this._threshold,
    };

    if (memory) {
      memory.history.push({ type: 'signal_scored', ...result });
    }

    log.info('SignalAggregatorAgent: score calculated', { average, actionable: result.actionable });
    return result;
  }

  getTopSignals(n, memory) {
    const sorted = [...this._signals].sort((a, b) => b.weightedScore - a.weightedScore).slice(0, n);

    if (memory) {
      memory.history.push({ type: 'signals_queried', count: sorted.length });
    }

    return sorted;
  }

  clear() {
    const count = this._signals.length;
    this._signals = [];
    return { cleared: count };
  }
}

export default SignalAggregatorAgent;