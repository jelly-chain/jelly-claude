# backtester — Strategy Backtesting Engine

Simulates trading strategies against historical data, optimizes strategy parameters, and compares multiple strategies. Currently uses mock data for simulation results.

## Tools

| Tool | Description |
|------|-------------|
| `simulate` | Run a backtest simulation for a `--strategy` against a `--dataset`. Optional `--start` and `--end` dates. Returns total return, Sharpe ratio, max drawdown, and trade count |
| `optimize` | Optimize parameters for a given `--strategy`. Returns optimized parameter set |
| `compare` | Compare two strategies (`--strategy1` and `--strategy2`) against the same dataset. Returns both results and a winner |

## Usage

```bash
node modules/backtester/run.mjs simulate --strategy sma_cross --dataset SOL_30d --start 2024-01-01
node modules/backtester/run.mjs optimize --strategy sma_cross
node modules/backtester/run.mjs compare --strategy1 sma_cross --strategy2 rsi_divergence --dataset SOL_30d
```

## Notes

- Currently uses mock/random data for simulation results
- Returns: totalReturn (%), Sharpe ratio, maxDrawdown (%), trade count
- Date format: `YYYY-MM-DD`
