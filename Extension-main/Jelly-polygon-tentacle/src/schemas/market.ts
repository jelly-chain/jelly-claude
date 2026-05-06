/** Market schema — Polymarket prediction market and CTF Exchange types. */

export type MarketStatus = 'active' | 'closed' | 'resolved' | 'cancelled';
export type MarketOutcome = 'YES' | 'NO' | 'unknown';
export type MarketResolution = 'YES' | 'NO' | 'CANCELLED' | 'pending';

export interface PolymarketMarket {
  conditionId: string;
  questionId: string;
  question: string;
  description: string;
  outcomes: string[];
  outcomePrices: number[];
  volume: number;
  volumeUsd: number;
  openInterest: number;
  liquidity: number;
  status: MarketStatus;
  startTime: string;
  endTime: string;
  resolutionSource?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PolymarketOrderBookEntry {
  price: number;
  size: number;
}

export interface PolymarketOrderBook {
  conditionId: string;
  outcome: MarketOutcome;
  bids: PolymarketOrderBookEntry[];
  asks: PolymarketOrderBookEntry[];
  bestBid: number;
  bestAsk: number;
  mid: number;
  spread: number;
  depth: number;
  fetchedAt: string;
}

export interface PolymarketResolution {
  conditionId: string;
  question: string;
  resolution: MarketResolution;
  resolvedAt?: string;
  resolvedOutcome?: string;
  umaRequestId?: string;
}

export interface MarketSignal {
  conditionId: string;
  question: string;
  impliedProbabilityYes: number;
  impliedProbabilityNo: number;
  volumeChange24h: number;
  orderFlowImbalance: number;
  signalStrength: 'weak' | 'moderate' | 'strong';
  signalDirection: 'bullish' | 'bearish' | 'neutral';
  computedAt: string;
}

export function isPolymarketMarket(v: unknown): v is PolymarketMarket {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj['conditionId'] === 'string' &&
    typeof obj['question'] === 'string' &&
    Array.isArray(obj['outcomes']) &&
    Array.isArray(obj['outcomePrices'])
  );
}

export function isMarketSignal(v: unknown): v is MarketSignal {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj['conditionId'] === 'string' &&
    typeof obj['impliedProbabilityYes'] === 'number' &&
    typeof obj['signalStrength'] === 'string'
  );
}

export function emptyOrderBook(conditionId: string, outcome: MarketOutcome): PolymarketOrderBook {
  return {
    conditionId,
    outcome,
    bids: [],
    asks: [],
    bestBid: 0,
    bestAsk: 1,
    mid: 0.5,
    spread: 1,
    depth: 0,
    fetchedAt: new Date().toISOString(),
  };
}
