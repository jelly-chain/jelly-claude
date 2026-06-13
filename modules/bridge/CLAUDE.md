# bridge — Cross-Chain Bridge Aggregator

Provides cross-chain bridge routing, fee estimation, transaction status tracking, and bridge health monitoring. Uses the LI.FI API for route discovery.

## Tools

| Tool | Description |
|------|-------------|
| `routes` | Find bridging routes via LI.FI. Requires `--fromChain`, `--toChain`, `--fromToken`, `--toToken`, `--fromAmount`. Returns up to 5 cheapest routes |
| `fees` | Get fee comparison across routes (wraps `routes`). Shows cheapest route and gas estimates |
| `status` | Check bridge transaction status by `--txHash` |
| `estimateGas` | Estimate gas costs for bridging. Same args as `routes`. Returns gas estimates per route |
| `compareBridges` | Compare routes by gas, speed, and steps. Shows cheapest, fastest, and fewest-hops routes |
| `simulate` | Simulate the cheapest bridge route. Shows expected arrival time and total cost |
| `health` | Check bridge health status for LI.FI, Wormhole, BNB Bridge, Polygon Bridge |
| `list` | List all supported bridges and their chains |

## API

- **Data source**: `https://li.quest/v1` (LI.FI bridge aggregator)
- **Cache TTL**: 60 seconds
- **Circuit breaker**: `bridge-apis` with threshold of 5 failures
- **Module**: `bridge` v1.0.0

## Usage

```bash
node modules/bridge/run.mjs routes --fromChain 1 --toChain 56 --fromToken 0x... --toToken 0x... --fromAmount 100000000
node modules/bridge/run.mjs fees --fromChain 1 --toChain 56 --fromToken 0x... --toToken 0x... --fromAmount 100000000
node modules/bridge/run.mjs status --txHash 0xabc123
node modules/bridge/run.mjs compareBridges --fromChain 1 --toChain 56 --fromToken 0x... --toToken 0x... --fromAmount 100000000
node modules/bridge/run.mjs simulate --fromChain 1 --toChain 56 --fromToken 0x... --toToken 0x... --fromAmount 100000000
node modules/bridge/run.mjs health
node modules/bridge/run.mjs list
```

## Supported Bridges

- **LI.FI** — Universal bridge aggregator (Solana, BNB Chain, Polygon, Ethereum)
- **Wormhole** — Cross-chain message passing
- **BNB Bridge** — Binance official bridge
- **Polygon Bridge** — Polygon PoS bridge
