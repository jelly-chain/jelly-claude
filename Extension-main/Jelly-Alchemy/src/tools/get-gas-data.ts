import { ToolDefinition } from './index.js';
import { RpcClient } from '../client/rpc.js';
import { ChainId } from '../config/chains.js';
import { hexToDecimal } from '../utils/format.js';

export const getGasDataTool: ToolDefinition = {
  name: 'get-gas-data',
  description: 'Get current gas price and estimate gas for a transaction on a given chain.',
  input_schema: {
    type: 'object',
    properties: {
      chain: {
        type: 'string',
        enum: ['eth-mainnet', 'bnb-mainnet', 'base-mainnet', 'arb-mainnet', 'polygon-mainnet', 'opbnb-mainnet'],
      },
      to: { type: 'string', description: 'Target address (for gas estimation)' },
      data: { type: 'string', description: 'Calldata for estimation' },
    },
    required: ['chain'],
  },
};

export interface GetGasDataInput {
  chain: ChainId;
  to?: string;
  data?: string;
}

export interface GasData {
  chain: ChainId;
  gasPriceWei: string;
  gasPriceGwei: string;
  estimatedGas?: string;
}

export async function handleGetGasData(input: GetGasDataInput): Promise<GasData> {
  const client = new RpcClient(input.chain);
  const gasPriceHex = await client.getGasPrice();
  const gasPriceWei = hexToDecimal(gasPriceHex).toString();
  const gasPriceGwei = (Number(gasPriceWei) / 1e9).toFixed(2);

  const result: GasData = { chain: input.chain, gasPriceWei, gasPriceGwei };

  if (input.to) {
    const estHex = await client.estimateGas({ to: input.to, data: input.data });
    result.estimatedGas = hexToDecimal(estHex).toString();
  }

  return result;
}
