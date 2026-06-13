/**
 * Example: Polymarket Daily Digest
 * Fetches active markets, computes signals, and builds a Claude-ready prompt.
 */

import { PolymarketClient } from '../src/client/polymarket.js';
import { PolymarketService } from '../src/services/polymarket-service.js';
import { buildPolymarketPredictionPrompt } from '../src/prompts/polymarket-prediction.js';
import { isPolymarketMarket } from '../src/schemas/market.js';

async function run() {
  const client = new PolymarketClient({
    apiKey: process.env['POLYMARKET_API_KEY'],
    enabled: !!process.env['POLYMARKET_API_KEY'],
  });
  const service = new PolymarketService(client);

  const markets = await service.searchMarkets({ status: 'active', limit: 10 });
  console.log(`Found ${markets.length} active markets`);

  for (const raw of markets) {
    if (!isPolymarketMarket(raw)) continue;
    const market = raw;
    const signal = service.toMarketSignal(market);
    const prompt = buildPolymarketPredictionPrompt({
      market,
      signal,
      question: `What is the implied probability for: "${market.question}"?`,
    });
    console.log('\n---');
    console.log(prompt);
  }
}

run().catch(console.error);
