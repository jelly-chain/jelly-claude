# kalshi — Kalshi Prediction Markets

Kalshi prediction market trading module. Provides market data, simulated trading, portfolio viewing, arbitrage detection, and price alerts via the Kalshi Trade API v2.

## Tools

| Tool | Description |
|------|-------------|
| `markets` | List active Kalshi markets. Optional `--query` search, `--limit` (default: 20) |
| `market` | Get market details by `--id` |
| `trade` | Simulate placing a trade. Requires `--marketId`, `--position` (YES/NO), `--amount` |
| `portfolio` | View Kalshi portfolio (mock: $1000 USDC balance) |
| `resolved` | List resolved markets. Optional `--query`, `--limit` |
| `compareMarkets` | Compare prices across Kalshi, Polymarket, predict.fun (mock) |
| `arbitrage` | Detect arbitrage opportunities. Optional `--query` (default: BTC) |
| `setAlert` | Set price alert for `--marketId` at `--threshold` with optional `--direction` |
| `checkAlerts` | List all active Kalshi alerts |
| `predictSignal` | Get Jelly prediction signal for `--text`, optional `--chain` and `--market` |

## API

- **Kalshi**: `https://trading-api.kalshi.com/trade-api/v2`
- **Cache TTL**: 60 seconds
- **Circuit breaker**: `kalshi-apis` with threshold of 5 failures
- **Module**: `kalshi` v1.0.0

## Usage

```bash
node modules/kalshi/run.mjs markets --query "BTC" --limit 20
node modules/kalshi/run.mjs market --id <market_id>
node modules/kalshi/run.mjs trade --marketId <id> --position YES --amount 100
node modules/kalshi/run.mjs portfolio
node modules/kalshi/run.mjs resolved --limit 10
node modules/kalshi/run.mjs compareMarkets --query "election"
node modules/kalshi/run.mjs arbitrage --query "BTC"
node modules/kalshi/run.mjs setAlert --marketId <id> --threshold 0.65
node modules/kalshi/run.mjs checkAlerts
node modules/kalshi/run.mjs predictSignal --text "BTC to $100k" --chain solana
```

## Notes

- Trade execution is simulated — does not place real orders
- `predictSignal` uses the core `predict` function for Jelly Score analysis
- Alerts stored in memory via `createMemory()`
- Kalshi requires US eligibility
- This module is nearly identical to the `prediction` module (which appears to be an earlier version)
