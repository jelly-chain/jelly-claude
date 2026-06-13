# market — Market Prediction & Signal Engine

SDK-powered prediction, signal detection, anomaly analysis, and backtesting. This is the primary module for generating Jelly Score predictions and market signals.

## Tools

| Tool | Description |
|------|-------------|
| `predict` | Generate a prediction signal with Jelly Score (0-100). Requires `--text`, optional `--chain` |
| `batchPredict` | Run predictions on multiple inputs at once |
| `scoreMarket` | Score a specific prediction market. Requires `--question`, optional `--chain` |
| `signals` | Run signal hunter across DeFi protocols. Optional `--minScore` threshold |
| `scanKeywords` | Run keyword trigger detection on free text |
| `scanThresholds` | Run threshold trigger detection on numeric data |
| `anomalies` | Get detector status |
| `detectVolume` | Detect volume spikes. Requires `--current` value and `--history` array |
| `detectTvl` | Detect TVL shocks |
| `backtest` | Backtest scenarios against prediction engine. Requires `--scenarios` JSON array |

## Output Format (predict)

```json
{
  "ok": true,
  "signal": "bullish",
  "jellyScore": 78,
  "confidence": 0.78,
  "riskScore": 0.32,
  "suggestion": "Moderate signal — half position size on YES.",
  "chain": "solana"
}
```

## Usage

```bash
node modules/market/run.mjs predict --text "Solana TVL surge breakout" --chain solana
node modules/market/run.mjs signals --minScore 70
node modules/market/run.mjs scoreMarket --question "Will SOL reach $200?" --chain solana
node modules/market/run.mjs detectVolume --current 500000 --history "[50000,60000,55000]"
node modules/market/run.mjs backtest --scenarios '[{"signal":"bullish","chain":"solana","actualReturn":0.8}]'
```

## Notes

- Jelly Score ranges from 0-100 (higher = stronger signal)
- Signal values: `bullish`, `bearish`, `neutral`
- Risk score indicates potential downside (0-1, lower = safer)
- Suggestions provide actionable trading guidance
- See `README.md` in this module directory for detailed documentation
