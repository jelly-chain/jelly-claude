import { ToolDefinition, ToolResult } from './index.js';
import { LiquidityService } from '../services/liquidity-service.js';
import { WindowLabel } from '../utils/time-windows.js';

export function getLiquidityEventsDefinition(): ToolDefinition {
  return {
    name: 'poly-get-liquidity-events',
    description:
      'Get Polygon DeFi liquidity add/remove events for a pool or protocol over a time window — Uniswap V3, QuickSwap, Aave.',
    input_schema: {
      type: 'object',
      properties: {
        poolAddress: { type: 'string', description: 'Pool or protocol contract address (optional — omit for all)' },
        window: {
          type: 'string',
          enum: ['1h', '4h', '24h', '7d'],
          description: 'Time window for liquidity event scan',
        },
        protocol: {
          type: 'string',
          enum: ['uniswap-v3', 'quickswap', 'aave', 'all'],
          description: 'DeFi protocol to filter by',
        },
      },
      required: [],
    },
  };
}

export async function handleGetLiquidityEvents(
  params: Record<string, unknown>,
  service: LiquidityService,
): Promise<ToolResult> {
  const poolAddress = typeof params['poolAddress'] === 'string' ? params['poolAddress'] : undefined;
  const window = (params['window'] as WindowLabel | undefined) ?? '24h';
  const protocol = typeof params['protocol'] === 'string' ? params['protocol'] : 'all';

  try {
    const events = await service.getLiquidityEvents(window, poolAddress, protocol);
    return { tool: 'poly-get-liquidity-events', success: true, data: events };
  } catch (err) {
    return { tool: 'poly-get-liquidity-events', success: false, data: [], error: String(err) };
  }
}
