import { ToolDefinition } from './index.js';
import { RpcClient } from '../client/rpc.js';
import { ChainId } from '../config/chains.js';

export const getTransactionDetailsTool: ToolDefinition = {
  name: 'get-transaction-details',
  description: 'Get full details of a transaction by hash, including receipt and logs.',
  input_schema: {
    type: 'object',
    properties: {
      hash: { type: 'string', description: 'Transaction hash (0x…)' },
      chain: {
        type: 'string',
        enum: ['eth-mainnet', 'bnb-mainnet', 'base-mainnet', 'arb-mainnet', 'polygon-mainnet', 'opbnb-mainnet'],
      },
    },
    required: ['hash', 'chain'],
  },
};

export interface GetTransactionDetailsInput {
  hash: string;
  chain: ChainId;
}

export async function handleGetTransactionDetails(input: GetTransactionDetailsInput) {
  const client = new RpcClient(input.chain);
  const [tx, receipt] = await Promise.all([
    client.getTransactionByHash(input.hash),
    client.getTransactionReceipt(input.hash),
  ]);
  return { transaction: tx, receipt };
}
