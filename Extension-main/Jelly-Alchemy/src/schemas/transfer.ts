import { isRecord, isString } from './common.js';

export type TransferDirection = 'inbound' | 'outbound';

export interface TransferSummary {
  hash: string;
  from: string;
  to: string;
  asset: string;
  value: string;
  category: string;
  blockNum: string;
  direction: TransferDirection;
}

export function isTransferSummary(val: unknown): val is TransferSummary {
  if (!isRecord(val)) return false;
  return (
    isString(val['hash']) &&
    isString(val['from']) &&
    isString(val['to']) &&
    isString(val['asset']) &&
    isString(val['category']) &&
    isString(val['blockNum'])
  );
}

export interface TransferPage {
  transfers: TransferSummary[];
  pageKey?: string;
  hasMore: boolean;
  address: string;
}

export function isTransferPage(val: unknown): val is TransferPage {
  if (!isRecord(val)) return false;
  return Array.isArray(val['transfers']) && isString(val['address']);
}
