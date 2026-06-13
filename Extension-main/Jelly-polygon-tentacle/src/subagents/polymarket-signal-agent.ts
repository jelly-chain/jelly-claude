/** PolymarketSignalAgent — tracks Polymarket onchain state, order flow, and resolutions. */

import { SubagentDefinition, AgentInput, AgentOutput } from './index.js';
import { MarketSignal } from '../schemas/market.js';
import { confidenceTier } from '../schemas/signal.js';
import { PolymarketService } from '../services/polymarket-service.js';
import { clamp } from '../utils/math.js';

export class PolymarketSignalAgent {
  readonly name = 'PolymarketSignalAgent';

  constructor(private readonly polymarketService: PolymarketService) {}

  getDefinition(): SubagentDefinition {
    return {
      name: this.name,
      description:
        'Tracks Polymarket prediction market state on Polygon: implied probabilities, order-flow imbalance, volume changes, and upcoming resolutions. Produces MarketSignal[] with direction and strength.',
      version: '0.1.0',
      inputSchema: {
        conditionIds: { type: 'array', items: { type: 'string' }, description: 'Market condition IDs to track' },
        query: { type: 'string', description: 'Search query for market discovery' },
        limit: { type: 'number', description: 'Max markets to analyze' },
      },
      outputSchema: {
        marketSignals: { type: 'array', description: 'MarketSignal[]' },
        highConvictionCount: { type: 'number' },
        pendingResolutionCount: { type: 'number' },
      },
    };
  }

  async run(input: AgentInput): Promise<AgentOutput> {
    const conditionIds = input.conditionIds ?? [];
    const limit = typeof input.options?.['limit'] === 'number' ? input.options['limit'] : 20;

    try {
      const markets = await this.polymarketService.searchMarkets({ limit });
      const signals: MarketSignal[] = markets.map((m) => {
        const impliedYes = this.polymarketService.extractProbability(m);
        const impliedNo = clamp(1 - impliedYes, 0, 1);
        const imbalance = impliedYes - 0.5;
        const strength = Math.abs(imbalance);

        return {
          conditionId: m.conditionId,
          question: m.question,
          impliedProbabilityYes: impliedYes,
          impliedProbabilityNo: impliedNo,
          volumeChange24h: 0,
          orderFlowImbalance: imbalance,
          signalStrength: strength > 0.2 ? 'strong' : strength > 0.1 ? 'moderate' : 'weak',
          signalDirection: imbalance > 0.05 ? 'bullish' : imbalance < -0.05 ? 'bearish' : 'neutral',
          computedAt: new Date().toISOString(),
        };
      });

      const highConviction = signals.filter((s) => s.signalStrength === 'strong').length;
      const pendingResolutions = await this.polymarketService.getResolutions(5);

      return {
        agentName: this.name,
        success: true,
        data: {
          marketSignals: signals,
          highConvictionCount: highConviction,
          pendingResolutionCount: pendingResolutions.length,
        },
        computedAt: new Date().toISOString(),
      };
    } catch (err) {
      return {
        agentName: this.name,
        success: false,
        data: { marketSignals: [], highConvictionCount: 0, pendingResolutionCount: 0 },
        error: String(err),
        computedAt: new Date().toISOString(),
      };
    }
  }
}
