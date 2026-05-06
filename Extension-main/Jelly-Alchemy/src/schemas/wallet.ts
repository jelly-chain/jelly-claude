import { isRecord, isString } from './common.js';

export interface WalletSummary {
  address: string;
  chain: string;
  nativeBalance: string;
  nativeBalanceEth: string;
  tokenCount: number;
  fetchedAt: string;
}

export function isWalletSummary(val: unknown): val is WalletSummary {
  if (!isRecord(val)) return false;
  return (
    isString(val['address']) &&
    isString(val['chain']) &&
    isString(val['nativeBalance']) &&
    isString(val['nativeBalanceEth']) &&
    typeof val['tokenCount'] === 'number' &&
    isString(val['fetchedAt'])
  );
}

export interface WalletActivity {
  address: string;
  sentCount: number;
  receivedCount: number;
  lastActiveBlock: string;
}

export function isWalletActivity(val: unknown): val is WalletActivity {
  if (!isRecord(val)) return false;
  return (
    isString(val['address']) &&
    typeof val['sentCount'] === 'number' &&
    typeof val['receivedCount'] === 'number' &&
    isString(val['lastActiveBlock'])
  );
}
