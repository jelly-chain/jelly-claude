/** Prompt builder — Polymarket market prediction context for Jelly Claude. */

import { MarketSignal } from '../schemas/market.js';
import { PolymarketMarket } from '../schemas/market.js';

export interface PolymarketPredictionInput {
  market: PolymarketMarket;
  signal: MarketSignal;
  question: string;
}

export function buildPolymarketPredictionPrompt(input: PolymarketPredictionInput): string {
  const { market, signal, question } = input;
  const probYes = (signal.impliedProbabilityYes * 100).toFixed(1);
  const probNo = (signal.impliedProbabilityNo * 100).toFixed(1);
  const imbalanceDir = signal.orderFlowImbalance > 0 ? 'bid-heavy' : signal.orderFlowImbalance < 0 ? 'ask-heavy' : 'balanced';

  return [
    '## Polymarket Prediction Context',
    '',
    `**Question**: ${question}`,
    `**Market**: ${market.question}`,
    `**Status**: ${market.status}`,
    `**Volume**: $${market.volumeUsd.toLocaleString()}`,
    `**Open Interest**: $${market.openInterest.toLocaleString()}`,
    '',
    '### Implied Probabilities',
    `- YES: ${probYes}%`,
    `- NO: ${probNo}%`,
    '',
    '### Signal',
    `- Direction: ${signal.signalDirection}`,
    `- Strength: ${signal.signalStrength}`,
    `- Order flow: ${imbalanceDir} (imbalance: ${signal.orderFlowImbalance.toFixed(3)})`,
    '',
    '### Resolution',
    `- End time: ${market.endTime}`,
    `- Source: ${market.resolutionSource ?? 'UMA oracle'}`,
    '',
    '> Probabilities are market-implied, not model predictions. Do not trade on this context alone.',
  ].join('\n');
}
