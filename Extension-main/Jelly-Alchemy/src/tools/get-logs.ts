import { ToolDefinition } from './index.js';
import { RpcClient } from '../client/rpc.js';
import { ChainId } from '../config/chains.js';

export const getLogsTool: ToolDefinition = {
  name: 'get-logs',
  description: 'Fetch raw event logs from a contract using eth_getLogs with topic filtering.',
  input_schema: {
    type: 'object',
    properties: {
      chain: {
        type: 'string',
        enum: ['eth-mainnet', 'bnb-mainnet', 'base-mainnet', 'arb-mainnet', 'polygon-mainnet', 'opbnb-mainnet'],
      },
      address: { type: 'string', description: 'Contract address to fetch logs from' },
      fromBlock: { type: 'string', description: 'Start block (hex)' },
      toBlock: { type: 'string', description: 'End block (hex) or "latest"' },
      topic0: { type: 'string', description: 'Event signature hash (keccak256)' },
    },
    required: ['chain', 'fromBlock'],
  },
};

export interface GetLogsInput {
  chain: ChainId;
  address?: string;
  fromBlock: string;
  toBlock?: string;
  topic0?: string;
}

export async function handleGetLogs(input: GetLogsInput) {
  const client = new RpcClient(input.chain);
  const filter: { fromBlock: string; toBlock: string; address?: string; topics?: string[] } = {
    fromBlock: input.fromBlock,
    toBlock: input.toBlock ?? 'latest',
  };
  if (input.address) filter.address = input.address;
  if (input.topic0) filter.topics = [input.topic0];
  return client.getLogs(filter);
}
