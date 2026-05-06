import { ToolDefinition } from './index.js';
import { PricesClient } from '../client/prices.js';

export const getTokenPriceTool: ToolDefinition = {
  name: 'get-token-price',
  description: 'Get the current USD price of a token by symbol or contract address.',
  input_schema: {
    type: 'object',
    properties: {
      symbols: { type: 'string', description: 'Comma-separated token symbols, e.g. "ETH,BNB,MATIC"' },
      address: { type: 'string', description: 'Contract address (alternative to symbol)' },
      network: {
        type: 'string',
        enum: ['eth-mainnet', 'bnb-mainnet', 'base-mainnet', 'arb-mainnet', 'polygon-mainnet'],
        description: 'Required when using address lookup',
      },
    },
  },
};

export interface GetTokenPriceInput {
  symbols?: string;
  address?: string;
  network?: string;
}

export async function handleGetTokenPrice(input: GetTokenPriceInput) {
  const client = new PricesClient();
  if (input.address && input.network) {
    return client.getTokenPricesByAddress([{ network: input.network, address: input.address }]);
  }
  const symbols = (input.symbols ?? 'ETH').split(',').map((s) => s.trim());
  return client.getTokenPricesBySymbol(symbols);
}
