import { ToolDefinition } from './index.js';
import { SimulationClient, SimulationTx } from '../client/simulation.js';
import { ChainId } from '../config/chains.js';

export const simulateTransactionTool: ToolDefinition = {
  name: 'simulate-transaction',
  description: 'Simulate a transaction and preview asset changes without broadcasting it. Uses alchemy_simulateAssetChanges.',
  input_schema: {
    type: 'object',
    properties: {
      from: { type: 'string', description: 'Sender address' },
      to: { type: 'string', description: 'Recipient or contract address' },
      value: { type: 'string', description: 'ETH value in hex wei (e.g. "0xDE0B6B3A7640000" = 1 ETH)' },
      data: { type: 'string', description: 'ABI-encoded calldata' },
      chain: {
        type: 'string',
        enum: ['eth-mainnet', 'bnb-mainnet', 'base-mainnet', 'arb-mainnet', 'polygon-mainnet'],
      },
    },
    required: ['from', 'to', 'chain'],
  },
};

export interface SimulateTransactionInput {
  from: string;
  to: string;
  value?: string;
  data?: string;
  chain: ChainId;
}

export async function handleSimulateTransaction(input: SimulateTransactionInput) {
  const client = new SimulationClient(input.chain);
  const tx: SimulationTx = { from: input.from, to: input.to };
  if (input.value) tx.value = input.value;
  if (input.data) tx.data = input.data;
  return client.simulateAssetChanges(tx);
}
