# Subagents

jelly-polygon-tentacle defines four typed subagents that Jelly Claude orchestrates for specialized Polygon signal work.

## PolygonFlowAgent

**File**: `src/subagents/polygon-flow-agent.ts`

Monitors ERC-20 token flows and identifies whale-level transfers on Polygon.

| Input | Type | Description |
|---|---|---|
| `addresses` | `string[]` | Wallet addresses to monitor |
| `window` | `WindowLabel` | Time window (`1m`–`7d`) |
| `options.whaleThresholdUsd` | `number` | Min USD value for a whale transfer |

| Output | Type | Description |
|---|---|---|
| `flowSignals` | `FlowSignal[]` | Sorted by USD value descending |
| `largeTransferCount` | `number` | Transfers above whale threshold |
| `netFlowUsd` | `number` | Sum of all USD values |

## PolymarketSignalAgent

**File**: `src/subagents/polymarket-signal-agent.ts`

Tracks Polymarket market state, order-flow imbalance, and upcoming resolutions.

| Input | Type | Description |
|---|---|---|
| `conditionIds` | `string[]` | Specific markets to track |
| `options.limit` | `number` | Max markets to analyze via search |

| Output | Type | Description |
|---|---|---|
| `marketSignals` | `MarketSignal[]` | Signal with direction and strength |
| `highConvictionCount` | `number` | Markets with signalStrength = "strong" |
| `pendingResolutionCount` | `number` | Recently resolved markets count |

## VolatilityWindowAgent

**File**: `src/subagents/volatility-window-agent.ts`

Computes a volatility regime label from Polygon transfer volume patterns.

| Input | Type | Description |
|---|---|---|
| `window` | `WindowLabel` | `15m`, `1h`, `4h`, or `24h` |
| `options.tokenAddress` | `string` | Token to analyze (default: USDC) |

| Output | Type | Description |
|---|---|---|
| `report` | `VolatilityReport` | Regime + score + block range |
| `regimeChanged` | `boolean` | Whether regime shifted from previous run |
| `previousRegime` | `string` | Previous regime label |

## WhaleScoutAgent

**File**: `src/subagents/whale-scout-agent.ts`

Tracks a watchlist of addresses and labels their Polygon activity type.

| Input | Type | Description |
|---|---|---|
| `addresses` | `string[]` | Whale addresses to track |
| `window` | `WindowLabel` | Lookback window |
| `options.thresholdUsd` | `number` | Min USD value to surface |

| Output | Type | Description |
|---|---|---|
| `whaleActivity` | `WhaleActivity[]` | Tagged activity records |
| `totalNetFlowUsd` | `number` | Net across all whales |
| `dominantActivity` | `string` | Most common activity type |

## Subagent Routing Flow

```
Jelly Claude receives question
        │
        ▼
Is it about Polygon token flows?  → PolygonFlowAgent
Is it about Polymarket markets?   → PolymarketSignalAgent
Is it about volatility/regime?    → VolatilityWindowAgent
Is it about known whale wallets?  → WhaleScoutAgent
        │
        ▼
AgentOutput → Claude context block → tool response
```
