/** Prompt builder — whale activity summary for Jelly Claude. */

import { WhaleActivity } from '../schemas/signal.js';
import { formatUSD, shortenAddress } from '../utils/format.js';

export interface WhaleTrackerInput {
  activities: WhaleActivity[];
  windowLabel: string;
  totalNetFlowUsd: number;
}

export function buildWhaleTrackerPrompt(input: WhaleTrackerInput): string {
  const { activities, windowLabel, totalNetFlowUsd } = input;

  if (activities.length === 0) {
    return [
      '## Whale Tracker Summary',
      '',
      `No whale activity detected in the ${windowLabel} window.`,
    ].join('\n');
  }

  const lines = [
    '## Whale Tracker Summary',
    '',
    `**Window**: ${windowLabel}`,
    `**Whales tracked**: ${activities.length}`,
    `**Total net flow**: ${formatUSD(totalNetFlowUsd)}`,
    '',
    '### Activity Breakdown',
  ];

  for (const act of activities) {
    const label = act.label ?? shortenAddress(act.address);
    const flowDir = act.netUsdFlow >= 0 ? '↑ inflow' : '↓ outflow';
    lines.push(
      `- **${label}** (${act.activityType}) — ${formatUSD(Math.abs(act.netUsdFlow))} ${flowDir} — conviction: ${act.conviction}`,
    );
  }

  lines.push(
    '',
    '> Whale activity is inferred from large on-chain transfers and may not represent intentional market moves.',
  );

  return lines.join('\n');
}
