/** Prompt builder — DeFi liquidity event explanation for Jelly Claude. */

import { LiquidityEvent } from '../services/liquidity-service.js';
import { formatUSD } from '../utils/format.js';

export interface LiquidityMoveInput {
  events: LiquidityEvent[];
  windowLabel: string;
}

export function buildLiquidityMoveExplainerPrompt(input: LiquidityMoveInput): string {
  const { events, windowLabel } = input;

  if (events.length === 0) {
    return [
      '## Liquidity Move Explainer',
      '',
      `No significant liquidity events detected in the ${windowLabel} window.`,
    ].join('\n');
  }

  const adds = events.filter((e) => e.eventType === 'add');
  const removes = events.filter((e) => e.eventType === 'remove');
  const byProtocol: Record<string, number> = {};

  for (const e of events) {
    const key = String(e.protocol);
    byProtocol[key] = (byProtocol[key] ?? 0) + 1;
  }

  const lines = [
    '## Liquidity Move Explainer',
    '',
    `**Window**: ${windowLabel}`,
    `**Total events**: ${events.length}`,
    `**Adds**: ${adds.length} · **Removes**: ${removes.length}`,
    '',
    '### By Protocol',
    ...Object.entries(byProtocol).map(([p, n]) => `- ${p}: ${n} events`),
  ];

  if (removes.length > adds.length) {
    lines.push(
      '',
      '**Signal**: Net liquidity removal — providers may be reducing risk. Watch for increased slippage.',
    );
  } else if (adds.length > removes.length) {
    lines.push(
      '',
      '**Signal**: Net liquidity addition — providers are positioning for expected volume.',
    );
  }

  lines.push(
    '',
    '> Liquidity moves are on-chain facts; the interpretation is heuristic and may not reflect actual intent.',
  );

  return lines.join('\n');
}
