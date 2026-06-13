# portfolio — Portfolio Tracker

Manages a multi-chain portfolio of crypto assets. Supports adding, removing, and listing assets with mock USD valuation. Tracks portfolio history over time.

## Tools

| Tool | Description |
|------|-------------|
| `add` | Add an asset to the portfolio. Requires `--asset` (ticker), `--chain`, `--amount` |
| `remove` | Remove an asset from the portfolio. Requires `--asset` and `--chain` |
| `list` | List all portfolio assets with amounts and mock USD values. Shows total portfolio value |
| `history` | Get portfolio performance history (mock data) |

## Supported Assets (Mock Prices)

| Asset | Chain | Mock Price (USD) |
|-------|-------|-------------------|
| SOL | solana | $100 |
| ETH | ethereum | $2,000 |
| BTC | bitcoin | $50,000 |
| USDC | any | $1 |
| USDT | any | $1 |
| BNB | bnb | $300 |
| MATIC | polygon | $0.50 |

## Usage

```bash
node modules/portfolio/run.mjs add --asset SOL --chain solana --amount 10
node modules/portfolio/run.mjs add --asset ETH --chain ethereum --amount 2.5
node modules/portfolio/run.mjs list
node modules/portfolio/run.mjs remove --asset SOL --chain solana
node modules/portfolio/run.mjs history
```

## Notes

- Portfolio data is stored in cache (not persisted to disk)
- USD values use mock prices — real price feeds not yet integrated
- Assets are identified by uppercase ticker + lowercase chain
- Total value is sum of (amount × mock price) across all assets
