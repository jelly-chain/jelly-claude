import { ToolDefinition } from './index.js';
import { RpcClient } from '../client/rpc.js';
import { ChainId } from '../config/chains.js';

export const getContractStateTool: ToolDefinition = {
  name: 'get-contract-state',
  description: 'Read state from a smart contract by calling a view function with encoded calldata.',
  input_schema: {
    type: 'object',
    properties: {
      contractAddress: { type: 'string', description: 'Contract address' },
      calldata: { type: 'string', description: 'ABI-encoded function calldata (0x…)' },
      chain: {
        type: 'string',
        enum: ['eth-mainnet', 'bnb-mainnet', 'base-mainnet', 'arb-mainnet', 'polygon-mainnet', 'opbnb-mainnet'],
      },
      block: { type: 'string', description: 'Block tag: "latest", "earliest", or hex block number' },
    },
    required: ['contractAddress', 'calldata', 'chain'],
  },
};

export interface GetContractStateInput {
  contractAddress: string;
  calldata: string;
  chain: ChainId;
  block?: string;
}

export interface GetContractStateOutput {
  contractAddress: string;
  result: string;
  block: string;
}

export async function handleGetContractState(input: GetContractStateInput): Promise<GetContractStateOutput> {
  const client = new RpcClient(input.chain);
  const block = input.block ?? 'latest';
  const result = await client.call(input.contractAddress, input.calldata, block);
  return { contractAddress: input.contractAddress, result, block };
}
