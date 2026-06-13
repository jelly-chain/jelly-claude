/** WalletService — Polygon wallet overview, balances, and block snapshots. */

import { DataApiClient } from '../client/data-api.js';
import { RpcClient } from '../client/rpc.js';
import { WalletOverview, emptyWalletOverview } from '../schemas/wallet.js';
import { BlockSnapshot } from '../tools/poly-get-block-snapshots.js';
import { formatUSDC, weiToEther } from '../utils/format.js';
import { normalizeAddress } from '../utils/normalize.js';

export class WalletService {
  constructor(
    private readonly dataApi: DataApiClient,
    private readonly rpc: RpcClient,
  ) {}

  async getOverview(address: string, includePrices = false): Promise<WalletOverview> {
    const normalized = normalizeAddress(address);
    if (!normalized) return emptyWalletOverview(address);

    try {
      const [balanceHex, nftData, txCountHex] = await Promise.all([
        this.dataApi.getBalance(normalized).catch(() => '0x0'),
        this.dataApi.getNftsForOwner(normalized).catch(() => ({ ownedNfts: [], totalCount: 0 })),
        this.dataApi.getTransactionCount(normalized).catch(() => 0),
      ]);

      const nativeBalance = weiToEther(balanceHex as string);
      const tokenBalances = await this.dataApi.getTokenBalances(normalized).catch(() => []);

      return {
        address: normalized,
        nativeBalance,
        tokenBalances: tokenBalances.map((tb) => ({
          tokenAddress: tb.contractAddress,
          symbol: '',
          decimals: 18,
          rawAmount: tb.tokenBalance,
          formattedAmount: 0,
        })),
        nftCount: nftData.totalCount,
        transactionCount: typeof txCountHex === 'number' ? txCountHex : parseInt(txCountHex as string, 16),
        tags: [],
        fetchedAt: new Date().toISOString(),
      };
    } catch {
      return emptyWalletOverview(address);
    }
  }

  async getRecentBlockSnapshots(count = 10): Promise<BlockSnapshot[]> {
    try {
      const latest = await this.rpc.eth_blockNumber();
      const snapshots: BlockSnapshot[] = [];

      for (let i = 0; i < Math.min(count, 10); i++) {
        const blockNum = latest - i;
        const block = await this.rpc.eth_getBlockByNumber(blockNum, false).catch(() => null);
        if (!block) continue;

        snapshots.push({
          blockNumber: blockNum,
          timestamp: new Date(parseInt(block.timestamp, 16) * 1000).toISOString(),
          transactionCount: block.transactions?.length ?? 0,
          gasUsed: block.gasUsed,
          baseFeeGwei: 0,
        });
      }

      return snapshots;
    } catch {
      return [];
    }
  }
}
