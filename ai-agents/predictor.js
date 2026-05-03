import { predict }      from '../core/prediction.mjs';
import { assessTrade }  from '../core/risk.mjs';
import { audit }        from '../core/audit.mjs';
import { metrics }      from '../core/metrics.mjs';
import { createLogger } from '../core/logger.mjs';

const log = createLogger('predictor-agent');

export class PredictorAgent {
  constructor(opts = {}) {
    this._chains  = opts.chains  ?? ['solana', 'bnb', 'polygon', 'base'];
    this._profile = opts.profile ?? 'balanced';
  }

  async execute(input, memory) {
    const t = metrics.startTimer('predictor.execute');
    metrics.incMetric('predictor.calls');

    try {
      const prediction = await predict({
        text:    input.text ?? input,
        chain:   input.chain,
        market:  input.market,
        ...input,
      });

      const assessment = assessTrade(prediction, {
        leverage: input.leverage,
        profile:  this._profile,
      });

      const result = { prediction, assessment, agent: 'predictor', ts: Date.now() };

      if (memory) {
        await memory.set('lastPrediction', result);
        memory.history.push({ type: 'prediction', ...result });
      }

      audit.prediction({ input, result });
      log.info('PredictorAgent.execute', { jellyScore: prediction.jellyScore, ok: assessment.ok });
      return result;
    } catch (err) {
      metrics.incMetric('predictor.errors');
      audit.error({ agent: 'predictor', error: err.message });
      throw err;
    } finally {
      t.end({ agent: 'predictor' });
    }
  }

  async batchExecute(inputs, memory) {
    return Promise.all(inputs.map(i => this.execute(i, memory)));
  }

  async scoreMarkets(markets, memory) {
    const results = await this.batchExecute(
      markets.map(m => ({ text: `${m.question} ${m.description ?? ''}`, market: m.id, chain: m.chain })),
      memory,
    );
    return results.sort((a, b) => b.prediction.jellyScore - a.prediction.jellyScore);
  }
}

export default PredictorAgent;
