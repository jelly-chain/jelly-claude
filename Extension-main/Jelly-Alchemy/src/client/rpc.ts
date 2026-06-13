import { AlchemyClient } from './alchemy.js';
import { ChainId } from '../config/chains.js';
import { env } from '../config/env.js';

export interface BlockData {
  number: string;
  hash: string;
  timestamp: string;
  gasUsed: string;
  gasLimit: string;
  transactions: string[];
}

export interface TransactionData {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  gas: string;
  gasPrice: string;
  blockNumber: string;
  blockHash: string;
  nonce: string;
  input: string;
}

export interface TransactionReceipt {
  transactionHash: string;
  from: string;
  to: string | null;
  status: string;
  gasUsed: string;
  logs: LogEntry[];
  blockNumber: string;
}

export interface LogEntry {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  logIndex: string;
}

/** Low-level JSON-RPC client for EVM chains. */
export class RpcClient extends AlchemyClient {
  constructor(chain: ChainId) {
    super(chain, env);
  }

  async getBalance(address: string, block = 'latest'): Promise<string> {
    return this.request<string>({ method: 'eth_getBalance', params: [address, block] });
  }

  async getBlockNumber(): Promise<string> {
    return this.request<string>({ method: 'eth_blockNumber' });
  }

  async getBlockByNumber(blockNumber: string, fullTx = false): Promise<BlockData> {
    return this.request<BlockData>({ method: 'eth_getBlockByNumber', params: [blockNumber, fullTx] });
  }

  async getTransactionByHash(hash: string): Promise<TransactionData> {
    return this.request<TransactionData>({ method: 'eth_getTransactionByHash', params: [hash] });
  }

  async getTransactionReceipt(hash: string): Promise<TransactionReceipt> {
    return this.request<TransactionReceipt>({ method: 'eth_getTransactionReceipt', params: [hash] });
  }

  async call(to: string, data: string, block = 'latest'): Promise<string> {
    return this.request<string>({ method: 'eth_call', params: [{ to, data }, block] });
  }

  async sendRawTransaction(signedTx: string): Promise<string> {
    return this.request<string>({ method: 'eth_sendRawTransaction', params: [signedTx] });
  }

  async getLogs(filter: {
    fromBlock: string;
    toBlock: string;
    address?: string;
    topics?: string[];
  }): Promise<LogEntry[]> {
    return this.request<LogEntry[]>({ method: 'eth_getLogs', params: [filter] });
  }

  async getGasPrice(): Promise<string> {
    return this.request<string>({ method: 'eth_gasPrice' });
  }

  async estimateGas(tx: { from?: string; to: string; data?: string; value?: string }): Promise<string> {
    return this.request<string>({ method: 'eth_estimateGas', params: [tx] });
  }

  /** Returns the contract bytecode at `address`. Returns "0x" for EOAs. */
  async getCode(address: string, block = 'latest'): Promise<string> {
    return this.request<string>({ method: 'eth_getCode', params: [address, block] });
  }
}
