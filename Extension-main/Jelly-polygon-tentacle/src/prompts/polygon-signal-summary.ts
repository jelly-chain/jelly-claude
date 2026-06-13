/** Prompt builder — Polygon signal summary for Jelly Claude. */

import { SignalBundle, VolatilityRegime } from '../schemas/signal.js';

export interface PolygonSignalSummaryInput {
  bundle: SignalBundle;
  question?: string;
}

export function buildPolygonSignalSummaryPrompt(input: PolygonSignalSummaryInput): string {
  const { bundle, question } = input;
  const regime = bundle.volatility?.regime ?? 'unknown';
  const signalCount = bundle.signals.length;
  const whaleCount = bundle.whaleActivity.length;
  const flowCount = bundle.flowSignals.length;

  const regimeDescriptions: Record<string, string> = {
    calm: 'low activity, stable conditions',
    building: 'rising volume and transfer activity — watch for regime shift',
    explosive: 'extremely elevated on-chain activity — high-volatility environment',
    unknown: 'insufficient data to determine regime',
  };

  const lines = [
    '## Polygon On-Chain Signal Summary',
    '',
    `**Block**: ${bundle.blockNumber}`,
    `**Volatility Regime**: ${regime} — ${regimeDescriptions[regime] ?? regime}`,
    `**Signal Count**: ${signalCount}`,
    `**Flow Events**: ${flowCount}`,
    `**Whale Moves**: ${whaleCount}`,
    '',
    '### Top Signals',
    ...bundle.signals.slice(0, 5).map(
      (s) => `- [${s.confidence.tier}] ${s.description} (${s.type})`,
    ),
  ];

  if (question) {
    lines.push('', `### Agent Context`, `Question: ${question}`);
  }

  lines.push(
    '',
    '> All signals are derived from public on-chain data. This is not financial advice.',
  );

  return lines.join('\n');
}
