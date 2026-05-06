/** PolygonFlowAgent — watches token flows, large transfers, and DeFi pool events. */

import { SubagentDefinition, AgentInput, AgentOutput } from './index.js';
import { FlowSignal, confidenceTier } from '../schemas/signal.js';
import { TokenService } from '../services/token-service.js';
import { WindowLabel } from '../utils/time-windows.js';
import { clamp } from '../utils/math.js';

export class PolygonFlowAgent {
  readonly name = 'PolygonFlowAgent';

  constructor(private readonly tokenService: TokenService) {}

  getDefinition(): SubagentDefinition {
    return {
      name: this.name,
      description:
        'Monitors Polygon ERC-20 token flows, identifies large transfers (whale moves), and surfaces DeFi pool interaction events. Produces FlowSignal[] sorted by USD value.',
      version: '0.1.0',
      inputSchema: {
        addresses: { type: 'array', items: { type: 'string' }, description: 'Addresses to monitor' },
        window: { type: 'string', enum: ['1m', '5m', '15m', '1h', '4h', '24h', '7d'] },
        whaleThresholdUsd: { type: 'number', description: 'Minimum USD for a whale transfer' },
      },
      outputSchema: {
        flowSignals: { type: 'array', description: 'FlowSignal[]' },
        largeTransferCount: { type: 'number' },
        netFlowUsd: { type: 'number' },
      },
    };
  }

  async run(input: AgentInput): Promise<AgentOutput> {
    const window = (input.window as WindowLabel | undefined) ?? '1h';
    const addresses = input.addresses ?? [];
    const whaleThresholdUsd =
      typeof input.options?.['whaleThresholdUsd'] === 'number'
        ? input.options['whaleThresholdUsd']
        : 100_000;

    try {
      const allFlows: FlowSignal[] = [];

      for (const address of addresses) {
        const flows = await this.tokenService.getTokenFlows(address, window);
        const flowSignals: FlowSignal[] = flows.map((f) => ({
          tokenAddress: f.tokenAddress,
          symbol: f.symbol,
          from: f.from,
          to: f.to,
          formattedAmount: f.formattedAmount,
          usdValue: f.usdValue ?? 0,
          txHash: f.txHash,
          blockNumber: f.blockNumber,
          timestamp: f.timestamp,
          isWhale: (f.usdValue ?? 0) >= whaleThresholdUsd,
          flowType: 'transfer',
        }));
        allFlows.push(...flowSignals);
      }

      const sorted = allFlows.sort((a, b) => b.usdValue - a.usdValue);
      const largeTransferCount = sorted.filter((s) => s.isWhale).length;
      const netFlowUsd = sorted.reduce((sum, s) => sum + s.usdValue, 0);

      return {
        agentName: this.name,
        success: true,
        data: { flowSignals: sorted, largeTransferCount, netFlowUsd },
        computedAt: new Date().toISOString(),
      };
    } catch (err) {
      return {
        agentName: this.name,
        success: false,
        data: { flowSignals: [], largeTransferCount: 0, netFlowUsd: 0 },
        error: String(err),
        computedAt: new Date().toISOString(),
      };
    }
  }
}
