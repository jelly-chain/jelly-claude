import { AlchemyClient } from './alchemy.js';
import { ChainId } from '../config/chains.js';
import { env } from '../config/env.js';

export interface NftMetadata {
  name: string | null;
  description: string | null;
  image: string | null;
  attributes: Array<{ trait_type: string; value: string | number }>;
}

export interface OwnedNft {
  contractAddress: string;
  tokenId: string;
  tokenType: 'ERC721' | 'ERC1155' | 'UNKNOWN';
  title: string;
  description: string;
  media: Array<{ gateway: string; raw: string }>;
  metadata: NftMetadata;
  balance: string;
}

export interface NftsForOwnerResponse {
  ownedNfts: OwnedNft[];
  totalCount: number;
  pageKey?: string;
}

export interface NftContractMetadata {
  address: string;
  name: string | null;
  symbol: string | null;
  totalSupply: string | null;
  tokenType: string;
}

/** NFT ownership and metadata client using Alchemy NFT API. */
export class NftClient extends AlchemyClient {
  constructor(chain: ChainId) {
    super(chain, env);
  }

  async getNftsForOwner(
    owner: string,
    contractAddresses?: string[],
    pageKey?: string,
  ): Promise<NftsForOwnerResponse> {
    const params: Record<string, unknown> = { owner };
    if (contractAddresses && contractAddresses.length > 0) params['contractAddresses'] = contractAddresses;
    if (pageKey) params['pageKey'] = pageKey;

    return this.request<NftsForOwnerResponse>({
      method: 'alchemy_getNFTsForOwner',
      params: [params],
    });
  }

  async getNftMetadata(
    contractAddress: string,
    tokenId: string,
    tokenType?: 'ERC721' | 'ERC1155',
  ): Promise<OwnedNft> {
    const params: Record<string, unknown> = { contractAddress, tokenId };
    if (tokenType) params['tokenType'] = tokenType;

    return this.request<OwnedNft>({
      method: 'alchemy_getNFTMetadata',
      params: [params],
    });
  }

  async getContractMetadata(contractAddress: string): Promise<NftContractMetadata> {
    return this.request<NftContractMetadata>({
      method: 'alchemy_getContractMetadata',
      params: [contractAddress],
    });
  }
}
