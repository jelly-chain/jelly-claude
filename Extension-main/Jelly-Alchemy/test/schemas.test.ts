import { describe, it, expect } from 'vitest';
import { isRecord, isString, isPaginatedResult } from '../src/schemas/common.js';
import { isWalletSummary, isWalletActivity } from '../src/schemas/wallet.js';
import { isTokenInfo, isTokenBalance, isTokenPrice } from '../src/schemas/token.js';
import { isNftSummary, isNftCollection } from '../src/schemas/nft.js';
import { isTransferSummary, isTransferPage } from '../src/schemas/transfer.js';
import { sampleWalletSummary } from './fixtures/wallet.js';

describe('Schema type guards', () => {
  it('isRecord: passes objects, rejects primitives and arrays', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ a: 1 })).toBe(true);
    expect(isRecord(null)).toBe(false);
    expect(isRecord([])).toBe(false);
    expect(isRecord('string')).toBe(false);
    expect(isRecord(42)).toBe(false);
  });

  it('isString: passes strings, rejects others', () => {
    expect(isString('hello')).toBe(true);
    expect(isString('')).toBe(true);
    expect(isString(42)).toBe(false);
    expect(isString(null)).toBe(false);
  });

  it('isPaginatedResult: validates shape', () => {
    const valid = { items: ['a', 'b'], hasMore: false };
    expect(isPaginatedResult(valid, isString)).toBe(true);
    expect(isPaginatedResult({ items: [42] }, isString)).toBe(false);
    expect(isPaginatedResult(null, isString)).toBe(false);
  });

  it('isWalletSummary: validates sample fixture', () => {
    expect(isWalletSummary(sampleWalletSummary)).toBe(true);
    expect(isWalletSummary({})).toBe(false);
    expect(isWalletSummary(null)).toBe(false);
  });

  it('isWalletActivity: validates shaped object', () => {
    const valid = { address: '0x1', sentCount: 5, receivedCount: 3, lastActiveBlock: '0x1A' };
    expect(isWalletActivity(valid)).toBe(true);
    expect(isWalletActivity({ address: '0x1' })).toBe(false);
  });

  it('isTokenInfo: validates shape', () => {
    const valid = { address: '0xa', name: 'USDC', symbol: 'USDC', decimals: 6, logo: null };
    expect(isTokenInfo(valid)).toBe(true);
    expect(isTokenInfo({ address: '0xa', name: 'X' })).toBe(false);
  });

  it('isTokenBalance: validates shape', () => {
    const token = { address: '0xa', name: 'USDC', symbol: 'USDC', decimals: 6, logo: null };
    const valid = { token, rawBalance: '0x100', formattedBalance: '256.000000', valueUsd: null };
    expect(isTokenBalance(valid)).toBe(true);
  });

  it('isTokenPrice: validates shape', () => {
    const valid = { symbol: 'ETH', address: null, priceUsd: 3000, currency: 'usd', lastUpdatedAt: '2026-05-06T00:00:00Z' };
    expect(isTokenPrice(valid)).toBe(true);
    expect(isTokenPrice({ symbol: 'ETH' })).toBe(false);
  });

  it('isNftSummary: validates shape', () => {
    const valid = {
      contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
      tokenId: '1',
      tokenType: 'ERC721',
      name: 'Bored Ape #1',
      description: '',
      imageUrl: null,
      attributes: [],
    };
    expect(isNftSummary(valid)).toBe(true);
    expect(isNftSummary({})).toBe(false);
  });

  it('isNftCollection: validates shape', () => {
    const valid = { address: '0xbc4ca', name: 'BAYC', symbol: 'BAYC', totalSupply: '10000', items: [] };
    expect(isNftCollection(valid)).toBe(true);
    expect(isNftCollection({ items: [] })).toBe(false);
  });

  it('isTransferSummary: validates shape', () => {
    const valid = {
      hash: '0xtx', from: '0xa', to: '0xb', asset: 'ETH',
      value: '1.0', category: 'external', blockNum: '0x1', direction: 'outbound',
    };
    expect(isTransferSummary(valid)).toBe(true);
    expect(isTransferSummary({})).toBe(false);
  });

  it('isTransferPage: validates shape', () => {
    const valid = { transfers: [], address: '0xa', pageKey: undefined, hasMore: false };
    expect(isTransferPage(valid)).toBe(true);
    expect(isTransferPage({ address: '0xa' })).toBe(false);
  });
});
