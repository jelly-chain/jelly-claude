# jelly-score-optimizer

Run any prediction market question through the full JellyScore pipeline and receive a structured YES/NO recommendation with Jelly Score (0–100), confidence tier, and suggested position size.

## Required setup
1. Install `prediction-skill`: `bash jelly-claude-skills/skills/prediction-skill/install.sh`
2. Install `polymarket-skill` and `kalshi-skill`
3. Add Polymarket and Kalshi API keys to `~/.jelly-claude/.keys`

## Activate
```
/agent jelly-score-optimizer
```

## Example prompts
- "Score this market: Will ETH reach $5,000 by end of 2025?"
- "Run a Jelly Score on the Fed rate cut market on Kalshi"
- "Is there arbitrage between Polymarket and Kalshi on the BTC price market?"
- "Analyze Polymarket market ID 0xabc123 and give me a full conviction report"
