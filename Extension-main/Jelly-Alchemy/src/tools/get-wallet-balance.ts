import { ToolDefinition } from './index.js';
import { RpcClient } from '../client/rpc.js';
import { parseHexBalance } from '../utils/format.js';
import { ChainId } from '../config/chains.js';

export const getWalletBalanceTool: ToolDefinition = {
  name: 'get-wallet-balance',
  description: 'Get the native token balance (ETH, BNB, POL, SOL, etc.) of a wallet address on a given chain.',
  input_schema: {
    type: 'object',
    properties: {
      address: { type: 'string', description: 'Wallet address (0x… for EVM)' },
      chain: {
        type: 'string',
        description: 'Chain identifier',
        enum: ['eth-mainnet', 'bnb-mainnet', 'base-mainnet', 'arb-mainnet', 'polygon-mainnet', 'opbnb-mainnet'],
      },
    },
    required: ['address', 'chain'],
  },
};

export interface GetWalletBalanceInput {
  address: string;
  chain: ChainId;
}

export interface GetWalletBalanceOutput {
  address: string;
  chain: ChainId;
  rawBalance: string;
  balanceEth: string;
}

export async function handleGetWalletBalance(input: GetWalletBalanceInput): Promise<GetWalletBalanceOutput> {
  const client = new RpcClient(input.chain);
  const raw = await client.getBalance(input.address);
  return {
    address: input.address,
    chain: input.chain,
    rawBalance: raw,
    balanceEth: parseHexBalance(raw),
  };
}
