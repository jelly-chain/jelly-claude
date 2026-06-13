/** Token schema — ERC-20 metadata, prices, and flow events. */

export interface TokenMetadata {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply?: string;
  logoUrl?: string;
  coingeckoId?: string;
}

export interface TokenPrice {
  address: string;
  symbol: string;
  priceUsd: number;
  priceChange24h: number;
  volume24hUsd: number;
  marketCapUsd?: number;
  updatedAt: string;
}

export interface TokenFlowEvent {
  tokenAddress: string;
  symbol: string;
  from: string;
  to: string;
  formattedAmount: number;
  usdValue?: number;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  flowDirection: 'inflow' | 'outflow' | 'internal';
  isLargeTransfer: boolean;
}

export interface TokenFlowSummary {
  tokenAddress: string;
  symbol: string;
  windowLabel: string;
  totalInflowUsd: number;
  totalOutflowUsd: number;
  netFlowUsd: number;
  largeTransferCount: number;
  uniqueSenders: number;
  uniqueReceivers: number;
  events: TokenFlowEvent[];
  computedAt: string;
}

export function isTokenMetadata(v: unknown): v is TokenMetadata {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj['address'] === 'string' &&
    typeof obj['symbol'] === 'string' &&
    typeof obj['decimals'] === 'number'
  );
}

export function isTokenFlowEvent(v: unknown): v is TokenFlowEvent {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj['tokenAddress'] === 'string' &&
    typeof obj['from'] === 'string' &&
    typeof obj['to'] === 'string' &&
    typeof obj['formattedAmount'] === 'number' &&
    typeof obj['txHash'] === 'string'
  );
}
