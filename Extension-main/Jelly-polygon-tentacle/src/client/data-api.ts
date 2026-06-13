/** Data API client — token balances, portfolio, and price endpoints for Polygon. */

import { AlchemyPolygonClient } from './alchemy-polygon.js';

export interface AlchemyTokenBalance {
  contractAddress: string;
  tokenBalance: string;
  error?: string;
}

export interface AlchemyTokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
}

export interface AlchemyNftBalance {
  ownedNfts: unknown[];
  totalCount: number;
}

export interface AlchemyAssetTransfer {
  from: string;
  to: string | null;
  value: number | null;
  asset: string | null;
  tokenId?: string;
  rawContract: { value: string; address: string; decimal: string };
  hash: string;
  blockNum: string;
  category: string;
  metadata: { blockTimestamp: string };
}

export class DataApiClient extends AlchemyPolygonClient {
  async getTokenBalances(
    address: string,
    tokenAddresses?: string[],
  ): Promise<AlchemyTokenBalance[]> {
    const params: unknown[] = tokenAddresses
      ? [address, tokenAddresses]
      : [address, 'erc20'];
    return this.rpcCall<{ tokenBalances: AlchemyTokenBalance[] }>('alchemy_getTokenBalances', params)
      .then((r) => r.tokenBalances);
  }

  async getTokenMetadata(tokenAddress: string): Promise<AlchemyTokenMetadata> {
    return this.rpcCall<AlchemyTokenMetadata>('alchemy_getTokenMetadata', [tokenAddress]);
  }

  async getAssetTransfers(params: {
    fromBlock?: string;
    toBlock?: string;
    fromAddress?: string;
    toAddress?: string;
    contractAddresses?: string[];
    category?: string[];
    maxCount?: number;
    pageKey?: string;
  }): Promise<{ transfers: AlchemyAssetTransfer[]; pageKey?: string }> {
    return this.rpcCall<{ transfers: AlchemyAssetTransfer[]; pageKey?: string }>(
      'alchemy_getAssetTransfers',
      [{ ...params, withMetadata: true }],
    );
  }

  async getNftsForOwner(
    address: string,
    pageKey?: string,
  ): Promise<AlchemyNftBalance> {
    const qs = pageKey ? `?pageKey=${pageKey}` : '';
    return this.dataApiGet<AlchemyNftBalance>(
      `/assets/nfts/by-owner?owner=${address}${qs}`,
    );
  }

  async getTokenPrices(tokenAddresses: string[]): Promise<Record<string, number>> {
    const joined = tokenAddresses.join(',');
    const data = await this.dataApiGet<Record<string, unknown>>(
      `/prices/by-address?addresses=${joined}&network=MATIC_MAINNET`,
    );
    const prices: Record<string, number> = {};
    if (typeof data === 'object' && data !== null) {
      for (const [addr, raw] of Object.entries(data)) {
        if (typeof raw === 'object' && raw !== null) {
          const rec = raw as Record<string, unknown>;
          const price = typeof rec['price'] === 'number' ? rec['price'] : 0;
          prices[addr.toLowerCase()] = price;
        }
      }
    }
    return prices;
  }
}
