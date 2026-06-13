/** TokenService — ERC-20 metadata, prices, and token flow analysis. */

import { DataApiClient } from '../client/data-api.js';
import { TokenMetadata, TokenFlowEvent, TokenFlowSummary } from '../schemas/token.js';
import { WindowLabel, windowToBlocks } from '../utils/time-windows.js';
import { normalizeAddress } from '../utils/normalize.js';

export class TokenService {
  constructor(private readonly dataApi: DataApiClient) {}

  async getMetadata(tokenAddress: string): Promise<TokenMetadata | null> {
    try {
      const raw = await this.dataApi.getTokenMetadata(tokenAddress);
      return {
        address: normalizeAddress(tokenAddress),
        name: raw.name,
        symbol: raw.symbol,
        decimals: raw.decimals,
        logoUrl: raw.logo,
      };
    } catch {
      return null;
    }
  }

  async getTokenFlows(
    address: string,
    window: WindowLabel,
    tokenAddress?: string,
  ): Promise<TokenFlowEvent[]> {
    const normalized = normalizeAddress(address);
    if (!normalized) return [];

    try {
      const currentBlock = await this.dataApi.getBlockNumber();
      const blocks = windowToBlocks(window);
      const fromBlock = `0x${Math.max(0, currentBlock - blocks).toString(16)}`;

      const categories = ['erc20'];
      const params: Parameters<typeof this.dataApi.getAssetTransfers>[0] = {
        fromBlock,
        toBlock: 'latest',
        fromAddress: normalized,
        category: categories,
        maxCount: 100,
      };
      if (tokenAddress) params.contractAddresses = [tokenAddress];

      const { transfers } = await this.dataApi.getAssetTransfers(params);

      return transfers.map((t): TokenFlowEvent => ({
        tokenAddress: t.rawContract.address ?? tokenAddress ?? '',
        symbol: t.asset ?? '',
        from: t.from,
        to: t.to ?? '',
        formattedAmount: t.value ?? 0,
        usdValue: undefined,
        txHash: t.hash,
        blockNumber: parseInt(t.blockNum, 16),
        timestamp: t.metadata?.blockTimestamp ?? new Date().toISOString(),
        flowDirection: 'outflow',
        isLargeTransfer: (t.value ?? 0) > 100_000,
      }));
    } catch {
      return [];
    }
  }

  async getFlowSummary(
    address: string,
    window: WindowLabel,
    tokenAddress?: string,
  ): Promise<TokenFlowSummary> {
    const events = await this.getTokenFlows(address, window, tokenAddress);
    const symbol = events[0]?.symbol ?? '';
    const tokenAddr = tokenAddress ?? events[0]?.tokenAddress ?? '';

    const totalInflow = events.filter((e) => e.flowDirection === 'inflow').reduce((s, e) => s + (e.usdValue ?? 0), 0);
    const totalOutflow = events.filter((e) => e.flowDirection === 'outflow').reduce((s, e) => s + (e.usdValue ?? 0), 0);
    const senders = new Set(events.map((e) => e.from)).size;
    const receivers = new Set(events.map((e) => e.to)).size;

    return {
      tokenAddress: tokenAddr,
      symbol,
      windowLabel: window,
      totalInflowUsd: totalInflow,
      totalOutflowUsd: totalOutflow,
      netFlowUsd: totalInflow - totalOutflow,
      largeTransferCount: events.filter((e) => e.isLargeTransfer).length,
      uniqueSenders: senders,
      uniqueReceivers: receivers,
      events,
      computedAt: new Date().toISOString(),
    };
  }
}
