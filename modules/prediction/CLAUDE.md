# prediction — Prediction Markets Trading (Kalshi-focused)

Provides prediction market data and trading via the Kalshi API. Supports market listing, detail lookup, simulated trading, portfolio viewing, and price alerting. This module is distinct from `prediction-markets` — it focuses specifically on Kalshi trading operations.

## Tools

| Tool | Description |
|------|-------------|
| `markets` | List active Kalshi markets. Optional `--query` search, `--limit` (default: 20) |
| `market` | Get details for a specific market by `--id` |
| `trade` | Simulate placing a trade. Requires `--marketId`, `--position` (YES/NO), `--amount` |
| `portfolio` | View Kalshi portfolio (mock data: $1000 USDC balance) |
| `resolved` | List resolved Kalshi markets. Optional `--query`, `--limit` |
| `compareMarkets` | Compare prices for a `--query` across Kalshi, Polymarket, predict.fun (mock) |
| `arbitrage` | Detect arbitrage opportunities on a `--query`. Returns spread and estimated profit |
| `setAlert` | Set a price alert for a `--marketId` at a `--threshold` with optional `--direction` (above/below) |
| `checkAlerts` | List all active prediction alerts |
| `predictSignal` | Get a Jelly prediction signal for a given `--text`, optional `--chain` and `--market` |

## API

- **Kalshi**: `https://trading-api.kalshi.com/trade-api/v2`
- **Cache TTL**: 60 seconds
- **Circuit breaker**: `prediction-apis` with threshold of 5 failures

## Usage

```bash
node modules/prediction/run.mjs markets --query "BTC" --limit 20
node modules/prediction/run.mjs market --id <market_id>
node modules/prediction/run.mjs trade --marketId <id> --position YES --amount 100
node modules/prediction/run.mjs portfolio
node modules/prediction/run.mjs resolved --limit 10
node modules/prediction/run.mjs compareMarkets --query "election"
node modules/prediction/run.mjs arbitrage --query "BTC"
node modules/prediction/run.mjs setAlert --marketId <id> --threshold 0.65 --direction above
node modules/prediction/run.mjs checkAlerts
node modules/prediction/run.mjs predictSignal --text "BTC to $100k" --chain solana
```

## Notes

- Trade execution is simulated — does not place real orders
- `predictSignal` uses the core `predict` function for Jelly Score analysis
- Uses `ArbitrageAgent` for arbitrage detection in the `arbitrage` tool
- Alerts stored in memory via `createMemory()`
- For multi-platform aggregation, use the `prediction-markets` module instead
