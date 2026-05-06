/** Polymarket client — CTF Exchange reads, CLOB API, market metadata, order-book snapshots. */

import { env } from '../config/env.js';
import { PolymarketError } from '../utils/errors.js';
import {
  PolymarketMarket,
  PolymarketOrderBook,
  PolymarketResolution,
  MarketOutcome,
  emptyOrderBook,
} from '../schemas/market.js';

export interface PolymarketClientConfig {
  apiKey?: string;
  enabled?: boolean;
  clobApiBase?: string;
  dataApiBase?: string;
}

export interface PolymarketSearchParams {
  query?: string;
  tag?: string;
  status?: 'active' | 'closed' | 'resolved';
  limit?: number;
  cursor?: string;
}

export class PolymarketClient {
  readonly name = 'Polymarket';
  readonly enabled: boolean;
  private readonly apiKey: string;
  private readonly clobBase: string;
  private readonly dataBase: string;

  constructor(config: PolymarketClientConfig = {}) {
    this.apiKey = config.apiKey ?? env.polymarketApiKey;
    this.enabled = config.enabled !== false;
    this.clobBase = config.clobApiBase ?? 'https://clob.polymarket.com';
    this.dataBase = config.dataApiBase ?? 'https://gamma-api.polymarket.com';
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { accept: 'application/json' };
    if (this.apiKey) h['Authorization'] = `Bearer ${this.apiKey}`;
    return h;
  }

  private async get<T>(url: string): Promise<T> {
    if (!this.enabled) {
      throw new PolymarketError('PolymarketClient is disabled');
    }
    if (env.debug) console.debug(`[Polymarket] GET ${url}`);
    const response = await fetch(url, { headers: this.headers() });
    if (!response.ok) {
      throw new PolymarketError(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  }

  async searchMarkets(params: PolymarketSearchParams = {}): Promise<PolymarketMarket[]> {
    const qs = new URLSearchParams();
    if (params.query) qs.set('q', params.query);
    if (params.status) qs.set('status', params.status);
    if (params.tag) qs.set('tag', params.tag);
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.cursor) qs.set('next_cursor', params.cursor);
    const data = await this.get<{ data: unknown[] }>(`${this.dataBase}/markets?${qs}`);
    return (Array.isArray(data?.data) ? data.data : []) as PolymarketMarket[];
  }

  async getMarket(conditionId: string): Promise<PolymarketMarket | null> {
    try {
      return await this.get<PolymarketMarket>(`${this.dataBase}/markets/${conditionId}`);
    } catch {
      return null;
    }
  }

  async getOrderBook(
    conditionId: string,
    outcome: MarketOutcome = 'YES',
  ): Promise<PolymarketOrderBook> {
    try {
      const data = await this.get<Record<string, unknown>>(
        `${this.clobBase}/book?token_id=${conditionId}&side=${outcome}`,
      );
      return this.parseOrderBook(conditionId, outcome, data);
    } catch {
      return emptyOrderBook(conditionId, outcome);
    }
  }

  async getOpenInterest(conditionId: string): Promise<number> {
    try {
      const data = await this.get<Record<string, unknown>>(
        `${this.clobBase}/open-interest?token_id=${conditionId}`,
      );
      return typeof data['openInterest'] === 'number' ? data['openInterest'] : 0;
    } catch {
      return 0;
    }
  }

  async getResolutions(limit = 50): Promise<PolymarketResolution[]> {
    try {
      const data = await this.get<{ data: unknown[] }>(
        `${this.dataBase}/markets?status=resolved&limit=${limit}`,
      );
      return (Array.isArray(data?.data) ? data.data : []) as PolymarketResolution[];
    } catch {
      return [];
    }
  }

  extractProbability(market: PolymarketMarket): number {
    if (!Array.isArray(market.outcomePrices) || market.outcomePrices.length === 0) return 0.5;
    return market.outcomePrices[0] ?? 0.5;
  }

  private parseOrderBook(
    conditionId: string,
    outcome: MarketOutcome,
    raw: Record<string, unknown>,
  ): PolymarketOrderBook {
    const bids = Array.isArray(raw['bids'])
      ? (raw['bids'] as Array<Record<string, unknown>>).map((b) => ({
          price: Number(b['price'] ?? 0),
          size: Number(b['size'] ?? 0),
        }))
      : [];
    const asks = Array.isArray(raw['asks'])
      ? (raw['asks'] as Array<Record<string, unknown>>).map((a) => ({
          price: Number(a['price'] ?? 0),
          size: Number(a['size'] ?? 0),
        }))
      : [];
    const bestBid = bids[0]?.price ?? 0;
    const bestAsk = asks[0]?.price ?? 1;
    const mid = (bestBid + bestAsk) / 2;
    return {
      conditionId,
      outcome,
      bids,
      asks,
      bestBid,
      bestAsk,
      mid,
      spread: bestAsk - bestBid,
      depth: bids.length + asks.length,
      fetchedAt: new Date().toISOString(),
    };
  }
}
