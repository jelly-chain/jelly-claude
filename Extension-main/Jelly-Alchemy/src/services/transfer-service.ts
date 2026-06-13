import { TransfersClient } from '../client/transfers.js';
import { AssetTransfer } from '../client/data-api.js';
import { ChainId } from '../config/chains.js';
import { RpcClient } from '../client/rpc.js';

export interface TransferActivity {
  address: string;
  chain: ChainId;
  sent: AssetTransfer[];
  received: AssetTransfer[];
  totalSent: number;
  totalReceived: number;
  fetchedAt: string;
}

export class TransferService {
  async getActivity(address: string, chain: ChainId, fromBlock = '0x0'): Promise<TransferActivity> {
    const client = new TransfersClient(chain);
    const { sent, received } = await client.getBoth(address, fromBlock);

    return {
      address,
      chain,
      sent,
      received,
      totalSent: sent.length,
      totalReceived: received.length,
      fetchedAt: new Date().toISOString(),
    };
  }

  async getRecentTransfers(address: string, chain: ChainId, lookbackBlocks = 1000): Promise<AssetTransfer[]> {
    const rpc = new RpcClient(chain);
    const latestHex = await rpc.getBlockNumber();
    const latestBlock = parseInt(latestHex, 16);
    const fromBlock = Math.max(0, latestBlock - lookbackBlocks);
    const fromHex = `0x${fromBlock.toString(16)}`;

    const client = new TransfersClient(chain);
    const { sent, received } = await client.getBoth(address, fromHex);
    return [...sent, ...received].sort((a, b) => {
      const aNum = parseInt(a.blockNum, 16);
      const bNum = parseInt(b.blockNum, 16);
      return bNum - aNum;
    });
  }
}
