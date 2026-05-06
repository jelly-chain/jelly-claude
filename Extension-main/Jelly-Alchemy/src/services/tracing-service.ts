import { AlchemyClient } from '../client/alchemy.js';
import { ChainId } from '../config/chains.js';
import { env } from '../config/env.js';
import { AlchemyUnsupportedChainError } from '../utils/errors.js';
import { supports } from '../config/capabilities.js';

export type TracerType = 'callTracer' | 'prestateTracer';

export interface TraceResult {
  hash: string;
  chain: ChainId;
  tracer: TracerType;
  trace: unknown;
  tracedAt: string;
}

class InternalTraceClient extends AlchemyClient {
  constructor(chain: ChainId) {
    super(chain, env);
  }

  async trace(hash: string, tracer: TracerType): Promise<unknown> {
    return this.request<unknown>({
      method: 'debug_traceTransaction',
      params: [hash, { tracer }],
    });
  }
}

export class TracingService {
  async traceTransaction(
    hash: string,
    chain: ChainId,
    tracer: TracerType = 'callTracer',
  ): Promise<TraceResult> {
    if (!supports(chain, 'supportsTrace')) {
      throw new AlchemyUnsupportedChainError(chain, 'tracing');
    }

    const client = new InternalTraceClient(chain);
    const trace = await client.trace(hash, tracer);

    return {
      hash,
      chain,
      tracer,
      trace,
      tracedAt: new Date().toISOString(),
    };
  }
}
