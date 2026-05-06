/** Sample typed data for tests — no live HTTP calls. */

import { WalletOverview } from '../../src/schemas/wallet.js';
import { PolymarketMarket } from '../../src/schemas/market.js';
import { SignalBundle, FlowSignal, VolatilityReport, WhaleActivity } from '../../src/schemas/signal.js';

export const SAMPLE_WALLET_OVERVIEW: WalletOverview = {
  address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
  nativeBalance: 12.5,
  nativeBalanceUsd: 10.25,
  tokenBalances: [
    {
      tokenAddress: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
      symbol: 'USDC',
      decimals: 6,
      rawAmount: '1000000000',
      formattedAmount: 1000,
      usdValue: 1000,
    },
  ],
  nftCount: 3,
  transactionCount: 142,
  tags: ['active-trader'],
  fetchedAt: '2025-05-06T00:00:00.000Z',
};

export const SAMPLE_POLYMARKET_MARKET: PolymarketMarket = {
  conditionId: '0x1234567890abcdef1234567890abcdef12345678',
  questionId: '0xabcdef1234567890abcdef1234567890abcdef12',
  question: 'Will Bitcoin exceed $100,000 by end of 2025?',
  description: 'This market resolves YES if BTC/USD closes above $100,000 on December 31, 2025.',
  outcomes: ['YES', 'NO'],
  outcomePrices: [0.62, 0.38],
  volume: 5_000_000,
  volumeUsd: 5_000_000,
  openInterest: 1_200_000,
  liquidity: 800_000,
  status: 'active',
  startTime: '2025-01-01T00:00:00.000Z',
  endTime: '2025-12-31T23:59:59.000Z',
  resolutionSource: 'UMA oracle — Coinbase BTC/USD',
  tags: ['crypto', 'bitcoin'],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-05-06T00:00:00.000Z',
};

export const SAMPLE_FLOW_SIGNAL: FlowSignal = {
  tokenAddress: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
  symbol: 'USDC',
  from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
  to: '0x4bfb41d5b3570defd03c39a9a4d8de6bd8b8982e',
  formattedAmount: 500_000,
  usdValue: 500_000,
  txHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  blockNumber: 58_000_000,
  timestamp: '2025-05-06T00:00:00.000Z',
  isWhale: true,
  flowType: 'defi-interaction',
};

export const SAMPLE_VOLATILITY_REPORT: VolatilityReport = {
  regime: 'building',
  score: 0.52,
  windowLabel: '1h',
  volumeRatio: 2.4,
  priceRangePercent: 1.8,
  largeTransferCount: 7,
  blockRange: { from: 57_996_200, to: 57_998_000 },
  computedAt: '2025-05-06T00:00:00.000Z',
};

export const SAMPLE_SIGNAL_BUNDLE: SignalBundle = {
  chainId: 137,
  blockNumber: 58_000_000,
  signals: [],
  flowSignals: [SAMPLE_FLOW_SIGNAL],
  volatility: SAMPLE_VOLATILITY_REPORT,
  whaleActivity: [],
  generatedAt: '2025-05-06T00:00:00.000Z',
};

export const SAMPLE_WHALE_ACTIVITY: WhaleActivity = {
  address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
  label: 'vitalik.eth',
  activityType: 'accumulation',
  tokenFlows: [SAMPLE_FLOW_SIGNAL],
  netUsdFlow: 500_000,
  conviction: 'high',
  detectedAt: '2025-05-06T00:00:00.000Z',
};
