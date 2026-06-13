import { DataApiClient, TokenBalance } from '../client/data-api.js';
import { ChainId } from '../config/chains.js';
import { SimpleCache } from '../utils/caching.js';

export interface TokenBalancePage {
  address: string;
  chain: ChainId;
  balances: TokenBalance[];
  pageKey?: string;
  hasMore: boolean;
  fetchedAt: string;
}

export class TokenService {
  private readonly cache = new SimpleCache({ ttlSeconds: 30 });

  async getBalances(address: string, chain: ChainId, pageKey?: string): Promise<TokenBalancePage> {
    const cacheKey = `${chain}:${address}:${pageKey ?? ''}`;
    const cached = this.cache.get<TokenBalancePage>(cacheKey);
    if (cached) return cached;

    const client = new DataApiClient(chain);
    const res = await client.getTokenBalances(address, pageKey);

    const result: TokenBalancePage = {
      address,
      chain,
      balances: res.tokenBalances,
      pageKey: res.pageKey,
      hasMore: !!res.pageKey,
      fetchedAt: new Date().toISOString(),
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  async getAllBalances(address: string, chain: ChainId): Promise<TokenBalance[]> {
    const all: TokenBalance[] = [];
    let cursor: string | undefined;

    do {
      const page = await this.getBalances(address, chain, cursor);
      all.push(...page.balances);
      cursor = page.pageKey;
    } while (cursor);

    return all;
  }
}
