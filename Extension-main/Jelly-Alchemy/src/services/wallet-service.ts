import { RpcClient } from '../client/rpc.js';
import { ChainId } from '../config/chains.js';
import { parseHexBalance } from '../utils/format.js';

export interface WalletSummary {
  address: string;
  chain: ChainId;
  nativeBalance: string;
  nativeBalanceEth: string;
  blockNumber: string;
  fetchedAt: string;
}

export class WalletService {
  async getSummary(address: string, chain: ChainId): Promise<WalletSummary> {
    const client = new RpcClient(chain);
    const [rawBalance, blockHex] = await Promise.all([
      client.getBalance(address),
      client.getBlockNumber(),
    ]);

    return {
      address,
      chain,
      nativeBalance: rawBalance,
      nativeBalanceEth: parseHexBalance(rawBalance),
      blockNumber: blockHex,
      fetchedAt: new Date().toISOString(),
    };
  }

  async getBalanceAcrossChains(
    address: string,
    chains: ChainId[],
  ): Promise<WalletSummary[]> {
    return Promise.all(chains.map((chain) => this.getSummary(address, chain)));
  }
}
