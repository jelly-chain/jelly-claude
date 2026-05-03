import { predict }     from '../core/prediction.mjs';
import { assessTrade } from '../core/risk.mjs';
import { metrics }     from '../core/metrics.mjs';
import { audit }       from '../core/audit.mjs';
import { createLogger } from '../core/logger.mjs';

const log = createLogger('backtest-agent');

export class BacktestAgent {
  constructor(opts = {}) {
    this._profile  = opts.profile  ?? 'balanced';
    this._slippage = opts.slippage ?? 0.01;
    this._fees     = opts.fees     ?? 0.002;
  }

  async execute(input, memory) {
    const { scenarios, initialCapital = 10_000 } = input;
    if (!Array.isArray(scenarios) || scenarios.length === 0) {
      throw new Error('BacktestAgent requires input.scenarios[]');
    }

    const t = metrics.startTimer('backtest.execute');
    metrics.incMetric('backtest.calls');

    log.info('BacktestAgent: starting', { scenarios: scenarios.length, capital: initialCapital });

    let capital  = initialCapital;
    const trades = [];
    let wins = 0, losses = 0;

    for (const s of scenarios) {
      const prediction  = await predict({ text: s.signal ?? '', chain: s.chain, ...s });
      const assessment  = assessTrade(prediction, { profile: this._profile });

      if (!assessment.ok) {
        trades.push({ ...s, action: 'skip', reason: assessment.reason });
        continue;
      }

      const positionPct = assessment.sizePct / 100;
      const positionUsd = capital * positionPct * (this._profile === 'aggressive' ? 0.1 : 0.05);
      const netPnl      = positionUsd * (s.actualReturn ?? 0) - positionUsd * this._fees;

      capital += netPnl;
      if (netPnl >= 0) wins++; else losses++;

      trades.push({
        ...s,
        action:      'trade',
        jellyScore:  prediction.jellyScore,
        positionUsd: Math.round(positionUsd),
        pnl:         Math.round(netPnl * 100) / 100,
        capitalAfter: Math.round(capital * 100) / 100,
      });
    }

    const total      = wins + losses;
    const winRate    = total > 0 ? wins / total : 0;
    const totalPnl   = capital - initialCapital;
    const totalPnlPct = (totalPnl / initialCapital) * 100;

    const result = {
      ok:            true,
      scenarios:     scenarios.length,
      tradesExecuted: total,
      wins, losses,
      winRate:       parseFloat(winRate.toFixed(4)),
      initialCapital,
      finalCapital:  Math.round(capital * 100) / 100,
      totalPnl:      Math.round(totalPnl * 100) / 100,
      totalPnlPct:   parseFloat(totalPnlPct.toFixed(2)),
      trades,
    };

    audit.write({ type: 'backtest', result });
    if (memory) {
      await memory.set('lastBacktest', result);
      memory.history.push({ type: 'backtest', pnlPct: result.totalPnlPct });
    }

    t.end({ agent: 'backtest' });
    return result;
  }

  async quickTest(signal, chain, outcomes) {
    const scenarios = outcomes.map((actualReturn, i) => ({
      id: `scenario-${i}`, signal, chain, actualReturn,
    }));
    return this.execute({ scenarios, initialCapital: 10_000 }, null);
  }
}

export default BacktestAgent;
