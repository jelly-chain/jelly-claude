import { ToolDefinition } from './index.js';
import { SolanaClient } from '../client/solana.js';

export const solanaGetAssetsByOwnerTool: ToolDefinition = {
  name: 'solana-get-assets-by-owner',
  description: 'Get all digital assets (NFTs, compressed NFTs, tokens) owned by a Solana wallet using the DAS API.',
  input_schema: {
    type: 'object',
    properties: {
      ownerAddress: { type: 'string', description: 'Solana wallet public key (base58)' },
      page: { type: 'string', description: 'Page number (default: 1)' },
      limit: { type: 'string', description: 'Items per page (default: 50, max: 1000)' },
    },
    required: ['ownerAddress'],
  },
};

export interface SolanaGetAssetsByOwnerInput {
  ownerAddress: string;
  page?: string;
  limit?: string;
}

export async function handleSolanaGetAssetsByOwner(input: SolanaGetAssetsByOwnerInput) {
  const client = new SolanaClient();
  const page = input.page ? parseInt(input.page, 10) : 1;
  const limit = input.limit ? Math.min(parseInt(input.limit, 10), 1000) : 50;
  return client.getAssetsByOwner(input.ownerAddress, page, limit);
}
