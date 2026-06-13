# analytics — DeFi Analytics Engine

Provides DeFi market analytics including TVL data, protocol metrics, chain comparisons, top gainers, and market reports. Fetches data from the Llama.fi API with caching and circuit breaker protection.

## Tools

| Tool | Description |
|------|-------------|
| `tvl` | Get Total Value Locked data. Without `--protocol`, returns top 20 chains by TVL. With `--protocol`, returns TVL for a specific protocol |
| `protocols` | List protocols sorted by TVL. Optional `--chain` filter, `--limit` for count (default: 20) |
| `chainMetrics` | Get metrics for a specific chain (default: Solana). Includes TVL and a prediction signal |
| `topGainers` | Get top protocols by 24h change. `--limit` controls count (default: 10) |
| `report` | Generate a comprehensive market report. `--include` comma-separated sections: tvl,protocols,chainMetrics,topGainers |
| `correlation` | Analyze correlations between assets (not yet implemented) |
| `trend` | Simple trend analysis for a given `--asset` (placeholder implementation) |

## API

- **Data source**: `https://api.llama.fi` (Llama.fi DeFi analytics)
- **Cache TTL**: 5 minutes
- **Circuit breaker**: `llama-fi` with threshold of 5 failures

## Usage

```bash
node modules/analytics/run.mjs tvl
node modules/analytics/run.mjs tvl --protocol uniswap
node modules/analytics/run.mjs protocols --chain Solana --limit 10
node modules/analytics/run.mjs chainMetrics --chain Solana
node modules/analytics/run.mjs topGainers --limit 5
node modules/analytics/run.mjs report --include tvl,protocols,topGainers
node modules/analytics/run.mjs trend --asset SOL
```

## Notes

- `correlation` is not yet implemented (returns error)
- `trend` returns a placeholder neutral signal
- `chainMetrics` includes a Jelly prediction signal via `core/prediction.mjs`
