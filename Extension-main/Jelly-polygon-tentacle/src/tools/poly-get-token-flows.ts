import { ToolDefinition, ToolResult } from './index.js';
import { TokenService } from '../services/token-service.js';
import { WindowLabel } from '../utils/time-windows.js';

export function getTokenFlowsDefinition(): ToolDefinition {
  return {
    name: 'poly-get-token-flows',
    description:
      'Get ERC-20 token flow summary for an address or token over a time window — net inflows, outflows, large transfers, and unique counterparties.',
    input_schema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Wallet or token contract address to monitor' },
        tokenAddress: { type: 'string', description: 'Filter by specific ERC-20 token address (optional)' },
        window: {
          type: 'string',
          enum: ['1m', '5m', '15m', '1h', '4h', '24h', '7d'],
          description: 'Time window for flow analysis',
        },
      },
      required: ['address'],
    },
  };
}

export async function handleGetTokenFlows(
  params: Record<string, unknown>,
  service: TokenService,
): Promise<ToolResult> {
  const address = typeof params['address'] === 'string' ? params['address'] : '';
  const tokenAddress = typeof params['tokenAddress'] === 'string' ? params['tokenAddress'] : undefined;
  const window = (params['window'] as WindowLabel | undefined) ?? '1h';

  if (!address) {
    return { tool: 'poly-get-token-flows', success: false, data: null, error: 'address is required' };
  }

  try {
    const flows = await service.getTokenFlows(address, window, tokenAddress);
    return { tool: 'poly-get-token-flows', success: true, data: flows };
  } catch (err) {
    return { tool: 'poly-get-token-flows', success: false, data: [], error: String(err) };
  }
}
