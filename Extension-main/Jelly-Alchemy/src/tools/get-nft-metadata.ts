import { ToolDefinition } from './index.js';
import { NftClient } from '../client/nft.js';
import { ChainId } from '../config/chains.js';

export const getNftMetadataTool: ToolDefinition = {
  name: 'get-nft-metadata',
  description: 'Get full metadata for a specific NFT by contract address and token ID.',
  input_schema: {
    type: 'object',
    properties: {
      contractAddress: { type: 'string', description: 'NFT collection contract address' },
      tokenId: { type: 'string', description: 'Token ID (decimal or hex string)' },
      chain: {
        type: 'string',
        enum: ['eth-mainnet', 'bnb-mainnet', 'base-mainnet', 'arb-mainnet', 'polygon-mainnet'],
      },
      tokenType: { type: 'string', enum: ['ERC721', 'ERC1155'] },
    },
    required: ['contractAddress', 'tokenId', 'chain'],
  },
};

export interface GetNftMetadataInput {
  contractAddress: string;
  tokenId: string;
  chain: ChainId;
  tokenType?: 'ERC721' | 'ERC1155';
}

export async function handleGetNftMetadata(input: GetNftMetadataInput) {
  const client = new NftClient(input.chain);
  return client.getNftMetadata(input.contractAddress, input.tokenId, input.tokenType);
}
