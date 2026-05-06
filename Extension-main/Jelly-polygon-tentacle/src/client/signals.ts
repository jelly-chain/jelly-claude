/** Signal aggregation — merges outputs from multiple clients into a typed SignalBundle. */

import { SignalBundle, PolygonSignal, FlowSignal, VolatilityReport, WhaleActivity, emptySignalBundle } from '../schemas/signal.js';
import { DataApiClient } from './data-api.js';
import { PolymarketClient } from './polymarket.js';
import { clamp } from '../utils/math.js';

export interface SignalAggregatorConfig {
  whaleThresholdUsd: number;
  minSignalStrength: number;
}

const DEFAULT_CONFIG: SignalAggregatorConfig = {
  whaleThresholdUsd: 100_000,
  minSignalStrength: 0.2,
};

export class SignalAggregator {
  constructor(
    private readonly dataApi: DataApiClient,
    private readonly polymarket: PolymarketClient,
    private readonly config: SignalAggregatorConfig = DEFAULT_CONFIG,
  ) {}

  async buildBundle(blockNumber: number): Promise<SignalBundle> {
    const bundle = emptySignalBundle(blockNumber);
    return bundle;
  }

  mergeFlowSignals(existing: FlowSignal[], incoming: FlowSignal[]): FlowSignal[] {
    const seen = new Set(existing.map((s) => s.txHash));
    const deduped = incoming.filter((s) => !seen.has(s.txHash));
    return [...existing, ...deduped];
  }

  scoreSignal(usdValue: number, isWhale: boolean): number {
    const baseScore = clamp(usdValue / this.config.whaleThresholdUsd, 0, 1);
    return isWhale ? clamp(baseScore * 1.5, 0, 1) : baseScore;
  }

  filterByStrength(signals: PolygonSignal[]): PolygonSignal[] {
    return signals.filter(
      (s) => s.confidence.value >= this.config.minSignalStrength,
    );
  }

  summarizeBundle(bundle: SignalBundle): string {
    const lines: string[] = [
      `Block: ${bundle.blockNumber}`,
      `Signals: ${bundle.signals.length}`,
      `Flow events: ${bundle.flowSignals.length}`,
      `Whale activity: ${bundle.whaleActivity.length}`,
      `Volatility: ${bundle.volatility?.regime ?? 'unknown'}`,
    ];
    return lines.join(' | ');
  }
}
