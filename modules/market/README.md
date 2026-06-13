# market module

SDK-powered prediction, signal detection, anomaly analysis, and backtesting.

## Usage

```bash
# Mac/Linux
node modules/market/run.mjs predict --text "Solana TVL surge breakout" --chain solana
node modules/market/run.mjs signals --minScore 70
node modules/market/run.mjs detectVolume --current 500000 --history "[50000,60000,55000]"
node modules/market/run.mjs scoreMarket --question "Will SOL reach $200?" --chain solana
node modules/market/run.mjs backtest --scenarios '[{"signal":"bullish","chain":"solana","actualReturn":0.8}]'

# Windows
node modules\market\run.mjs predict --text "BNB pump" --chain bnb
```

## Tools

| Tool | Description |
|------|-------------|
| `predict` | Generate a prediction signal with Jelly Score (0–100) |
| `batchPredict` | Predict on multiple inputs at once |
| `scoreMarket` | Score a specific prediction market |
| `signals` | Run signal hunter across DeFi protocols |
| `scanKeywords` | Run keyword trigger on free text |
| `scanThresholds` | Run threshold trigger on numeric data |
| `anomalies` | Detector status |
| `detectVolume` | Detect volume spikes |
| `detectTvl` | Detect TVL shocks |
| `backtest` | Backtest a scenario list against prediction engine |

## Output (predict)

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
