import { AlchemyClient } from './alchemy.js';
import { ChainId } from '../config/chains.js';
import { env } from '../config/env.js';

export interface TokenBalance {
  contractAddress: string;
  tokenBalance: string;
  error: string | null;
}

export interface TokenBalancesResponse {
  address: string;
  tokenBalances: TokenBalance[];
  pageKey?: string;
}

export interface AssetTransfer {
  from: string;
  to: string | null;
  value: number | null;
  asset: string | null;
  tokenId: string | null;
  category: string;
  blockNum: string;
  hash: string;
  rawContract: { value: string; address: string; decimal: string };
}

export interface AssetTransfersResponse {
  transfers: AssetTransfer[];
  pageKey?: string;
}

export type TransferCategory =
  | 'external'
  | 'internal'
  | 'erc20'
  | 'erc721'
  | 'erc1155'
  | 'specialnft';

export interface AssetTransfersParams {
  fromBlock?: string;
  toBlock?: string;
  fromAddress?: string;
  toAddress?: string;
  contractAddresses?: string[];
  category: TransferCategory[];
  maxCount?: number;
  pageKey?: string;
  order?: 'asc' | 'desc';
}

/** Alchemy Data API: token balances, asset transfers, enriched history. */
export class DataApiClient extends AlchemyClient {
  constructor(chain: ChainId) {
    super(chain, env);
  }

  async getTokenBalances(address: string, pageKey?: string): Promise<TokenBalancesResponse> {
    const params: unknown[] = [address, 'erc20'];
    if (pageKey) params.push({ pageKey });
    return this.request<TokenBalancesResponse>({ method: 'alchemy_getTokenBalances', params });
  }

  async getAssetTransfers(params: AssetTransfersParams): Promise<AssetTransfersResponse> {
    return this.request<AssetTransfersResponse>({
      method: 'alchemy_getAssetTransfers',
      params: [params],
    });
  }

  async getTokenMetadata(contractAddress: string): Promise<{
    name: string | null;
    symbol: string | null;
    decimals: number | null;
    logo: string | null;
  }> {
    return this.request({ method: 'alchemy_getTokenMetadata', params: [contractAddress] });
  }
}
