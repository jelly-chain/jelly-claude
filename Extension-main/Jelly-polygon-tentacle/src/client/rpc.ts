/** Low-level JSON-RPC helpers for Polygon. */

import { AlchemyPolygonClient } from './alchemy-polygon.js';

export interface EthLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  logIndex: string;
  removed: boolean;
}

export interface EthBlock {
  number: string;
  hash: string;
  parentHash: string;
  timestamp: string;
  transactions: string[];
  gasUsed: string;
  gasLimit: string;
}

export interface EthTransaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  gas: string;
  gasPrice: string;
  input: string;
  blockNumber: string;
  blockHash: string;
  nonce: string;
}

export class RpcClient extends AlchemyPolygonClient {
  async eth_getBalance(address: string, block = 'latest'): Promise<string> {
    return this.rpcCall<string>('eth_getBalance', [address, block]);
  }

  async eth_getLogs(filter: {
    fromBlock?: string;
    toBlock?: string;
    address?: string | string[];
    topics?: (string | string[] | null)[];
  }): Promise<EthLog[]> {
    return this.rpcCall<EthLog[]>('eth_getLogs', [filter]);
  }

  async eth_call(params: { to: string; data: string }, block = 'latest'): Promise<string> {
    return this.rpcCall<string>('eth_call', [params, block]);
  }

  async eth_blockNumber(): Promise<number> {
    const hex = await this.rpcCall<string>('eth_blockNumber', []);
    return parseInt(hex, 16);
  }

  async eth_getBlockByNumber(
    blockNumber: number | 'latest',
    fullTransactions = false,
  ): Promise<EthBlock | null> {
    const tag =
      typeof blockNumber === 'number' ? `0x${blockNumber.toString(16)}` : blockNumber;
    return this.rpcCall<EthBlock | null>('eth_getBlockByNumber', [tag, fullTransactions]);
  }

  async eth_getTransactionByHash(hash: string): Promise<EthTransaction | null> {
    return this.rpcCall<EthTransaction | null>('eth_getTransactionByHash', [hash]);
  }

  async eth_getTransactionReceipt(hash: string): Promise<Record<string, unknown> | null> {
    return this.rpcCall<Record<string, unknown> | null>('eth_getTransactionReceipt', [hash]);
  }
}
