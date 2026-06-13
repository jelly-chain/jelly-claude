import { ToolDefinition } from './index.js';
import { RpcClient } from '../client/rpc.js';
import { ChainId } from '../config/chains.js';

export const getBlockDataTool: ToolDefinition = {
  name: 'get-block-data',
  description: 'Get block data by block number or "latest". Returns timestamp, gas, and transaction hashes.',
  input_schema: {
    type: 'object',
    properties: {
      chain: {
        type: 'string',
        enum: ['eth-mainnet', 'bnb-mainnet', 'base-mainnet', 'arb-mainnet', 'polygon-mainnet', 'opbnb-mainnet'],
      },
      block: { type: 'string', description: 'Block number (hex) or "latest"' },
      includeTxHashes: { type: 'string', description: '"true" to include transaction hashes', enum: ['true', 'false'] },
    },
    required: ['chain'],
  },
};

export interface GetBlockDataInput {
  chain: ChainId;
  block?: string;
  includeTxHashes?: string;
}

export async function handleGetBlockData(input: GetBlockDataInput) {
  const client = new RpcClient(input.chain);
  const blockTag = input.block ?? 'latest';
  const full = input.includeTxHashes === 'true' ? false : false;
  return client.getBlockByNumber(blockTag, full);
}
