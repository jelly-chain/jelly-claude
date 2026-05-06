import { ToolDefinition, ToolResult } from './index.js';
import { VolatilityService } from '../services/volatility-service.js';
import { WindowLabel } from '../utils/time-windows.js';

export function getVolatilityWindowDefinition(): ToolDefinition {
  return {
    name: 'poly-get-volatility-window',
    description:
      'Compute a volatility regime label (calm / building / explosive) from Polygon on-chain volume, price range, and large transfer count within a time window.',
    input_schema: {
      type: 'object',
      properties: {
        window: {
          type: 'string',
          enum: ['15m', '1h', '4h', '24h'],
          description: 'Time window for volatility computation',
        },
        tokenAddress: {
          type: 'string',
          description: 'Token to analyze (defaults to USDC if omitted)',
        },
      },
      required: [],
    },
  };
}

export async function handleGetVolatilityWindow(
  params: Record<string, unknown>,
  service: VolatilityService,
): Promise<ToolResult> {
  const window = (params['window'] as WindowLabel | undefined) ?? '1h';
  const tokenAddress = typeof params['tokenAddress'] === 'string' ? params['tokenAddress'] : undefined;

  try {
    const report = await service.computeRegime(window, tokenAddress);
    return { tool: 'poly-get-volatility-window', success: true, data: report };
  } catch (err) {
    return { tool: 'poly-get-volatility-window', success: false, data: null, error: String(err) };
  }
}
