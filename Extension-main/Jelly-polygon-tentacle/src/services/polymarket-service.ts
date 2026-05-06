/** PolymarketService — search, order books, signals, and resolutions. */

import { PolymarketClient, PolymarketSearchParams } from '../client/polymarket.js';
import {
  PolymarketMarket,
  PolymarketOrderBook,
  PolymarketResolution,
  MarketSignal,
  MarketOutcome,
  emptyOrderBook,
} from '../schemas/market.js';
import { clamp } from '../utils/math.js';

export class PolymarketService {
  constructor(private readonly client: PolymarketClient) {}

  async searchMarkets(params: PolymarketSearchParams = {}): Promise<PolymarketMarket[]> {
    return this.client.searchMarkets(params);
  }

  async getMarket(conditionId: string): Promise<PolymarketMarket | null> {
    return this.client.getMarket(conditionId);
  }

  async getOrderBook(conditionId: string, outcome: MarketOutcome = 'YES'): Promise<PolymarketOrderBook> {
    return this.client.getOrderBook(conditionId, outcome);
  }

  async getOpenInterest(conditionId: string): Promise<number> {
    return this.client.getOpenInterest(conditionId);
  }

  async getResolutions(limit = 20): Promise<PolymarketResolution[]> {
    return this.client.getResolutions(limit);
  }

  extractProbability(market: PolymarketMarket): number {
    return this.client.extractProbability(market);
  }

  computeOrderFlowImbalance(book: PolymarketOrderBook): number {
    const bidDepth = book.bids.reduce((sum, b) => sum + b.size, 0);
    const askDepth = book.asks.reduce((sum, a) => sum + a.size, 0);
    const total = bidDepth + askDepth;
    if (total === 0) return 0;
    return clamp((bidDepth - askDepth) / total, -1, 1);
  }

  toMarketSignal(market: PolymarketMarket, book?: PolymarketOrderBook): MarketSignal {
    const impliedYes = this.extractProbability(market);
    const imbalance = book ? this.computeOrderFlowImbalance(book) : 0;
    const strength = Math.abs(impliedYes - 0.5);
    return {
      conditionId: market.conditionId,
      question: market.question,
      impliedProbabilityYes: impliedYes,
      impliedProbabilityNo: clamp(1 - impliedYes, 0, 1),
      volumeChange24h: 0,
      orderFlowImbalance: imbalance,
      signalStrength: strength > 0.2 ? 'strong' : strength > 0.1 ? 'moderate' : 'weak',
      signalDirection: imbalance > 0.05 ? 'bullish' : imbalance < -0.05 ? 'bearish' : 'neutral',
      computedAt: new Date().toISOString(),
    };
  }
}
