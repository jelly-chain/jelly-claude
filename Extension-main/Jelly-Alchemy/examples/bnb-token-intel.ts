/**
 * Example: Get token intelligence on BNB Chain.
 * Run: npx tsx examples/bnb-token-intel.ts
 */
import { PriceService } from '../src/services/price-service.js';
import { ContractService } from '../src/services/contract-service.js';
import { isTokenPrice } from '../src/schemas/token.js';

const CAKE_ADDRESS = '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82'; // CAKE on BNB
const CHAIN = 'bnb-mainnet' as const;

async function main(): Promise<void> {
  const priceSvc = new PriceService();
  const contractSvc = new ContractService();

  const [prices, tokenInfo] = await Promise.all([
    priceSvc.getPricesBySymbol(['BNB', 'CAKE']),
    contractSvc.getTokenInfo(CAKE_ADDRESS, CHAIN),
  ]);

  console.log('=== BNB Chain Token Intel ===');
  for (const p of prices) {
    const priceDisplay = p.priceUsd !== null ? `$${p.priceUsd.toFixed(4)}` : 'unavailable';
    console.log(`${p.symbol}: ${priceDisplay}`);

    if (isTokenPrice(p)) {
      console.log(`  Last updated: ${p.lastUpdatedAt}`);
    }
  }

  console.log(`\nCAKE Token Info:`);
  console.log(`  Name: ${tokenInfo.name ?? 'N/A'}`);
  console.log(`  Symbol: ${tokenInfo.symbol ?? 'N/A'}`);
  console.log(`  Decimals: ${tokenInfo.decimals ?? 'N/A'}`);
}

main().catch(console.error);
