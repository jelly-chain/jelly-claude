/** Signal schema — typed signal bundles, confidence tiers, and volatility regimes. */

export type ConfidenceTier = 'low' | 'medium' | 'high' | 'very-high';
export type VolatilityRegime = 'calm' | 'building' | 'explosive';
export type SignalType =
  | 'whale-move'
  | 'large-transfer'
  | 'liquidity-add'
  | 'liquidity-remove'
  | 'price-spike'
  | 'volume-surge'
  | 'order-flow-imbalance'
  | 'resolution-approaching'
  | 'address-activity';

export interface ConfidenceScore {
  value: number;
  tier: ConfidenceTier;
  factors: string[];
  uncertainty: number;
}

export interface PolygonSignal {
  id: string;
  type: SignalType;
  address?: string;
  tokenAddress?: string;
  txHash?: string;
  blockNumber?: number;
  usdValue?: number;
  description: string;
  tags: string[];
  confidence: ConfidenceScore;
  timestamp: string;
}

export interface FlowSignal {
  tokenAddress: string;
  symbol: string;
  from: string;
  to: string;
  formattedAmount: number;
  usdValue: number;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  isWhale: boolean;
  flowType: 'transfer' | 'defi-interaction' | 'bridge' | 'cex-deposit' | 'cex-withdrawal';
}

export interface VolatilityReport {
  regime: VolatilityRegime;
  score: number;
  windowLabel: string;
  volumeRatio: number;
  priceRangePercent: number;
  largeTransferCount: number;
  blockRange: { from: number; to: number };
  computedAt: string;
}

export interface WhaleActivity {
  address: string;
  label?: string;
  activityType: 'accumulation' | 'distribution' | 'swap' | 'defi' | 'bridge';
  tokenFlows: FlowSignal[];
  netUsdFlow: number;
  conviction: ConfidenceTier;
  detectedAt: string;
}

export interface SignalBundle {
  chainId: number;
  blockNumber: number;
  signals: PolygonSignal[];
  flowSignals: FlowSignal[];
  volatility: VolatilityReport | null;
  whaleActivity: WhaleActivity[];
  generatedAt: string;
}

export function confidenceTier(value: number): ConfidenceTier {
  if (value >= 0.8) return 'very-high';
  if (value >= 0.6) return 'high';
  if (value >= 0.4) return 'medium';
  return 'low';
}

export function isConfidenceScore(v: unknown): v is ConfidenceScore {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj['value'] === 'number' &&
    typeof obj['tier'] === 'string' &&
    Array.isArray(obj['factors'])
  );
}

export function isPolygonSignal(v: unknown): v is PolygonSignal {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj['id'] === 'string' &&
    typeof obj['type'] === 'string' &&
    typeof obj['description'] === 'string' &&
    isConfidenceScore(obj['confidence'])
  );
}

export function isVolatilityReport(v: unknown): v is VolatilityReport {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj['regime'] === 'string' &&
    typeof obj['score'] === 'number' &&
    typeof obj['windowLabel'] === 'string'
  );
}

export function isWhaleActivity(v: unknown): v is WhaleActivity {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj['address'] === 'string' &&
    typeof obj['activityType'] === 'string' &&
    Array.isArray(obj['tokenFlows'])
  );
}

export function emptySignalBundle(blockNumber: number): SignalBundle {
  return {
    chainId: 137,
    blockNumber,
    signals: [],
    flowSignals: [],
    volatility: null,
    whaleActivity: [],
    generatedAt: new Date().toISOString(),
  };
}
