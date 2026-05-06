import { ToolDefinition } from './index.js';
import { TransfersClient } from '../client/transfers.js';
import { ChainId } from '../config/chains.js';

export const getWalletTransfersTool: ToolDefinition = {
  name: 'get-wallet-transfers',
  description: 'Get the full transfer history (sent + received) for a wallet — ERC-20, ERC-721, ERC-1155, and native.',
  input_schema: {
    type: 'object',
    properties: {
      address: { type: 'string', description: 'Wallet address' },
      chain: {
        type: 'string',
        enum: ['eth-mainnet', 'bnb-mainnet', 'base-mainnet', 'arb-mainnet', 'polygon-mainnet', 'opbnb-mainnet'],
      },
      fromBlock: { type: 'string', description: 'Starting block (hex or "0x0")' },
      direction: { type: 'string', enum: ['both', 'sent', 'received'], description: 'Which transfers to return' },
    },
    required: ['address', 'chain'],
  },
};

export interface GetWalletTransfersInput {
  address: string;
  chain: ChainId;
  fromBlock?: string;
  direction?: 'both' | 'sent' | 'received';
}

export async function handleGetWalletTransfers(input: GetWalletTransfersInput) {
  const client = new TransfersClient(input.chain);
  const from = input.fromBlock ?? '0x0';
  const dir = input.direction ?? 'both';

  if (dir === 'sent') return client.getOutbound(input.address, from);
  if (dir === 'received') return client.getInbound(input.address, from);
  return client.getBoth(input.address, from);
}
