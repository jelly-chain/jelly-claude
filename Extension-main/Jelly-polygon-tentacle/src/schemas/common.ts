/** Common shared types and type guards. */

export interface TimestampedRecord {
  createdAt: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  cursor: string | null;
  hasMore: boolean;
  total?: number;
}

export interface AddressTag {
  address: string;
  label: string;
  type: 'wallet' | 'contract' | 'exchange' | 'protocol' | 'whale';
}

export interface TransactionRef {
  hash: string;
  blockNumber: number;
  timestamp: string;
  from: string;
  to: string;
}

export interface GasInfo {
  gasUsed: number;
  gasPrice: string;
  gasCostWei: string;
  gasCostMatic: number;
}

export interface TokenAmount {
  tokenAddress: string;
  symbol: string;
  decimals: number;
  rawAmount: string;
  formattedAmount: number;
  usdValue?: number;
}

export function isString(v: unknown): v is string {
  return typeof v === 'string';
}

export function isNumber(v: unknown): v is number {
  return typeof v === 'number' && !Number.isNaN(v);
}

export function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function isTimestampedRecord(v: unknown): v is TimestampedRecord {
  if (!isObject(v)) return false;
  return typeof v['createdAt'] === 'string';
}

export function isTransactionRef(v: unknown): v is TransactionRef {
  if (!isObject(v)) return false;
  return (
    typeof v['hash'] === 'string' &&
    typeof v['blockNumber'] === 'number' &&
    typeof v['timestamp'] === 'string' &&
    typeof v['from'] === 'string' &&
    typeof v['to'] === 'string'
  );
}

export function isTokenAmount(v: unknown): v is TokenAmount {
  if (!isObject(v)) return false;
  return (
    typeof v['tokenAddress'] === 'string' &&
    typeof v['symbol'] === 'string' &&
    typeof v['decimals'] === 'number' &&
    typeof v['rawAmount'] === 'string' &&
    typeof v['formattedAmount'] === 'number'
  );
}
