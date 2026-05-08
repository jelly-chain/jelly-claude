# event-risk-scorer

Given any upcoming event (election, Fed meeting, sports match, protocol upgrade), enumerates all risk factors and produces a structured risk report with a Jelly Risk Score (0–100). Designed to run before any prediction market trade — feeds into jelly-score-optimizer.

## Required setup
1. Install `prediction-skill`, `polymarket-skill`, and `kalshi-skill`
2. Add Polymarket and Kalshi API keys to `~/.jelly-claude/.keys`

## Activate
```
/agent event-risk-scorer
```

## Example prompts
- "Score the risk for betting on the next Fed rate decision"
- "What are the risk factors for a Solana ecosystem market on Polymarket?"
- "Risk report for the next US election prediction market"
- "How risky is the BTC $100K market on Kalshi before I trade?"
