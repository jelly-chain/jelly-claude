import { ToolDefinition } from './index.js';
import { DataApiClient } from '../client/data-api.js';
import { ChainId } from '../config/chains.js';

export const getTokenBalancesTool: ToolDefinition = {
  name: 'get-token-balances',
  description: 'Get all ERC-20 token balances for a wallet on a given EVM chain.',
  input_schema: {
    type: 'object',
    properties: {
      address: { type: 'string', description: 'Wallet address' },
      chain: {
        type: 'string',
        description: 'Chain identifier',
        enum: ['eth-mainnet', 'bnb-mainnet', 'base-mainnet', 'arb-mainnet', 'polygon-mainnet', 'opbnb-mainnet'],
      },
      pageKey: { type: 'string', description: 'Pagination cursor from previous response' },
    },
    required: ['address', 'chain'],
  },
};

export interface GetTokenBalancesInput {
  address: string;
  chain: ChainId;
  pageKey?: string;
}

export async function handleGetTokenBalances(input: GetTokenBalancesInput) {
  const client = new DataApiClient(input.chain);
  return client.getTokenBalances(input.address, input.pageKey);
}
