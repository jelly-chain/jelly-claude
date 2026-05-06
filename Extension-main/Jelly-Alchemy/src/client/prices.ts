import { AlchemyClient } from './alchemy.js';
import { ChainId } from '../config/chains.js';
import { env } from '../config/env.js';

export interface TokenPrice {
  currency: string;
  value: string;
  lastUpdatedAt: string;
}

export interface TokenPriceResult {
  address: string;
  prices: TokenPrice[];
  error: string | null;
}

export interface TokenPricesResponse {
  data: TokenPriceResult[];
}

export interface TokenPriceBySymbolResult {
  symbol: string;
  prices: TokenPrice[];
  error: string | null;
}

export interface TokenPricesBySymbolResponse {
  data: TokenPriceBySymbolResult[];
}

/** Alchemy Token Prices API client. */
export class PricesClient extends AlchemyClient {
  constructor(chain: ChainId = 'eth-mainnet') {
    super(chain, env);
  }

  async getTokenPricesByAddress(
    addresses: { network: string; address: string }[],
  ): Promise<TokenPricesResponse> {
    return this.request<TokenPricesResponse>({
      method: 'alchemy_getTokenPrices',
      params: [{ addresses }],
    });
  }

  async getTokenPricesBySymbol(symbols: string[]): Promise<TokenPricesBySymbolResponse> {
    return this.request<TokenPricesBySymbolResponse>({
      method: 'alchemy_getTokenPrices',
      params: [{ symbols }],
    });
  }
}
