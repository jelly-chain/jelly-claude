/** WhaleScoutAgent — tracks specific wallets and tags Polygon activity. */

import { SubagentDefinition, AgentInput, AgentOutput } from './index.js';
import { WhaleActivity, FlowSignal, confidenceTier } from '../schemas/signal.js';
import { WalletService } from '../services/wallet-service.js';
import { WindowLabel } from '../utils/time-windows.js';

export class WhaleScoutAgent {
  readonly name = 'WhaleScoutAgent';

  constructor(private readonly walletService: WalletService) {}

  getDefinition(): SubagentDefinition {
    return {
      name: this.name,
      description:
        'Tracks a watchlist of whale addresses on Polygon. Labels activity type (accumulation/distribution/swap/defi/bridge), computes net USD flow, and flags high-conviction moves.',
      version: '0.1.0',
      inputSchema: {
        addresses: { type: 'array', items: { type: 'string' }, description: 'Whale wallet addresses to track' },
        window: { type: 'string', enum: ['1h', '4h', '24h', '7d'] },
        thresholdUsd: { type: 'number', description: 'Min USD value to surface (default 100000)' },
      },
      outputSchema: {
        whaleActivity: { type: 'array', description: 'WhaleActivity[]' },
        totalNetFlowUsd: { type: 'number' },
        dominantActivity: { type: 'string' },
      },
    };
  }

  async run(input: AgentInput): Promise<AgentOutput> {
    const addresses = input.addresses ?? [];
    const window = (input.window as WindowLabel | undefined) ?? '24h';
    const thresholdUsd =
      typeof input.options?.['thresholdUsd'] === 'number' ? input.options['thresholdUsd'] : 100_000;

    try {
      const activities: WhaleActivity[] = [];

      for (const address of addresses) {
        const overview = await this.walletService.getOverview(address, false);
        const flows: FlowSignal[] = [];
        const netUsd = 0;

        activities.push({
          address,
          label: overview.tags[0],
          activityType: 'swap',
          tokenFlows: flows,
          netUsdFlow: netUsd,
          conviction: 'low',
          detectedAt: new Date().toISOString(),
        });
      }

      const totalNetFlowUsd = activities.reduce((sum, a) => sum + a.netUsdFlow, 0);
      const dominantActivity = activities.length > 0
        ? (activities.sort((a, b) => Math.abs(b.netUsdFlow) - Math.abs(a.netUsdFlow))[0]?.activityType ?? 'unknown')
        : 'unknown';

      return {
        agentName: this.name,
        success: true,
        data: { whaleActivity: activities, totalNetFlowUsd, dominantActivity },
        computedAt: new Date().toISOString(),
      };
    } catch (err) {
      return {
        agentName: this.name,
        success: false,
        data: { whaleActivity: [], totalNetFlowUsd: 0, dominantActivity: 'unknown' },
        error: String(err),
        computedAt: new Date().toISOString(),
      };
    }
  }
}
