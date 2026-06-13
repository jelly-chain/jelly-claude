import { DataApiClient, AssetTransfer, AssetTransfersParams } from './data-api.js';
import { ChainId } from '../config/chains.js';

export interface TransferPage {
  transfers: AssetTransfer[];
  pageKey?: string;
  hasMore: boolean;
}

/** High-level transfer history client with from/to helpers. */
export class TransfersClient {
  private readonly dataApi: DataApiClient;

  constructor(chain: ChainId) {
    this.dataApi = new DataApiClient(chain);
  }

  async getOutbound(address: string, fromBlock = '0x0', pageKey?: string): Promise<TransferPage> {
    const params: AssetTransfersParams = {
      fromBlock,
      toBlock: 'latest',
      fromAddress: address,
      category: ['external', 'erc20', 'erc721', 'erc1155'],
      maxCount: 100,
      order: 'desc',
    };
    if (pageKey) params.pageKey = pageKey;
    const res = await this.dataApi.getAssetTransfers(params);
    return { transfers: res.transfers, pageKey: res.pageKey, hasMore: !!res.pageKey };
  }

  async getInbound(address: string, fromBlock = '0x0', pageKey?: string): Promise<TransferPage> {
    const params: AssetTransfersParams = {
      fromBlock,
      toBlock: 'latest',
      toAddress: address,
      category: ['external', 'erc20', 'erc721', 'erc1155'],
      maxCount: 100,
      order: 'desc',
    };
    if (pageKey) params.pageKey = pageKey;
    const res = await this.dataApi.getAssetTransfers(params);
    return { transfers: res.transfers, pageKey: res.pageKey, hasMore: !!res.pageKey };
  }

  async getBoth(address: string, fromBlock = '0x0'): Promise<{ sent: AssetTransfer[]; received: AssetTransfer[] }> {
    const [sent, received] = await Promise.all([
      this.getOutbound(address, fromBlock),
      this.getInbound(address, fromBlock),
    ]);
    return { sent: sent.transfers, received: received.transfers };
  }
}
