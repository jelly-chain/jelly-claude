import { NftClient, OwnedNft, NftsForOwnerResponse } from '../client/nft.js';
import { ChainId } from '../config/chains.js';

export interface NftPage {
  owner: string;
  chain: ChainId;
  nfts: OwnedNft[];
  totalCount: number;
  pageKey?: string;
  hasMore: boolean;
}

export class NftService {
  async getNftsForOwner(
    owner: string,
    chain: ChainId,
    contractAddresses?: string[],
    pageKey?: string,
  ): Promise<NftPage> {
    const client = new NftClient(chain);
    const res: NftsForOwnerResponse = await client.getNftsForOwner(owner, contractAddresses, pageKey);

    return {
      owner,
      chain,
      nfts: res.ownedNfts,
      totalCount: res.totalCount,
      pageKey: res.pageKey,
      hasMore: !!res.pageKey,
    };
  }

  async getAllNfts(owner: string, chain: ChainId): Promise<OwnedNft[]> {
    const all: OwnedNft[] = [];
    let cursor: string | undefined;

    do {
      const page = await this.getNftsForOwner(owner, chain, undefined, cursor);
      all.push(...page.nfts);
      cursor = page.pageKey;
    } while (cursor);

    return all;
  }

  async getNftsByCollection(owner: string, chain: ChainId, contractAddress: string): Promise<OwnedNft[]> {
    const page = await this.getNftsForOwner(owner, chain, [contractAddress]);
    return page.nfts;
  }
}
