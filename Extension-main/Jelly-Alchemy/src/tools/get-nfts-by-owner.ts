import { ToolDefinition } from './index.js';
import { NftClient } from '../client/nft.js';
import { ChainId } from '../config/chains.js';

export const getNftsByOwnerTool: ToolDefinition = {
  name: 'get-nfts-by-owner',
  description: 'Get all NFTs owned by a wallet address, optionally filtered by collection contract address.',
  input_schema: {
    type: 'object',
    properties: {
      owner: { type: 'string', description: 'Wallet address' },
      chain: {
        type: 'string',
        enum: ['eth-mainnet', 'bnb-mainnet', 'base-mainnet', 'arb-mainnet', 'polygon-mainnet'],
      },
      contractAddress: { type: 'string', description: 'Filter to a specific collection' },
      pageKey: { type: 'string', description: 'Pagination cursor' },
    },
    required: ['owner', 'chain'],
  },
};

export interface GetNftsByOwnerInput {
  owner: string;
  chain: ChainId;
  contractAddress?: string;
  pageKey?: string;
}

export async function handleGetNftsByOwner(input: GetNftsByOwnerInput) {
  const client = new NftClient(input.chain);
  const contracts = input.contractAddress ? [input.contractAddress] : undefined;
  return client.getNftsForOwner(input.owner, contracts, input.pageKey);
}
