/** VolatilityService — compute volatility regime from Polygon on-chain data. */

import { DataApiClient } from '../client/data-api.js';
import { VolatilityReport, VolatilityRegime } from '../schemas/signal.js';
import { POLYGON_MAINNET } from '../config/chains.js';
import { WindowLabel, blockRangeFromWindow } from '../utils/time-windows.js';
import { clamp } from '../utils/math.js';

export class VolatilityService {
  constructor(private readonly dataApi: DataApiClient) {}

  async computeRegime(
    window: WindowLabel,
    tokenAddress?: string,
  ): Promise<VolatilityReport> {
    const token = tokenAddress ?? POLYGON_MAINNET.contracts.usdc;

    try {
      const currentBlock = await this.dataApi.getBlockNumber();
      const range = blockRangeFromWindow(currentBlock, window);

      const transfers = await this.dataApi.getAssetTransfers({
        fromBlock: `0x${range.fromBlock.toString(16)}`,
        toBlock: `0x${range.toBlock.toString(16)}`,
        contractAddresses: [token],
        category: ['erc20'],
        maxCount: 500,
      }).catch(() => ({ transfers: [] }));

      const count = transfers.transfers.length;
      const largeCount = transfers.transfers.filter((t) => (t.value ?? 0) > 100_000).length;

      const volumeRatio = clamp(count / 100, 0, 10);
      const score = clamp((volumeRatio * 0.6) + (largeCount / count || 0) * 0.4, 0, 1);

      const regime: VolatilityRegime =
        score > 0.7 ? 'explosive' : score > 0.4 ? 'building' : 'calm';

      return {
        regime,
        score,
        windowLabel: window,
        volumeRatio,
        priceRangePercent: 0,
        largeTransferCount: largeCount,
        blockRange: { from: range.fromBlock, to: range.toBlock },
        computedAt: new Date().toISOString(),
      };
    } catch {
      return {
        regime: 'calm',
        score: 0,
        windowLabel: window,
        volumeRatio: 1,
        priceRangePercent: 0,
        largeTransferCount: 0,
        blockRange: { from: 0, to: 0 },
        computedAt: new Date().toISOString(),
      };
    }
  }
}
