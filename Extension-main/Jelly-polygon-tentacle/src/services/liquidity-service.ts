/** LiquidityService — DeFi liquidity add/remove events on Polygon. */

import { RpcClient } from '../client/rpc.js';
import { POLYGON_MAINNET } from '../config/chains.js';
import { WindowLabel, blockRangeFromWindow } from '../utils/time-windows.js';

export type LiquidityEventType = 'add' | 'remove';
export type DeFiProtocol = 'uniswap-v3' | 'quickswap' | 'aave' | 'all';

export interface LiquidityEvent {
  protocol: DeFiProtocol;
  poolAddress: string;
  eventType: LiquidityEventType;
  token0Address: string;
  token1Address: string;
  token0Amount: number;
  token1Amount: number;
  usdValue?: number;
  provider: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
}

const PROTOCOL_TOPICS: Record<DeFiProtocol, string[]> = {
  'uniswap-v3': [
    '0x7a53080ba414158be7ec69b987b5fb7d07dde046697d62ef3b3f3d79c1e3e5a2', // Mint
    '0x0c396cd989a39f4459b5fa1aed6a9a8dcdbc45908acfd67e028cd568da98982c', // Burn
  ],
  quickswap: [
    '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f', // Mint
    '0xdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d81936496', // Burn
  ],
  aave: [
    '0x2b627736bca15cd5381dcf80b0bf11fd197d62a5f53e0c31d69d5bf13b8f3c0', // Supply
    '0x3115d1449a7b732c986cba18244e897a450f61e1bb8d589cd2e69e6c8924f9f7', // Withdraw
  ],
  all: [],
};

export class LiquidityService {
  constructor(private readonly rpc: RpcClient) {}

  async getLiquidityEvents(
    window: WindowLabel,
    poolAddress?: string,
    protocol: DeFiProtocol | string = 'all',
  ): Promise<LiquidityEvent[]> {
    try {
      const currentBlock = await this.rpc.eth_blockNumber();
      const range = blockRangeFromWindow(currentBlock, window);

      const targetProtocol = (protocol as DeFiProtocol) === 'all'
        ? ['uniswap-v3', 'quickswap', 'aave'] as DeFiProtocol[]
        : [protocol as DeFiProtocol];

      const allTopics = targetProtocol.flatMap((p) => PROTOCOL_TOPICS[p] ?? []);
      if (allTopics.length === 0) return [];

      const logs = await this.rpc.eth_getLogs({
        fromBlock: `0x${range.fromBlock.toString(16)}`,
        toBlock: `0x${range.toBlock.toString(16)}`,
        address: poolAddress,
        topics: [allTopics],
      });

      return logs.map((log): LiquidityEvent => ({
        protocol: this.inferProtocol(log.topics[0] ?? '', targetProtocol),
        poolAddress: log.address,
        eventType: this.inferEventType(log.topics[0] ?? ''),
        token0Address: '',
        token1Address: '',
        token0Amount: 0,
        token1Amount: 0,
        provider: '',
        txHash: log.transactionHash,
        blockNumber: parseInt(log.blockNumber, 16),
        timestamp: new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  }

  private inferProtocol(topic: string, protocols: DeFiProtocol[]): DeFiProtocol {
    for (const p of protocols) {
      if ((PROTOCOL_TOPICS[p] ?? []).includes(topic)) return p;
    }
    return 'uniswap-v3';
  }

  private inferEventType(topic: string): LiquidityEventType {
    const mintTopics = [
      PROTOCOL_TOPICS['uniswap-v3']?.[0],
      PROTOCOL_TOPICS['quickswap']?.[0],
      PROTOCOL_TOPICS['aave']?.[0],
    ];
    return mintTopics.includes(topic) ? 'add' : 'remove';
  }
}
