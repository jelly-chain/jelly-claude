/**
 * X402 SDK Type Definitions
 */

export interface X402Config {
  apiKey: string;
  baseUrl?: string;
  network?: 'mainnet-beta' | 'devnet' | 'testnet';
  rpcUrl?: string;
  maxPaymentPerRequest?: number;
  commitment?: 'processed' | 'confirmed' | 'finalized';
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  logger?: (message: string, level: LogLevel) => void;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface PaymentRequest {
  amount: number;
  currency: 'SOL' | 'USDC';
  recipient: string;
  memo?: string;
  reference?: string;
  expiresIn?: number;
}

export interface PaymentResponse {
  reference: string;
  amount: number;
  currency: 'SOL' | 'USDC';
  recipient: string;
  expires: number;
  headers: X402Headers;
}

export interface X402Headers {
  'X-402-Version': string;
  'X-402-Amount': string;
  'X-402-Currency': string;
  'X-402-Recipient': string;
  'X-402-Reference': string;
  'X-402-Expires': string;
  'X-402-Network'?: string;
}

export interface VerifyRequest {
  signature: string;
  reference: string;
  expectedAmount: number;
  expectedRecipient: string;
}

export interface VerifyResponse {
  verified: boolean;
  transaction: TransactionDetails;
}

export interface TransactionDetails {
  signature: string;
  amount: number;
  currency: 'SOL' | 'USDC';
  sender: string;
  recipient: string;
  confirmedAt: string;
  slot: number;
  fee?: number;
}

export interface BalanceResponse {
  address: string;
  balances: {
    SOL: number;
    USDC: number;
  };
}

export interface TransactionHistoryRequest {
  address: string;
  limit?: number;
  before?: string;
  after?: string;
}

export interface TransactionHistoryResponse {
  transactions: TransactionDetails[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  maxPayment?: number;
  autoSign?: boolean;
}

export interface X402Response<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
  paymentMade?: {
    amount: number;
    currency: string;
    signature: string;
  };
}

export interface PaymentRequirement {
  amount: number;
  currency: 'SOL' | 'USDC';
  recipient: string;
  reference: string;
  expires: number;
  network?: string;
}

export interface AgentConfig {
  name: string;
  description?: string;
  maxDailySpend?: number;
  allowedRecipients?: string[];
  blockedRecipients?: string[];
  webhookUrl?: string;
}

export interface AgentStats {
  totalPayments: number;
  totalSpent: {
    SOL: number;
    USDC: number;
  };
  last24Hours: {
    payments: number;
    spent: {
      SOL: number;
      USDC: number;
    };
  };
}
