import { ToolDefinition } from './index.js';
import { AlchemyClient } from '../client/alchemy.js';
import { ChainId } from '../config/chains.js';
import { env } from '../config/env.js';

export const traceTransactionTool: ToolDefinition = {
  name: 'trace-transaction',
  description: 'Trace a transaction using debug_traceTransaction to inspect internal calls and state changes.',
  input_schema: {
    type: 'object',
    properties: {
      hash: { type: 'string', description: 'Transaction hash' },
      chain: {
        type: 'string',
        enum: ['eth-mainnet', 'bnb-mainnet', 'arb-mainnet', 'polygon-mainnet'],
      },
      tracer: { type: 'string', description: '"callTracer" or "prestateTracer"', enum: ['callTracer', 'prestateTracer'] },
    },
    required: ['hash', 'chain'],
  },
};

export interface TraceTransactionInput {
  hash: string;
  chain: ChainId;
  tracer?: 'callTracer' | 'prestateTracer';
}

class TraceClient extends AlchemyClient {
  constructor(chain: ChainId) {
    super(chain, env);
  }

  async traceTransaction(hash: string, tracer = 'callTracer'): Promise<unknown> {
    return this.request<unknown>({
      method: 'debug_traceTransaction',
      params: [hash, { tracer }],
    });
  }
}

export async function handleTraceTransaction(input: TraceTransactionInput) {
  const client = new TraceClient(input.chain);
  return client.traceTransaction(input.hash, input.tracer ?? 'callTracer');
}
