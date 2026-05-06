import { ToolDefinition } from './index.js';
import { SolanaClient } from '../client/solana.js';

export const solanaGetAssetTool: ToolDefinition = {
  name: 'solana-get-asset',
  description: 'Get full metadata and ownership details for a single Solana asset by its ID using the DAS API.',
  input_schema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Asset ID (mint address, base58)' },
    },
    required: ['id'],
  },
};

export interface SolanaGetAssetInput {
  id: string;
}

export async function handleSolanaGetAsset(input: SolanaGetAssetInput) {
  const client = new SolanaClient();
  return client.getAsset(input.id);
}
