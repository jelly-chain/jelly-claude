import { ToolDefinition, ToolResult } from './index.js';
import { WebhookService } from '../services/webhook-service.js';

export function watchAddressDefinition(): ToolDefinition {
  return {
    name: 'poly-watch-address',
    description:
      'Register a Polygon address for Alchemy webhook monitoring. Triggers activity alerts on any ERC-20 transfer, native POL send/receive, or contract call.',
    input_schema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Polygon wallet or contract address to monitor' },
        callbackUrl: { type: 'string', description: 'HTTPS webhook URL to receive activity events' },
        label: { type: 'string', description: 'Human-readable label for this address (optional)' },
      },
      required: ['address', 'callbackUrl'],
    },
  };
}

export async function handleWatchAddress(
  params: Record<string, unknown>,
  service: WebhookService,
): Promise<ToolResult> {
  const address = typeof params['address'] === 'string' ? params['address'] : '';
  const callbackUrl = typeof params['callbackUrl'] === 'string' ? params['callbackUrl'] : '';
  const label = typeof params['label'] === 'string' ? params['label'] : undefined;

  if (!address || !callbackUrl) {
    return { tool: 'poly-watch-address', success: false, data: null, error: 'address and callbackUrl are required' };
  }

  try {
    const webhook = await service.watchAddress(address, callbackUrl, label);
    return { tool: 'poly-watch-address', success: true, data: webhook };
  } catch (err) {
    return { tool: 'poly-watch-address', success: false, data: null, error: String(err) };
  }
}
