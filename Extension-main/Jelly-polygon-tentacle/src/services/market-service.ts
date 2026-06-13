/** MarketService — Polygon on-chain signal aggregation. */

import { DataApiClient } from '../client/data-api.js';
import { SignalAggregator } from '../client/signals.js';
import { SignalBundle, PolygonSignal, emptySignalBundle } from '../schemas/signal.js';
import { WindowLabel } from '../utils/time-windows.js';

export class MarketService {
  constructor(
    private readonly dataApi: DataApiClient,
    private readonly aggregator: SignalAggregator,
  ) {}

  async getSignalBundle(window: WindowLabel | string, minUsdValue: number): Promise<SignalBundle> {
    try {
      const blockNumber = await this.dataApi.getBlockNumber();
      const bundle = await this.aggregator.buildBundle(blockNumber);
      const filtered = this.aggregator.filterByStrength(bundle.signals);
      return { ...bundle, signals: filtered };
    } catch {
      return emptySignalBundle(0);
    }
  }

  async getTopSignals(bundle: SignalBundle, n = 5): Promise<PolygonSignal[]> {
    return bundle.signals
      .sort((a, b) => b.confidence.value - a.confidence.value)
      .slice(0, n);
  }

  summarize(bundle: SignalBundle): string {
    return this.aggregator.summarizeBundle(bundle);
  }
}
