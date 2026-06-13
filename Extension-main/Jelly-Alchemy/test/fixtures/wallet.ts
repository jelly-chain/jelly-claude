import { WalletSummary } from '../../src/schemas/wallet.js';
import { WalletPortfolio } from '../../src/client/portfolio.js';

export const SAMPLE_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

export const sampleWalletSummary: WalletSummary = {
  address: SAMPLE_ADDRESS,
  chain: 'eth-mainnet',
  nativeBalance: '0xDE0B6B3A7640000',
  nativeBalanceEth: '1.00000000',
  tokenCount: 12,
  fetchedAt: '2026-05-06T00:00:00.000Z',
};

export const samplePortfolio: WalletPortfolio = {
  address: SAMPLE_ADDRESS,
  chain: 'eth-mainnet',
  nativeBalance: { balance: '0xDE0B6B3A7640000', valueUsd: null },
  tokens: [
    {
      contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      balance: '0x5F5E100',
      valueUsd: null,
      logo: null,
    },
  ],
  totalValueUsd: null,
  snapshotAt: '2026-05-06T00:00:00.000Z',
};
