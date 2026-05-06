/** Tool registry — exports ToolDefinition, ToolName, and the full tool catalog. */

export type ToolName =
  | 'poly-get-wallet-overview'
  | 'poly-get-token-flows'
  | 'poly-get-market-signals'
  | 'poly-get-polymarket-markets'
  | 'poly-get-polymarket-orderflow'
  | 'poly-get-polymarket-resolutions'
  | 'poly-get-liquidity-events'
  | 'poly-get-volatility-window'
  | 'poly-watch-address'
  | 'poly-get-block-snapshots'
  | 'poly-simulate-transaction';

export interface ToolInputProperty {
  type: string;
  description?: string;
  enum?: string[];
}

export interface ToolDefinition {
  name: ToolName;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, ToolInputProperty>;
    required?: string[];
  };
}

export interface ToolCall {
  name: ToolName;
  parameters: Record<string, unknown>;
}

export interface ToolResult {
  tool: ToolName;
  success: boolean;
  data: unknown;
  error?: string;
}

export { getWalletOverviewDefinition } from './poly-get-wallet-overview.js';
export { getTokenFlowsDefinition } from './poly-get-token-flows.js';
export { getMarketSignalsDefinition } from './poly-get-market-signals.js';
export { getPolymarketMarketsDefinition } from './poly-get-polymarket-markets.js';
export { getPolymarketOrderflowDefinition } from './poly-get-polymarket-orderflow.js';
export { getPolymarketResolutionsDefinition } from './poly-get-polymarket-resolutions.js';
export { getLiquidityEventsDefinition } from './poly-get-liquidity-events.js';
export { getVolatilityWindowDefinition } from './poly-get-volatility-window.js';
export { watchAddressDefinition } from './poly-watch-address.js';
export { getBlockSnapshotsDefinition } from './poly-get-block-snapshots.js';
export { simulateTransactionDefinition } from './poly-simulate-transaction.js';

import { getWalletOverviewDefinition } from './poly-get-wallet-overview.js';
import { getTokenFlowsDefinition } from './poly-get-token-flows.js';
import { getMarketSignalsDefinition } from './poly-get-market-signals.js';
import { getPolymarketMarketsDefinition } from './poly-get-polymarket-markets.js';
import { getPolymarketOrderflowDefinition } from './poly-get-polymarket-orderflow.js';
import { getPolymarketResolutionsDefinition } from './poly-get-polymarket-resolutions.js';
import { getLiquidityEventsDefinition } from './poly-get-liquidity-events.js';
import { getVolatilityWindowDefinition } from './poly-get-volatility-window.js';
import { watchAddressDefinition } from './poly-watch-address.js';
import { getBlockSnapshotsDefinition } from './poly-get-block-snapshots.js';
import { simulateTransactionDefinition } from './poly-simulate-transaction.js';

export function getToolDefinitions(): ToolDefinition[] {
  return [
    getWalletOverviewDefinition(),
    getTokenFlowsDefinition(),
    getMarketSignalsDefinition(),
    getPolymarketMarketsDefinition(),
    getPolymarketOrderflowDefinition(),
    getPolymarketResolutionsDefinition(),
    getLiquidityEventsDefinition(),
    getVolatilityWindowDefinition(),
    watchAddressDefinition(),
    getBlockSnapshotsDefinition(),
    simulateTransactionDefinition(),
  ];
}
