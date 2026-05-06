/**
 * Example: Build a multi-chain EVM portfolio snapshot.
 * Run: npx tsx examples/evm-portfolio.ts
 */
import { PortfolioService } from '../src/services/portfolio-service.js';
import { EVM_CHAINS } from '../src/config/chains.js';

const ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

async function main(): Promise<void> {
  const svc = new PortfolioService();

  const portfolio = await svc.getMultiChainPortfolio(ADDRESS, EVM_CHAINS.slice(0, 3));

  console.log('=== Multi-Chain Portfolio ===');
  console.log(`Address: ${portfolio.address}`);
  console.log(`Chains Checked: ${portfolio.chains.length}`);
  console.log(`Total Token Positions: ${portfolio.totalTokenCount}`);
  console.log(`Snapshot: ${portfolio.snapshotAt}`);

  for (const chain of portfolio.chains) {
    console.log(`\n[${chain.chain}]`);
    console.log(`  Native Balance: ${chain.nativeBalance.balance} (raw)`);
    console.log(`  ERC-20 Tokens: ${chain.tokens.length}`);
  }
}

main().catch(console.error);
