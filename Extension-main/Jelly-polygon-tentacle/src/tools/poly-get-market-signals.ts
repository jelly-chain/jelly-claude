import { ToolDefinition, ToolResult } from './index.js';
import { MarketService } from '../services/market-service.js';

export function getMarketSignalsDefinition(): ToolDefinition {
  return {
    name: 'poly-get-market-signals',
    description:
      'Get aggregated Polygon on-chain signal bundle: whale moves, large transfers, volume surges, DeFi events, and confidence scores for a given block window.',
    input_schema: {
      type: 'object',
      properties: {
        window: {
          type: 'string',
          enum: ['1m', '5m', '15m', '1h', '4h', '24h'],
          description: 'Time window for signal aggregation',
        },
        minUsdValue: {
          type: 'string',
          description: 'Minimum USD value threshold to include a signal (e.g. "10000")',
        },
      },
      required: [],
    },
  };
}

export async function handleGetMarketSignals(
  params: Record<string, unknown>,
  service: MarketService,
): Promise<ToolResult> {
  const window = typeof params['window'] === 'string' ? params['window'] : '1h';
  const minUsdValue = typeof params['minUsdValue'] === 'string'
    ? parseFloat(params['minUsdValue'])
    : 10_000;

  try {
    const signals = await service.getSignalBundle(window, minUsdValue);
    return { tool: 'poly-get-market-signals', success: true, data: signals };
  } catch (err) {
    return { tool: 'poly-get-market-signals', success: false, data: null, error: String(err) };
  }
}
