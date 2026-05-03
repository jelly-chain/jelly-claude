import { getKeywordTrigger, getThresholdTrigger } from '../../../core/signals.mjs';
import { incMetric } from '../../../core/metrics.mjs';

export async function signals(args = {}) {
  incMetric('market.signals');
  const { SignalHunterAgent } = await import('../../../ai-agents/signal-hunter.js');
  const hunter = new SignalHunterAgent({ minScore: args.minScore ? Number(args.minScore) : 60 });
  return hunter.execute({ texts: args.texts ? args.texts.split(',') : [] });
}

export async function scanKeywords(args = {}) {
  if (!args.text) return { ok: false, error: 'Missing --text' };
  const trigger = getKeywordTrigger();
  return trigger.evaluate(args.text, { chain: args.chain, market: args.market });
}

export async function scanThresholds(args = {}) {
  const trigger = getThresholdTrigger();
  return trigger.evaluate({
    volumeMultiplier: args.volumeMultiplier ? Number(args.volumeMultiplier) : 0,
    tvlChangePct:     args.tvlChangePct     ? Number(args.tvlChangePct)     : 0,
    priceChangePct:   args.priceChangePct   ? Number(args.priceChangePct)   : 0,
  }, { chain: args.chain });
}
