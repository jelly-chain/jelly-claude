/** AlchemyPolygonClient — Polygon-specific Alchemy RPC + Data API client. */

import { env } from '../config/env.js';
import { AlchemyError } from '../utils/errors.js';

export interface AlchemyPolygonConfig {
  apiKey?: string;
  rpcUrl?: string;
  enabled?: boolean;
}

export interface AlchemyRequest {
  method: string;
  params: unknown[];
}

export interface AlchemyResponse<T = unknown> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: { code: number; message: string };
}

export class AlchemyPolygonClient {
  readonly name = 'AlchemyPolygon';
  readonly enabled: boolean;
  private readonly apiKey: string;
  private readonly rpcUrl: string;

  constructor(config: AlchemyPolygonConfig = {}) {
    this.apiKey = config.apiKey ?? env.alchemyApiKey;
    this.rpcUrl =
      config.rpcUrl ?? env.polygonMainnetUrl;
    this.enabled = !!(config.enabled !== false && this.apiKey);
  }

  private get dataApiBase(): string {
    return `https://polygon-mainnet.g.alchemy.com/data/v1/${this.apiKey}`;
  }

  protected async rpcCall<T>(method: string, params: unknown[]): Promise<T> {
    if (!this.enabled) {
      throw new AlchemyError('AlchemyPolygonClient is disabled — set ALCHEMY_API_KEY');
    }
    if (env.debug) {
      console.debug(`[AlchemyPolygon] RPC ${method}`);
    }
    const body: AlchemyRequest = { method, params };
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, ...body }),
    });
    if (!response.ok) {
      throw new AlchemyError(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = (await response.json()) as AlchemyResponse<T>;
    if (data.error) {
      throw new AlchemyError(`RPC error ${data.error.code}: ${data.error.message}`);
    }
    return data.result as T;
  }

  protected async dataApiGet<T>(endpoint: string): Promise<T> {
    if (!this.enabled) {
      throw new AlchemyError('AlchemyPolygonClient is disabled — set ALCHEMY_API_KEY');
    }
    const url = `${this.dataApiBase}${endpoint}`;
    if (env.debug) console.debug(`[AlchemyPolygon] GET ${url}`);
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
    });
    if (!response.ok) {
      throw new AlchemyError(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  }

  async getBlockNumber(): Promise<number> {
    const hex = await this.rpcCall<string>('eth_blockNumber', []);
    return parseInt(hex, 16);
  }

  async getBalance(address: string, block = 'latest'): Promise<string> {
    return this.rpcCall<string>('eth_getBalance', [address, block]);
  }

  async getTransactionCount(address: string, block = 'latest'): Promise<number> {
    const hex = await this.rpcCall<string>('eth_getTransactionCount', [address, block]);
    return parseInt(hex, 16);
  }

  async getCode(address: string): Promise<string> {
    return this.rpcCall<string>('eth_getCode', [address, 'latest']);
  }

  async getLogs(filter: {
    fromBlock?: string;
    toBlock?: string;
    address?: string | string[];
    topics?: (string | string[] | null)[];
  }): Promise<unknown[]> {
    return this.rpcCall<unknown[]>('eth_getLogs', [filter]);
  }
}
