import { env, AlchemyEnv } from '../config/env.js';
import { ChainId } from '../config/chains.js';
import { AlchemyError, AlchemyRateLimitError, AlchemyAuthError, AlchemyNetworkError } from '../utils/errors.js';

export interface AlchemyRequestOptions {
  method: string;
  params?: unknown[];
}

export interface AlchemyRpcResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: { code: number; message: string };
}

const CHAIN_URL_KEYS: Record<ChainId, keyof AlchemyEnv> = {
  'eth-mainnet': 'ethMainnetUrl',
  'bnb-mainnet': 'bnbMainnetUrl',
  'base-mainnet': 'baseMainnetUrl',
  'arb-mainnet': 'arbMainnetUrl',
  'polygon-mainnet': 'polygonMainnetUrl',
  'opbnb-mainnet': 'opBnbMainnetUrl',
  'solana-mainnet': 'solanaMainnetUrl',
};

/** Base Alchemy RPC client with typed request/response. All calls are stubs in v0.1. */
export class AlchemyClient {
  protected readonly rpcUrl: string;
  protected readonly apiKey: string;

  constructor(chain: ChainId, config: AlchemyEnv = env) {
    this.apiKey = config.apiKey;
    const key = CHAIN_URL_KEYS[chain];
    this.rpcUrl = config[key] as string;
  }

  protected async request<T>(options: AlchemyRequestOptions): Promise<T> {
    const body = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: options.method,
      params: options.params ?? [],
    });

    let response: Response;
    try {
      response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
    } catch (err) {
      throw new AlchemyNetworkError(err instanceof Error ? err.message : String(err));
    }

    if (response.status === 429) throw new AlchemyRateLimitError();
    if (response.status === 401 || response.status === 403) throw new AlchemyAuthError();

    const json = (await response.json()) as AlchemyRpcResponse<T>;

    if (json.error) {
      throw new AlchemyError(json.error.message, String(json.error.code), response.status);
    }

    if (json.result === undefined) {
      throw new AlchemyError('Empty result from Alchemy RPC');
    }

    return json.result;
  }

  protected async dataApiGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(this.rpcUrl.replace('/v2/', '/nft/v3/').split('/v2/')[0] + '/v3/' + this.apiKey + path);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        headers: { accept: 'application/json' },
      });
    } catch (err) {
      throw new AlchemyNetworkError(err instanceof Error ? err.message : String(err));
    }

    if (response.status === 429) throw new AlchemyRateLimitError();
    if (response.status === 401) throw new AlchemyAuthError();

    return response.json() as Promise<T>;
  }
}
