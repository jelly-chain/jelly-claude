/** VolatilityWindowAgent — labels volatility regime (calm / building / explosive). */

import { SubagentDefinition, AgentInput, AgentOutput } from './index.js';
import { VolatilityReport, VolatilityRegime } from '../schemas/signal.js';
import { VolatilityService } from '../services/volatility-service.js';
import { WindowLabel } from '../utils/time-windows.js';

export class VolatilityWindowAgent {
  readonly name = 'VolatilityWindowAgent';

  constructor(private readonly volatilityService: VolatilityService) {}

  getDefinition(): SubagentDefinition {
    return {
      name: this.name,
      description:
        'Analyzes Polygon on-chain volume patterns across multiple time windows and produces a VolatilityReport with regime label (calm/building/explosive), score, and contributing factors.',
      version: '0.1.0',
      inputSchema: {
        window: { type: 'string', enum: ['15m', '1h', '4h', '24h'] },
        tokenAddress: { type: 'string', description: 'Token to analyze (defaults to USDC)' },
      },
      outputSchema: {
        report: { type: 'object', description: 'VolatilityReport' },
        regimeChanged: { type: 'boolean' },
        previousRegime: { type: 'string', enum: ['calm', 'building', 'explosive', 'unknown'] },
      },
    };
  }

  async run(input: AgentInput): Promise<AgentOutput> {
    const window = (input.window as WindowLabel | undefined) ?? '1h';
    const tokenAddress = typeof input.options?.['tokenAddress'] === 'string'
      ? input.options['tokenAddress']
      : undefined;

    try {
      const report = await this.volatilityService.computeRegime(window, tokenAddress);

      return {
        agentName: this.name,
        success: true,
        data: {
          report,
          regimeChanged: false,
          previousRegime: 'unknown',
        },
        computedAt: new Date().toISOString(),
      };
    } catch (err) {
      const fallback: VolatilityReport = {
        regime: 'calm',
        score: 0,
        windowLabel: window,
        volumeRatio: 1,
        priceRangePercent: 0,
        largeTransferCount: 0,
        blockRange: { from: 0, to: 0 },
        computedAt: new Date().toISOString(),
      };
      return {
        agentName: this.name,
        success: false,
        data: { report: fallback, regimeChanged: false, previousRegime: 'unknown' },
        error: String(err),
        computedAt: new Date().toISOString(),
      };
    }
  }
}
