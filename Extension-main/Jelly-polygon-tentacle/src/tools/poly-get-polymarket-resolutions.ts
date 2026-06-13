import { ToolDefinition, ToolResult } from './index.js';
import { PolymarketService } from '../services/polymarket-service.js';

export function getPolymarketResolutionsDefinition(): ToolDefinition {
  return {
    name: 'poly-get-polymarket-resolutions',
    description:
      'Fetch recently resolved Polymarket markets with outcomes, resolution timestamps, and UMA oracle request IDs.',
    input_schema: {
      type: 'object',
      properties: {
        limit: { type: 'string', description: 'Number of resolved markets to return (default 20)' },
      },
      required: [],
    },
  };
}

export async function handleGetPolymarketResolutions(
  params: Record<string, unknown>,
  service: PolymarketService,
): Promise<ToolResult> {
  const limit = typeof params['limit'] === 'string' ? parseInt(params['limit'], 10) : 20;

  try {
    const resolutions = await service.getResolutions(limit);
    return { tool: 'poly-get-polymarket-resolutions', success: true, data: resolutions };
  } catch (err) {
    return { tool: 'poly-get-polymarket-resolutions', success: false, data: [], error: String(err) };
  }
}
