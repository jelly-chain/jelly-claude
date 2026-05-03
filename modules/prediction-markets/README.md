# prediction-markets module

Query and score prediction markets across Polymarket, Kalshi, and predict.fun.

## Usage

```bash
node modules/prediction-markets/run.mjs polymarkets --limit 10
node modules/prediction-markets/run.mjs polymarkets --query "Bitcoin" --limit 5
node modules/prediction-markets/run.mjs kalshiMarkets
node modules/prediction-markets/run.mjs predictFunMarkets
node modules/prediction-markets/run.mjs compareMarkets --query "Fed rate cut"
node modules/prediction-markets/run.mjs arbitrage --query "BTC"
```

## Tools

| Tool | Description |
|------|-------------|
| `polymarkets` | Top Polymarket markets, scored with Jelly Score |
| `kalshiMarkets` | Top Kalshi markets |
| `predictFunMarkets` | Top predict.fun markets |
| `compareMarkets` | Compare same event across all platforms |
| `arbitrage` | Find cross-platform price gaps (auto arb detection) |
