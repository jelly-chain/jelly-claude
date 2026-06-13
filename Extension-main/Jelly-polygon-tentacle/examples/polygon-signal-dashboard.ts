/**
 * Example: Polygon Signal Dashboard
 * Runs the full signal pipeline: flow agent + volatility agent + market signals.
 */

import { DataApiClient } from '../src/client/data-api.js';
import { RpcClient } from '../src/client/rpc.js';
import { PolymarketClient } from '../src/client/polymarket.js';
import { SignalAggregator } from '../src/client/signals.js';
import { TokenService } from '../src/services/token-service.js';
import { MarketService } from '../src/services/market-service.js';
import { PolymarketService } from '../src/services/polymarket-service.js';
import { VolatilityService } from '../src/services/volatility-service.js';
import { PolygonFlowAgent } from '../src/subagents/polygon-flow-agent.js';
import { PolymarketSignalAgent } from '../src/subagents/polymarket-signal-agent.js';
import { VolatilityWindowAgent } from '../src/subagents/volatility-window-agent.js';
import { buildPolygonSignalSummaryPrompt } from '../src/prompts/polygon-signal-summary.js';
import { emptySignalBundle, isVolatilityReport } from '../src/schemas/signal.js';

async function run() {
  const alchemyConfig = {
    apiKey: process.env['ALCHEMY_API_KEY'],
    enabled: !!process.env['ALCHEMY_API_KEY'],
  };
  const polyConfig = {
    apiKey: process.env['POLYMARKET_API_KEY'],
    enabled: true,
  };

  const dataApi = new DataApiClient(alchemyConfig);
  const rpc = new RpcClient(alchemyConfig);
  const polyClient = new PolymarketClient(polyConfig);
  const aggregator = new SignalAggregator(dataApi, polyClient);

  const tokenService = new TokenService(dataApi);
  const volatilityService = new VolatilityService(dataApi);
  const polyService = new PolymarketService(polyClient);

  const flowAgent = new PolygonFlowAgent(tokenService);
  const volatilityAgent = new VolatilityWindowAgent(volatilityService);
  const marketAgent = new PolymarketSignalAgent(polyService);

  console.log('Running all agents in parallel...');
  const [flowOut, volOut, marketOut] = await Promise.all([
    flowAgent.run({ addresses: [], window: '1h' }),
    volatilityAgent.run({ window: '1h' }),
    marketAgent.run({ options: { limit: 5 } }),
  ]);

  const bundle = emptySignalBundle(0);
  const volData = volOut.data as Record<string, unknown>;
  if (isVolatilityReport(volData['report'])) {
    bundle.volatility = volData['report'];
  }

  const summary = buildPolygonSignalSummaryPrompt({
    bundle,
    question: 'What is the current Polygon market regime?',
  });

  console.log('\n=== Signal Dashboard ===');
  console.log(summary);
  console.log('\nFlow agent success:', flowOut.success);
  console.log('Volatility regime:', bundle.volatility?.regime);
  console.log('Market agent success:', marketOut.success);
}

run().catch(console.error);
