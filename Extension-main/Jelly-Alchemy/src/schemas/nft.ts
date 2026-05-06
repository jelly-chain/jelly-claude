import { isRecord, isString } from './common.js';

export interface NftAttribute {
  trait_type: string;
  value: string | number;
}

export interface NftSummary {
  contractAddress: string;
  tokenId: string;
  tokenType: string;
  name: string;
  description: string;
  imageUrl: string | null;
  attributes: NftAttribute[];
}

export function isNftSummary(val: unknown): val is NftSummary {
  if (!isRecord(val)) return false;
  return (
    isString(val['contractAddress']) &&
    isString(val['tokenId']) &&
    isString(val['tokenType']) &&
    isString(val['name'])
  );
}

export interface NftCollection {
  address: string;
  name: string | null;
  symbol: string | null;
  totalSupply: string | null;
  items: NftSummary[];
}

export function isNftCollection(val: unknown): val is NftCollection {
  if (!isRecord(val)) return false;
  return isString(val['address']) && Array.isArray(val['items']);
}
