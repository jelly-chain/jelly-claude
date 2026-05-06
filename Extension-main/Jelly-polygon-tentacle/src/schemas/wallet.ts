/** Wallet schema — Polygon address balances and token holdings. */

import { TokenAmount } from './common.js';

export interface WalletOverview {
  address: string;
  nativeBalance: number;
  nativeBalanceUsd?: number;
  tokenBalances: TokenAmount[];
  nftCount: number;
  transactionCount: number;
  firstSeenBlock?: number;
  lastActivityAt?: string;
  tags: string[];
  fetchedAt: string;
}

export interface WalletActivity {
  address: string;
  recentTransactions: WalletTransaction[];
  volumeUsd24h: number;
  interactedProtocols: string[];
  fetchedAt: string;
}

export interface WalletTransaction {
  hash: string;
  blockNumber: number;
  timestamp: string;
  type: 'send' | 'receive' | 'swap' | 'contract-call' | 'approval' | 'unknown';
  from: string;
  to: string;
  value: string;
  gasUsed: number;
  status: 'success' | 'failed';
  tokenTransfers?: TokenTransfer[];
}

export interface TokenTransfer {
  from: string;
  to: string;
  tokenAddress: string;
  symbol: string;
  decimals: number;
  rawAmount: string;
  formattedAmount: number;
  usdValue?: number;
}

export function isWalletOverview(v: unknown): v is WalletOverview {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj['address'] === 'string' &&
    typeof obj['nativeBalance'] === 'number' &&
    Array.isArray(obj['tokenBalances']) &&
    typeof obj['nftCount'] === 'number' &&
    typeof obj['transactionCount'] === 'number' &&
    Array.isArray(obj['tags']) &&
    typeof obj['fetchedAt'] === 'string'
  );
}

export function isWalletTransaction(v: unknown): v is WalletTransaction {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj['hash'] === 'string' &&
    typeof obj['blockNumber'] === 'number' &&
    typeof obj['timestamp'] === 'string' &&
    typeof obj['from'] === 'string' &&
    typeof obj['to'] === 'string'
  );
}

export function emptyWalletOverview(address: string): WalletOverview {
  return {
    address,
    nativeBalance: 0,
    tokenBalances: [],
    nftCount: 0,
    transactionCount: 0,
    tags: [],
    fetchedAt: new Date().toISOString(),
  };
}
