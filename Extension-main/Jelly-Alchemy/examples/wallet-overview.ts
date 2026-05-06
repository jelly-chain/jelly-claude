/**
 * Example: Get a full wallet overview on Ethereum mainnet.
 * Run: npx tsx examples/wallet-overview.ts
 */
import { WalletService } from '../src/services/wallet-service.js';
import { TokenService } from '../src/services/token-service.js';
import { TransferService } from '../src/services/transfer-service.js';
import { isWalletActivity } from '../src/schemas/wallet.js';

const ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // vitalik.eth

async function main(): Promise<void> {
  const walletSvc = new WalletService();
  const tokenSvc = new TokenService();
  const transferSvc = new TransferService();

  const [summary, tokens, activity] = await Promise.all([
    walletSvc.getSummary(ADDRESS, 'eth-mainnet'),
    tokenSvc.getBalances(ADDRESS, 'eth-mainnet'),
    transferSvc.getActivity(ADDRESS, 'eth-mainnet'),
  ]);

  console.log('=== Wallet Summary ===');
  console.log(`Address: ${summary.address}`);
  console.log(`Native Balance: ${summary.nativeBalanceEth} ETH`);
  console.log(`Tokens: ${tokens.balances.length}`);

  if (isWalletActivity(activity)) {
    console.log(`Sent: ${activity.sentCount}, Received: ${activity.receivedCount}`);
  } else {
    console.log(`Sent: ${activity.sent.length}, Received: ${activity.received.length}`);
  }
}

main().catch(console.error);
