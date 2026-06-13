# copytrader — Copy Trading

Discovers traders to copy, manages copy trading positions, and tracks copy trading portfolio. Currently returns mock data.

## Tools

| Tool | Description |
|------|-------------|
| `discover` | Discover traders to copy. Returns list with win rates, trade counts, and profit |
| `copy` | Start copying a trader by `--traderId` with `--amount` |
| `stopCopying` | Stop copying a trader by `--traderId` |
| `portfolio` | View copy trading portfolio (total value, allocated, performance) |

## Usage

```bash
node modules/copytrader/run.mjs discover
node modules/copytrader/run.mjs copy --traderId trader1 --amount 1000
node modules/copytrader/run.mjs stopCopying --traderId trader1
node modules/copytrader/run.mjs portfolio
```

## Notes

- Currently returns mock data
- Uses caching (60s TTL)
- Trader discovery returns mock traders with win rates and profit data
