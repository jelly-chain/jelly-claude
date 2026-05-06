import { PricesClient, TokenPrice } from '../client/prices.js';
import { SimpleCache } from '../utils/caching.js';

export interface PriceResult {
  symbol: string;
  address: string | null;
  priceUsd: number | null;
  currency: string;
  lastUpdatedAt: string | null;
  error: string | null;
}

export class PriceService {
  private readonly client = new PricesClient();
  private readonly cache = new SimpleCache({ ttlSeconds: 15 });

  async getPricesBySymbol(symbols: string[]): Promise<PriceResult[]> {
    const cacheKey = `symbols:${symbols.sort().join(',')}`;
    const cached = this.cache.get<PriceResult[]>(cacheKey);
    if (cached) return cached;

    const res = await this.client.getTokenPricesBySymbol(symbols);
    const results: PriceResult[] = res.data.map((d) => {
      const price: TokenPrice | undefined = d.prices[0];
      return {
        symbol: d.symbol,
        address: null,
        priceUsd: price ? parseFloat(price.value) : null,
        currency: price?.currency ?? 'usd',
        lastUpdatedAt: price?.lastUpdatedAt ?? null,
        error: d.error,
      };
    });

    this.cache.set(cacheKey, results);
    return results;
  }

  async getPriceByAddress(network: string, address: string): Promise<PriceResult> {
    const cacheKey = `addr:${network}:${address}`;
    const cached = this.cache.get<PriceResult>(cacheKey);
    if (cached) return cached;

    const res = await this.client.getTokenPricesByAddress([{ network, address }]);
    const first = res.data[0];
    const price: TokenPrice | undefined = first?.prices[0];

    const result: PriceResult = {
      symbol: '',
      address,
      priceUsd: price ? parseFloat(price.value) : null,
      currency: price?.currency ?? 'usd',
      lastUpdatedAt: price?.lastUpdatedAt ?? null,
      error: first?.error ?? null,
    };

    this.cache.set(cacheKey, result);
    return result;
  }
}
