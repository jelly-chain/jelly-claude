# jelly-polygon-tentacle

Polygon data booster for Jelly Claude, wired through Alchemy.

`jelly-polygon-tentacle` is the Polygon‑native analytics and signal extension for Jelly Claude. It focuses on ultra‑fast Polygon PoS data via Alchemy and orchestrates sub‑agents that track onchain flows, prediction markets, and liquidity patterns to generate signals and market‑move predictions in real time.

## Purpose

Where `jelly-alchemy` gives Jelly Claude broad EVM coverage, `jelly-polygon-tentacle` goes deep on Polygon: chain reads, token flows, Polymarket activity, and high‑frequency signals that prediction agents can consume.

The extension is designed as a **signal engine**:
- Pull raw and indexed Polygon data from Alchemy  
- Enrich it into wallet, token, and market views  
- Route it into subagents that score signals, volatility, and market skew  
- Feed those subagents back into Jelly Claude for onchain prediction and routing decisions  

## How it boosts Jelly Claude on Polygon

### Alchemy + Polygon data plane

On Polygon, Alchemy provides:
- High‑throughput Polygon PoS RPC for reading blocks, transactions, receipts, logs, and contract state  
- Data APIs that index token balances, transfers, NFT positions, and historical activity on Polygon  
- Webhooks and streaming‑style mechanics for near‑real‑time updates on specific addresses, contracts, and events  

`jelly-polygon-tentacle` builds on top of that to give Jelly Claude:
- A **Polygon‑first** client focused on speed and consistency  
- Out‑of‑the‑box support for key Polygon contracts (Polymarket, stablecoins, core DeFi)  
- Structured outputs that are ready for prediction prompts, not just raw RPC blobs  

### What Jelly Claude gets from `jelly-polygon-tentacle`

#### Core Polygon data access

- Wallet balances and native MATIC balances on Polygon  
- ERC‑20 balances and wallet‑level token allocation views on Polygon  
- Historical transfers and onchain flow patterns for any address  
- NFT ownership, collection exposure, and identity hints (badges, early adopter NFTs)  
- Real‑time and historical token prices, specifically for Polygon‑traded assets where available  
- Blocks, transactions, receipts, logs, and contract state for Polygon PoS  
- Transaction simulation for Polygon txs (gas, revert detection, effect preview)  
- Transaction traces and debugging for Polygon contracts (routers, AMMs, Polymarket settlement paths)  
- Webhook‑style subscription flow for Polygon addresses, contracts, or topics (liquidity moves, whale trades, prediction market resolutions)  

#### Signal and prediction surface

On top of raw data, `jelly-polygon-tentacle` exposes **signal‑friendly** tools:

- Market skew and order‑flow hints for prediction markets  
- Liquidity and volume spikes on key Polygon tokens and pools  
- Wallet behavior profiling (whales, market makers, “smart order flow”)  
- Volatility and momentum windows for short‑horizon decisions  
- Resolution and settlement tracking for prediction markets  

These tools are tuned to feed subagents that specialize in:
- Market prediction and scenario scoring  
- Signal aggregation (multiple feeds into one conviction score)  
- Risk and confidence estimation for Jelly Claude’s recommendations  

## Subagents and signal routing

`jelly-polygon-tentacle` is designed to call **subagents** under Jelly Claude’s control rather than doing everything in one monolithic tool.

Typical subagents:

- **PolygonFlowAgent** – watches token flows, large transfers, and DeFi pool events, tagging emerging narratives and abnormal behavior.  
- **PolymarketSignalAgent** – tracks Polymarket onchain state, order flow, and resolution updates to surface “implied probability” moves and sentiment shifts.  
- **VolatilityWindowAgent** – looks at short‑term volatility and volume around selected assets/markets to label regimes (calm, building, explosive).  
- **WhaleScoutAgent** – tracks specific wallets (teams, funds, “smart money”) and their Polygon activity for copy‑trade or early signal hints.  

`jelly-polygon-tentacle` handles:
- Data ingestion from Alchemy and Polygon contracts  
- Normalization to shared schemas (wallet, token, market, signal)  
- Routing of structured data to subagents  
- Aggregation of subagent outputs back into a single response for Jelly Claude  

## Agent tool surface

Each tool in `jelly-polygon-tentacle` maps to a concrete prediction or signal task Jelly Claude can execute on Polygon.

