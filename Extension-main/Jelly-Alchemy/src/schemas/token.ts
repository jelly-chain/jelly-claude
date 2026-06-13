import { isRecord, isString } from './common.js';

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logo: string | null;
}

export function isTokenInfo(val: unknown): val is TokenInfo {
  if (!isRecord(val)) return false;
  return (
    isString(val['address']) &&
    isString(val['name']) &&
    isString(val['symbol']) &&
    typeof val['decimals'] === 'number'
  );
}

export interface TokenBalance {
  token: TokenInfo;
  rawBalance: string;
  formattedBalance: string;
  valueUsd: number | null;
}

export function isTokenBalance(val: unknown): val is TokenBalance {
  if (!isRecord(val)) return false;
  return (
    isTokenInfo(val['token']) &&
    isString(val['rawBalance']) &&
    isString(val['formattedBalance'])
  );
}

export interface TokenPrice {
  symbol: string;
  address: string | null;
  priceUsd: number;
  currency: string;
  lastUpdatedAt: string;
}

export function isTokenPrice(val: unknown): val is TokenPrice {
  if (!isRecord(val)) return false;
  return (
    isString(val['symbol']) &&
    typeof val['priceUsd'] === 'number' &&
    isString(val['currency']) &&
    isString(val['lastUpdatedAt'])
  );
}
