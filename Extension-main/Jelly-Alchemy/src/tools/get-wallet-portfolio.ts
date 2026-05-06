import { ToolDefinition } from './index.js';
import { PortfolioClient } from '../client/portfolio.js';
import { ChainId } from '../config/chains.js';

export const getWalletPortfolioTool: ToolDefinition = {
  name: 'get-wallet-portfolio',
  description: 'Get a full portfolio snapshot for a wallet: native balance + all ERC-20 tokens with USD values where available.',
  input_schema: {
    type: 'object',
    properties: {
      address: { type: 'string', description: 'Wallet address' },
      chain: {
        type: 'string',
        enum: ['eth-mainnet', 'bnb-mainnet', 'base-mainnet', 'arb-mainnet', 'polygon-mainnet', 'opbnb-mainnet'],
      },
    },
    required: ['address', 'chain'],
  },
};

export interface GetWalletPortfolioInput {
  address: string;
  chain: ChainId;
}

export async function handleGetWalletPortfolio(input: GetWalletPortfolioInput) {
  const client = new PortfolioClient(input.chain);
  return client.getPortfolio(input.address);
}
