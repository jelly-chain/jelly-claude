import { AlchemyClient } from './alchemy.js';
import { env } from '../config/env.js';

export interface SolanaAsset {
  id: string;
  grouping: Array<{ group_key: string; group_value: string }>;
  content: {
    metadata: { name: string; symbol: string; description: string };
    links: { image?: string; external_url?: string };
  };
  ownership: { owner: string; frozen: boolean };
  compression: { compressed: boolean };
}

export interface SolanaAssetsPage {
  items: SolanaAsset[];
  total: number;
  limit: number;
  page: number;
}

/** Solana DAS API stubs (getAssetsByOwner, getAsset). v0.1 — typed stubs. */
export class SolanaClient extends AlchemyClient {
  constructor() {
    super('solana-mainnet', env);
  }

  async getAssetsByOwner(
    ownerAddress: string,
    page = 1,
    limit = 50,
  ): Promise<SolanaAssetsPage> {
    return this.request<SolanaAssetsPage>({
      method: 'getAssetsByOwner',
      params: [{ ownerAddress, page, limit, sortBy: { sortBy: 'created', sortDirection: 'asc' } }],
    });
  }

  async getAsset(id: string): Promise<SolanaAsset> {
    return this.request<SolanaAsset>({
      method: 'getAsset',
      params: [{ id }],
    });
  }

  async getAssetsByCreator(creatorAddress: string, page = 1, limit = 50): Promise<SolanaAssetsPage> {
    return this.request<SolanaAssetsPage>({
      method: 'getAssetsByCreator',
      params: [{ creatorAddress, page, limit }],
    });
  }
}
