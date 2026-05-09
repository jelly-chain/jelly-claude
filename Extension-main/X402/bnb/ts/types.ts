/**
 * Jelly x402 BNB SDK Type Definitions
 * BNB Chain (BSC) — EVM-compatible, Chain ID 56 (mainnet) / 97 (testnet)
 */

export type BNBNetwork = 'mainnet' | 'testnet';
export type BNBCurrency = 'BNB' | 'USDT' | 'USDC' | 'BUSD';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type GasSpeed = 'slow' | 'standard' | 'fast';

export interface BNBConfig {
  apiKey: string;
  baseUrl?: string;
  network?: BNBNetwork;
  rpcUrl?: string;
  chainId?: number;
  maxPaymentPerRequest?: number;
  gasSpeed?: GasSpeed;
  gasPriceGwei?: number;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  logger?: (message: string, level: LogLevel) => void;
}

export interface BNBPaymentRequest {
  amount: number;
  currency?: BNBCurrency;
  recipient: string;
  memo?: string;
  reference?: string;
  expiresIn?: number;
}

export interface BNBPaymentResponse {
  reference: string;
  amount: number;
  currency: BNBCurrency;
  recipient: string;
  expires: number;
  chainId: number;
  headers: BNBPaymentHeaders;
}

export interface BNBPaymentHeaders {
  'X-402-Version': string;
  'X-402-Amount': string;
  'X-402-Currency': string;
  'X-402-Recipient': string;
  'X-402-Reference': string;
  'X-402-Expires': string;
  'X-402-Chain-Id': string;
  'X-402-Network'?: string;
}

export interface BNBVerifyRequest {
  txHash: string;
  reference: string;
  expectedAmount: number;
  expectedRecipient: string;
  currency?: BNBCurrency;
}

export interface BNBVerifyResponse {
  verified: boolean;
  transaction: BNBTransactionDetails;
}

export interface BNBTransactionDetails {
  txHash: string;
  blockNumber: number;
  amount: number;
  currency: BNBCurrency;
  sender: string;
  recipient: string;
  confirmedAt: string;
  gasUsed: number;
  gasPrice: string;
  networkFee: string;
  chainId: number;
}

export interface BNBBalanceResponse {
  address: string;
  balances: {
    BNB: number;
    USDT: number;
    USDC: number;
    BUSD: number;
  };
}

export interface BNBTransactionHistoryRequest {
  address: string;
  limit?: number;
  before?: string;
  after?: string;
  currency?: BNBCurrency;
}

export interface BNBTransactionHistoryResponse {
  transactions: BNBTransactionDetails[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface BNBRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  maxPayment?: number;
  autoSign?: boolean;
}

export interface BNBResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
  paymentMade?: {
    amount: number;
    currency: BNBCurrency;
    txHash: string;
    gasUsed?: number;
  };
}

export interface BNBPaymentRequirement {
  amount: number;
  currency: BNBCurrency;
  recipient: string;
  reference: string;
  expires: number;
  chainId: number;
  network?: string;
}

export interface BNBAgentConfig {
  name: string;
  description?: string;
  maxDailySpend?: number;
  allowedRecipients?: string[];
  blockedRecipients?: string[];
  webhookUrl?: string;
}

export interface BNBAgentStats {
  totalPayments: number;
  totalSpent: {
    BNB: number;
    USDT: number;
    USDC: number;
  };
  last24Hours: {
    payments: number;
    spent: {
      BNB: number;
      USDT: number;
      USDC: number;
    };
  };
  totalGasPaid: string;
}

export interface BNBGasEstimate {
  slow: { gwei: number; estimatedSeconds: number };
  standard: { gwei: number; estimatedSeconds: number };
  fast: { gwei: number; estimatedSeconds: number };
}
