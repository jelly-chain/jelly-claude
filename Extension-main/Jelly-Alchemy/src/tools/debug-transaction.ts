import { ToolDefinition } from './index.js';
import { AlchemyClient } from '../client/alchemy.js';
import { ChainId } from '../config/chains.js';
import { env } from '../config/env.js';

export const debugTransactionTool: ToolDefinition = {
  name: 'debug-transaction',
  description: 'Debug a failed transaction using alchemy_simulateAssetChanges and debug_traceTransaction together.',
  input_schema: {
    type: 'object',
    properties: {
      hash: { type: 'string', description: 'Transaction hash to debug' },
      chain: {
        type: 'string',
        enum: ['eth-mainnet', 'bnb-mainnet', 'arb-mainnet', 'polygon-mainnet'],
      },
    },
    required: ['hash', 'chain'],
  },
};

export interface DebugTransactionInput {
  hash: string;
  chain: ChainId;
}

class DebugClient extends AlchemyClient {
  constructor(chain: ChainId) {
    super(chain, env);
  }

  async getReceiptAndTrace(hash: string): Promise<{ receipt: unknown; trace: unknown }> {
    const [receipt, trace] = await Promise.all([
      this.request<unknown>({ method: 'eth_getTransactionReceipt', params: [hash] }),
      this.request<unknown>({ method: 'debug_traceTransaction', params: [hash, { tracer: 'callTracer' }] }),
    ]);
    return { receipt, trace };
  }
}

export interface DebugResult {
  hash: string;
  chain: ChainId;
  receipt: unknown;
  trace: unknown;
  summary: string;
}

export async function handleDebugTransaction(input: DebugTransactionInput): Promise<DebugResult> {
  const client = new DebugClient(input.chain);
  const { receipt, trace } = await client.getReceiptAndTrace(input.hash);
  const receiptRecord = typeof receipt === 'object' && receipt !== null ? receipt as Record<string, unknown> : {};
  const status = receiptRecord['status'];
  const summary = status === '0x1' ? 'Transaction succeeded' : 'Transaction reverted';
  return { hash: input.hash, chain: input.chain, receipt, trace, summary };
}
