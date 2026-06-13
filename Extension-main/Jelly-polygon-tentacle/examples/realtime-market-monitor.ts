/**
 * Example: Realtime Market Monitor
 * Combines webhook address watching with Polymarket signal scanning.
 */

import { WebhooksClient } from '../src/client/webhooks.js';
import { PolymarketClient } from '../src/client/polymarket.js';
import { WebhookService } from '../src/services/webhook-service.js';
import { PolymarketService } from '../src/services/polymarket-service.js';
import { getToolDefinitions } from '../src/tools/index.js';
import { isPolymarketMarket } from '../src/schemas/market.js';

const MONITORED_ADDRESSES = [
  '0x4bfb41d5b3570defd03c39a9a4d8de6bd8b8982e', // Polymarket CTF Exchange
];

const CALLBACK_URL = process.env['WEBHOOK_CALLBACK_URL'] ?? 'https://example.com/webhook';

async function run() {
  const webhookClient = new WebhooksClient(process.env['ALCHEMY_API_KEY'] ?? '');
  const polyClient = new PolymarketClient({
    apiKey: process.env['POLYMARKET_API_KEY'],
    enabled: true,
  });

  const webhookService = new WebhookService(webhookClient);
  const polyService = new PolymarketService(polyClient);

  console.log('Registering address monitors...');
  for (const address of MONITORED_ADDRESSES) {
    try {
      const watched = await webhookService.watchAddress(address, CALLBACK_URL, 'polymarket-ctf');
      console.log(`  Watching ${address} → webhook ${watched.webhookId}`);
    } catch (err) {
      console.warn(`  Could not watch ${address}:`, err);
    }
  }

  console.log('\nFetching high-volume Polymarket markets...');
  const markets = await polyService.searchMarkets({ status: 'active', limit: 5 });
  for (const raw of markets) {
    if (!isPolymarketMarket(raw)) continue;
    const signal = polyService.toMarketSignal(raw);
    console.log(`  ${signal.question.slice(0, 60)}... → YES: ${(signal.impliedProbabilityYes * 100).toFixed(1)}% [${signal.signalStrength}]`);
  }

  console.log('\nAvailable Claude tools:');
  const tools = getToolDefinitions();
  for (const tool of tools) {
    console.log(`  - ${tool.name}`);
  }
}

run().catch(console.error);
