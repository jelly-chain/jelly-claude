/**
 * Example: Polygon Whale Scanner
 * Tracks a list of known whale addresses and surfaces their recent activity.
 */

import { DataApiClient } from '../src/client/data-api.js';
import { RpcClient } from '../src/client/rpc.js';
import { WalletService } from '../src/services/wallet-service.js';
import { WhaleScoutAgent } from '../src/subagents/whale-scout-agent.js';
import { buildWhaleTrackerPrompt } from '../src/prompts/whale-tracker.js';
import { isWhaleActivity } from '../src/schemas/signal.js';

const WHALE_WATCHLIST = [
  '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', // vitalik.eth
  '0x4b5057b2c87ec9e7c906bd0afe7b4df33eae3180', // example whale
];

async function run() {
  const config = { apiKey: process.env['ALCHEMY_API_KEY'], enabled: !!process.env['ALCHEMY_API_KEY'] };
  const dataApi = new DataApiClient(config);
  const rpc = new RpcClient(config);
  const walletService = new WalletService(dataApi, rpc);
  const agent = new WhaleScoutAgent(walletService);

  const output = await agent.run({
    addresses: WHALE_WATCHLIST,
    window: '24h',
    options: { thresholdUsd: 50_000 },
  });

  if (!output.success) {
    console.error('Agent error:', output.error);
    return;
  }

  const data = output.data as Record<string, unknown>;
  const activities = Array.isArray(data['whaleActivity']) ? data['whaleActivity'] : [];
  const totalNetFlow = typeof data['totalNetFlowUsd'] === 'number' ? data['totalNetFlowUsd'] : 0;

  const typedActivities = activities.filter(isWhaleActivity);

  const prompt = buildWhaleTrackerPrompt({
    activities: typedActivities,
    windowLabel: '24h',
    totalNetFlowUsd: totalNetFlow,
  });

  console.log(prompt);
}

run().catch(console.error);
