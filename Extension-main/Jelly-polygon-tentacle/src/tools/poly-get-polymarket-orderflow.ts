import { ToolDefinition, ToolResult } from './index.js';
import { PolymarketService } from '../services/polymarket-service.js';
import { MarketOutcome } from '../schemas/market.js';

export function getPolymarketOrderflowDefinition(): ToolDefinition {
  return {
    name: 'poly-get-polymarket-orderflow',
    description:
      'Get the Polymarket CLOB order book for a specific market: bids, asks, best price, spread, depth, and order-flow imbalance signal.',
    input_schema: {
      type: 'object',
      properties: {
        conditionId: { type: 'string', description: 'Polymarket market conditionId (hex)' },
        outcome: {
          type: 'string',
          enum: ['YES', 'NO'],
          description: 'Which outcome\'s order book to fetch',
        },
      },
      required: ['conditionId'],
    },
  };
}

export async function handleGetPolymarketOrderflow(
  params: Record<string, unknown>,
  service: PolymarketService,
): Promise<ToolResult> {
  const conditionId = typeof params['conditionId'] === 'string' ? params['conditionId'] : '';
  const outcome = (params['outcome'] as MarketOutcome | undefined) ?? 'YES';

  if (!conditionId) {
    return { tool: 'poly-get-polymarket-orderflow', success: false, data: null, error: 'conditionId is required' };
  }

  try {
    const orderBook = await service.getOrderBook(conditionId, outcome);
    return { tool: 'poly-get-polymarket-orderflow', success: true, data: orderBook };
  } catch (err) {
    return { tool: 'poly-get-polymarket-orderflow', success: false, data: null, error: String(err) };
  }
}
