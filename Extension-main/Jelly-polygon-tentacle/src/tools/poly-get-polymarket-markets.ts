import { ToolDefinition, ToolResult } from './index.js';
import { PolymarketService } from '../services/polymarket-service.js';

export function getPolymarketMarketsDefinition(): ToolDefinition {
  return {
    name: 'poly-get-polymarket-markets',
    description:
      'Search and list active Polymarket prediction markets. Returns market metadata, outcomes, implied probabilities, volume, and open interest.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query (e.g. "bitcoin", "election", "nba")' },
        tag: { type: 'string', description: 'Category tag filter (e.g. "sports", "crypto", "politics")' },
        status: {
          type: 'string',
          enum: ['active', 'closed', 'resolved'],
          description: 'Market status filter',
        },
        limit: { type: 'string', description: 'Max markets to return (default 20, max 100)' },
      },
      required: [],
    },
  };
}

export async function handleGetPolymarketMarkets(
  params: Record<string, unknown>,
  service: PolymarketService,
): Promise<ToolResult> {
  const query = typeof params['query'] === 'string' ? params['query'] : undefined;
  const tag = typeof params['tag'] === 'string' ? params['tag'] : undefined;
  const status = (params['status'] as 'active' | 'closed' | 'resolved' | undefined) ?? 'active';
  const limit = typeof params['limit'] === 'string' ? parseInt(params['limit'], 10) : 20;

  try {
    const markets = await service.searchMarkets({ query, tag, status, limit });
    return { tool: 'poly-get-polymarket-markets', success: true, data: markets };
  } catch (err) {
    return { tool: 'poly-get-polymarket-markets', success: false, data: [], error: String(err) };
  }
}
