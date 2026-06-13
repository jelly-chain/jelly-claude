# prediction-markets — Multi-Platform Prediction Markets

Aggregates prediction market data across Polymarket, Kalshi, and predict.fun. Supports market comparison, arbitrage detection, and price monitoring with alerting.

## Tools

| Tool | Description |
|------|-------------|
| `polymarkets` | List Polymarket markets. Optional `--query` search, `--limit` (default: 10). Includes Jelly Score signal per market |
| `kalshiMarkets` | ListKalshi markets. Optional `--query`, `--limit`. Requires `KALSHI_API_KEY` env var for authenticated access |
| `predictFunMarkets` | List predict.fun markets. Optional `--query`, `--limit` |
| `compareMarkets` | Search for the same `--query` across Polymarket and predict.fun. Shows top 5 from each |
| `arbitrage` | Detect arbitrage opportunities via `ArbitrageAgent` |
| `monitorPrices` | Monitor price for a `--marketId` across platforms. Shows spread and arbitrage flag (>3% = opportunity) |
| `setAlert` | Set price alert for a `--marketId` at a `--threshold` price |
| `checkAlerts` | Check all active price alerts |

## APIs

- **Polymarket**: `https://gamma-api.polymarket.com`
- **Kalshi**: `https://trading-api.kalshi.com/trade-api/v2`
- **predict.fun**: `https://api.predict.fun`
- **Cache TTL**: 30 seconds
- **Circuit breaker**: `pred-market-apis` with threshold of 5 failures

## Usage

```bash
node modules/prediction-markets/run.mjs polymarkets --query "election" --limit 20
node modules/prediction-markets/run.mjs kalshiMarkets --limit 10
node modules/prediction-markets/run.mjs predictFunMarkets --query "sports"
node modules/prediction-markets/run.mjs compareMarkets --query "BTC"
node modules/prediction-markets/run.mjs arbitrage --query "BTC"
node modules/prediction-markets/run.mjs monitorPrices --marketId <id>
node modules/prediction-markets/run.mjs setAlert --marketId <id> --threshold 0.65
node modules/prediction-markets/run.mjs checkAlerts
```

## Notes

- Polymarket results include Jelly Score and signal from `core/prediction.mjs`
- Kalshi requires US eligibility
- `monitorPrices` flags arbitrage when spread > 3%
- Alerts are persisted via `createMemory()`
