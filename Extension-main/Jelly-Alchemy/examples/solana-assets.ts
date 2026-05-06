/**
 * Example: Fetch Solana assets by owner using the DAS API.
 * Run: npx tsx examples/solana-assets.ts
 */
import { SolanaClient } from '../src/client/solana.js';

const OWNER = 'vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKptps'; // example Solana address

async function main(): Promise<void> {
  const client = new SolanaClient();

  console.log('=== Solana Assets by Owner ===');
  console.log(`Owner: ${OWNER}`);

  const page = await client.getAssetsByOwner(OWNER, 1, 10);

  console.log(`Total assets: ${page.total}`);
  console.log(`Showing: ${page.items.length}`);

  for (const asset of page.items) {
    const name = asset.content.metadata.name || '(unnamed)';
    const symbol = asset.content.metadata.symbol || '';
    console.log(`  - ${name} ${symbol ? `[${symbol}]` : ''} (${asset.id.slice(0, 12)}…)`);
  }

  if (page.items.length > 0) {
    const first = page.items[0];
    if (first) {
      console.log('\n=== First Asset Detail ===');
      const detail = await client.getAsset(first.id);
      console.log(`ID: ${detail.id}`);
      console.log(`Name: ${detail.content.metadata.name}`);
      console.log(`Owner: ${detail.ownership.owner}`);
      console.log(`Compressed: ${detail.compression.compressed}`);
    }
  }
}

main().catch(console.error);
