/** jelly-polygon-tentacle — Public entry point */

export { getToolDefinitions } from './tools/index.js';
export type { ToolName, ToolDefinition, ToolCall, ToolResult } from './tools/index.js';

export { PolygonFlowAgent } from './subagents/polygon-flow-agent.js';
export { PolymarketSignalAgent } from './subagents/polymarket-signal-agent.js';
export { VolatilityWindowAgent } from './subagents/volatility-window-agent.js';
export { WhaleScoutAgent } from './subagents/whale-scout-agent.js';
export type { SubagentDefinition, AgentInput, AgentOutput } from './subagents/index.js';

export { AlchemyPolygonClient } from './client/alchemy-polygon.js';
export { RpcClient } from './client/rpc.js';
export { DataApiClient } from './client/data-api.js';
export { WebhooksClient } from './client/webhooks.js';
export { PolymarketClient } from './client/polymarket.js';
export { SignalAggregator } from './client/signals.js';

export { WalletService } from './services/wallet-service.js';
export { TokenService } from './services/token-service.js';
export { MarketService } from './services/market-service.js';
export { PolymarketService } from './services/polymarket-service.js';
export { LiquidityService } from './services/liquidity-service.js';
export { VolatilityService } from './services/volatility-service.js';
export { WebhookService } from './services/webhook-service.js';

export type { WalletOverview, WalletActivity, WalletTransaction, TokenTransfer } from './schemas/wallet.js';
export { isWalletOverview, emptyWalletOverview } from './schemas/wallet.js';
export type { TokenMetadata, TokenPrice, TokenFlowEvent, TokenFlowSummary } from './schemas/token.js';
export { isTokenFlowEvent } from './schemas/token.js';
export type { PolymarketMarket, PolymarketOrderBook, PolymarketResolution, MarketSignal, MarketStatus, MarketOutcome } from './schemas/market.js';
export { isPolymarketMarket, isMarketSignal, emptyOrderBook } from './schemas/market.js';
export type { ConfidenceTier, VolatilityRegime, SignalType, ConfidenceScore, PolygonSignal, FlowSignal, VolatilityReport, WhaleActivity, SignalBundle } from './schemas/signal.js';
export { confidenceTier, isPolygonSignal, isVolatilityReport, isWhaleActivity, emptySignalBundle } from './schemas/signal.js';
export type { TransactionRef, TokenAmount, AddressTag } from './schemas/common.js';
export { isTransactionRef, isTokenAmount } from './schemas/common.js';

export { POLYGON_MAINNET, POLYGON_AMOY, BLOCKS_PER_MINUTE, BLOCKS_PER_HOUR, BLOCKS_PER_DAY } from './config/chains.js';
export { CAPABILITIES, hasCapability } from './config/capabilities.js';
export { loadEnv, env } from './config/env.js';
export type { PolygonTentacleEnv } from './config/env.js';

export { PolygonTentacleError, ProviderError, AlchemyError, PolymarketError, ValidationError, NotFoundError, ConfigError, RateLimitError, isPolygonTentacleError, toPolygonTentacleError } from './utils/errors.js';
export { weiToEther, weiToGwei, formatUSDC, checksumAddress, shortenAddress, hexToNumber, numberToHex, formatPercent, formatUSD } from './utils/format.js';
export { normalizeAddress, normalizeHexString, normalizeNumber, normalizeString, normalizeArray, safeRecord } from './utils/normalize.js';
export { clamp, average, weightedAverage, standardDeviation, zScore, sigmoid, roundTo, percentChange } from './utils/math.js';
export { windowToSeconds, windowToBlocks, blockRangeFromWindow, windowStart, isWithinWindow } from './utils/time-windows.js';
export type { WindowLabel, BlockRange } from './utils/time-windows.js';
export { emptyPage, mergePaginatedResults } from './utils/pagination.js';
export type { PaginatedResult, PageCursor } from './utils/pagination.js';

export { buildPolygonSignalSummaryPrompt } from './prompts/polygon-signal-summary.js';
export { buildPolymarketPredictionPrompt } from './prompts/polymarket-prediction.js';
export { buildWhaleTrackerPrompt } from './prompts/whale-tracker.js';
export { buildLiquidityMoveExplainerPrompt } from './prompts/liquidity-move-explainer.js';