| Tool | What it returns | Use case |
| --- | --- | --- |
| `poly-get-wallet-overview` | MATIC + ERC‑20 balances, recent transfers, tags | Quick Polygon wallet intelligence |
| `poly-get-token-flows` | Inbound/outbound flows for a token + addresses | Detect accumulation, distribution, and flow anomalies |
| `poly-get-market-signals` | Aggregated signals for a set of tokens/markets | High‑level view for prediction prompts |
| `poly-get-polymarket-markets` | Active Polymarket markets + metadata | Feed subagents with market universe |
| `poly-get-polymarket-orderflow` | Approximate order‑flow and skew per market | Sentiment and skew detection for predictions |
| `poly-get-polymarket-resolutions` | Recently resolved markets + outcomes | Backtesting and model calibration |
| `poly-get-liquidity-events` | LP adds/removes and large swaps on core pools | Liquidity‑driven signal discovery |
| `poly-get-volatility-window` | Volatility + volume stats for a time window | Regime labeling and risk context |
| `poly-watch-address` | Live event feed for a Polygon address | Whale tracking, strategy mirroring, team wallets |
| `poly-get-block-snapshots` | Aggregated stats for recent Polygon blocks | Health, load, and throughput hints for timing |

## Folder layout

```text
extensions/
└── jelly-polygon-tentacle/
    ├── README.md
    ├── package.json
    ├── src/
    │   ├── index.ts
    │   ├── config/
    │   │   ├── env.ts
    │   │   ├── chains.ts
    │   │   └── capabilities.ts
    │   ├── client/
    │   │   ├── alchemy-polygon.ts         # Alchemy Polygon RPC + Data API client
    │   │   ├── rpc.ts                     # Low-level JSON-RPC helpers
    │   │   ├── data-api.ts                # Token/portfolio/price endpoints
    │   │   ├── webhooks.ts                # Webhook registration + handlers
    │   │   ├── polymarket.ts              # Polymarket contract + API integration
    │   │   └── signals.ts                 # Shared signal fetch/merge helpers
    │   ├── tools/
    │   │   ├── poly-get-wallet-overview.ts
    │   │   ├── poly-get-token-flows.ts
    │   │   ├── poly-get-market-signals.ts
    │   │   ├── poly-get-polymarket-markets.ts
    │   │   ├── poly-get-polymarket-orderflow.ts
    │   │   ├── poly-get-polymarket-resolutions.ts
    │   │   ├── poly-get-liquidity-events.ts
    │   │   ├── poly-get-volatility-window.ts
    │   │   ├── poly-watch-address.ts
    │   │   ├── poly-get-block-snapshots.ts
    │   │   └── poly-simulate-transaction.ts
    │   ├── subagents/
    │   │   ├── polygon-flow-agent.ts
    │   │   ├── polymarket-signal-agent.ts
    │   │   ├── volatility-window-agent.ts
    │   │   └── whale-scout-agent.ts
    │   ├── services/
    │   │   ├── wallet-service.ts          # High-level wallet read models
    │   │   ├── token-service.ts           # Token metadata + flows
    │   │   ├── market-service.ts          # Market + signal aggregation
    │   │   ├── polymarket-service.ts      # Polymarket market abstraction
    │   │   ├── liquidity-service.ts       # Pool + AMM event logic
    │   │   ├── volatility-service.ts      # Volatility/volume stats
    │   │   └── webhook-service.ts         # Polygon webhook orchestration
    │   ├── prompts/
    │   │   ├── polygon-signal-summary.ts
    │   │   ├── polymarket-prediction.ts
    │   │   ├── whale-tracker.ts
    │   │   └── liquidity-move-explainer.ts
    │   ├── schemas/
    │   │   ├── wallet.ts                  # Wallet schema (Polygon flavor)
    │   │   ├── token.ts                   # Token schema + flow/volume
    │   │   ├── market.ts                  # Prediction/market schema
    │   │   ├── signal.ts                  # Signal + confidence schema
    │   │   └── common.ts
    │   └── utils/
    │       ├── format.ts
    │       ├── normalize.ts
    │       ├── pagination.ts
    │       ├── time-windows.ts
    │       ├── math.ts
    │       └── errors.ts
    ├── examples/
    │   ├── polymarket-daily-digest.ts
    │   ├── polygon-whale-scanner.ts
    │   ├── polygon-signal-dashboard.ts
    │   └── realtime-market-monitor.ts
    ├── test/
    │   ├── tools.test.ts
    │   ├── services.test.ts
    │   ├── subagents.test.ts
    │   └── fixtures/
    └── docs/
        ├── polygon-signals.md
        ├── polymarket-playbooks.md
        ├── subagents.md
        └── webhook-recipes.md


---
