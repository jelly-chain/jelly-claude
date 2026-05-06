import { describe, it, expect } from 'vitest';
import { PolymarketService } from '../src/services/polymarket-service.js';
import { LiquidityService } from '../src/services/liquidity-service.js';
import { WebhookService } from '../src/services/webhook-service.js';
import { PolymarketClient } from '../src/client/polymarket.js';
import { RpcClient } from '../src/client/rpc.js';
import { WebhooksClient } from '../src/client/webhooks.js';
import { SAMPLE_POLYMARKET_MARKET } from './fixtures/sample-data.js';
import { emptyOrderBook } from '../src/schemas/market.js';

describe('PolymarketService', () => {
  const client = new PolymarketClient({ enabled: false });
  const service = new PolymarketService(client);

  it('instantiates without throwing', () => {
    expect(service).toBeDefined();
  });

  it('extractProbability returns value from outcomePrices[0]', () => {
    const prob = service.extractProbability(SAMPLE_POLYMARKET_MARKET);
    expect(prob).toBe(0.62);
  });

  it('extractProbability returns 0.5 for empty outcomePrices', () => {
    const market = { ...SAMPLE_POLYMARKET_MARKET, outcomePrices: [] };
    const prob = service.extractProbability(market);
    expect(prob).toBe(0.5);
  });

  it('computeOrderFlowImbalance returns 0 for empty book', () => {
    const book = emptyOrderBook('0xabc', 'YES');
    const imbalance = service.computeOrderFlowImbalance(book);
    expect(imbalance).toBe(0);
  });

  it('computeOrderFlowImbalance clamps to [-1, 1]', () => {
    const book = emptyOrderBook('0xabc', 'YES');
    const bigBids = { ...book, bids: [{ price: 0.9, size: 999999 }], asks: [{ price: 0.91, size: 1 }] };
    const imbalance = service.computeOrderFlowImbalance(bigBids);
    expect(imbalance).toBeGreaterThanOrEqual(-1);
    expect(imbalance).toBeLessThanOrEqual(1);
  });

  it('toMarketSignal builds a MarketSignal from a market', () => {
    const signal = service.toMarketSignal(SAMPLE_POLYMARKET_MARKET);
    expect(signal.conditionId).toBe(SAMPLE_POLYMARKET_MARKET.conditionId);
    expect(signal.impliedProbabilityYes).toBe(0.62);
    expect(signal.impliedProbabilityNo).toBeCloseTo(0.38, 5);
    expect(['weak', 'moderate', 'strong']).toContain(signal.signalStrength);
    expect(['bullish', 'bearish', 'neutral']).toContain(signal.signalDirection);
  });
});

describe('LiquidityService', () => {
  const rpc = new RpcClient({ enabled: false });
  const service = new LiquidityService(rpc);

  it('instantiates without throwing', () => {
    expect(service).toBeDefined();
  });

  it('getLiquidityEvents returns [] when provider is disabled', async () => {
    const events = await service.getLiquidityEvents('1h');
    expect(Array.isArray(events)).toBe(true);
  });
});

describe('WebhookService', () => {
  const client = new WebhooksClient('');
  const service = new WebhookService(client);

  it('instantiates without throwing', () => {
    expect(service).toBeDefined();
  });

  it('listWatched returns empty array initially', () => {
    expect(service.listWatched()).toHaveLength(0);
  });

  it('isWatched returns false for an unknown address', () => {
    expect(service.isWatched('0xdeadbeef')).toBe(false);
  });

  it('listWebhooks resolves to an array', async () => {
    const webhooks = await service.listWebhooks();
    expect(Array.isArray(webhooks)).toBe(true);
  });
});
