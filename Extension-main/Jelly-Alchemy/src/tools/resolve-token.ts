import { ToolDefinition } from './index.js';
import { DataApiClient } from '../client/data-api.js';
import { ChainId } from '../config/chains.js';

export const resolveTokenTool: ToolDefinition = {
  name: 'resolve-token',
  description: 'Resolve a token contract address to its name, symbol, decimals, and logo.',
  input_schema: {
    type: 'object',
    properties: {
      contractAddress: { type: 'string', description: 'ERC-20 token contract address' },
      chain: {
        type: 'string',
        enum: ['eth-mainnet', 'bnb-mainnet', 'base-mainnet', 'arb-mainnet', 'polygon-mainnet', 'opbnb-mainnet'],
      },
    },
    required: ['contractAddress', 'chain'],
  },
};

export interface ResolveTokenInput {
  contractAddress: string;
  chain: ChainId;
}

export async function handleResolveToken(input: ResolveTokenInput) {
  const client = new DataApiClient(input.chain);
  return client.getTokenMetadata(input.contractAddress);
}
