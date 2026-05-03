import { JellyPredictor } from '../../../core/prediction.mjs';
import { incMetric }      from '../../../core/metrics.mjs';
import { audit }          from '../../../core/audit.mjs';

const predictor = new JellyPredictor();

export async function predict(args = {}) {
  incMetric('market.predict');
  const result = await predictor.predict({
    text:    args.text ?? args.keyword ?? '',
    chain:   args.chain,
    market:  args.market,
    side:    args.side,
    leverage: args.leverage ? Number(args.leverage) : undefined,
    newToken:          args.newToken          === true,
    lowLiquidity:      args.lowLiquidity      === true,
    unauditedContract: args.unauditedContract === true,
  });
  audit.prediction({ args, result });
  return result;
}

export async function batchPredict(args = {}) {
  if (!args.inputs) return { ok: false, error: 'Missing --inputs JSON array' };
  let inputs;
  try { inputs = JSON.parse(args.inputs); } catch { return { ok: false, error: 'Invalid --inputs JSON' }; }
  return { ok: true, results: await predictor.batchPredict(inputs) };
}

export async function scoreMarket(args = {}) {
  const market = {
    id:          args.id,
    question:    args.question ?? '',
    description: args.description ?? '',
    category:    args.category ?? '',
    chain:       args.chain,
  };
  return predictor.scoreMarket(market);
}
