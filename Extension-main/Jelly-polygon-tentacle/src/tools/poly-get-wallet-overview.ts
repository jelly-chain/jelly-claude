import { ToolDefinition, ToolResult } from './index.js';
import { WalletService } from '../services/wallet-service.js';
import { isWalletOverview, emptyWalletOverview } from '../schemas/wallet.js';

export function getWalletOverviewDefinition(): ToolDefinition {
  return {
    name: 'poly-get-wallet-overview',
    description:
      'Get a full Polygon wallet overview: native POL balance, ERC-20 token holdings, NFT count, transaction count, and activity tags for a given address.',
    input_schema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'Polygon wallet address (0x...)' },
        includePrices: {
          type: 'string',
          enum: ['true', 'false'],
          description: 'Whether to fetch USD prices for token holdings',
        },
      },
      required: ['address'],
    },
  };
}

export async function handleGetWalletOverview(
  params: Record<string, unknown>,
  service: WalletService,
): Promise<ToolResult> {
  const address = typeof params['address'] === 'string' ? params['address'] : '';
  const includePrices = params['includePrices'] === 'true';

  if (!address) {
    return { tool: 'poly-get-wallet-overview', success: false, data: null, error: 'address is required' };
  }

  try {
    const overview = await service.getOverview(address, includePrices);
    return { tool: 'poly-get-wallet-overview', success: true, data: overview };
  } catch (err) {
    const fallback = emptyWalletOverview(address);
    return { tool: 'poly-get-wallet-overview', success: false, data: fallback, error: String(err) };
  }
}
