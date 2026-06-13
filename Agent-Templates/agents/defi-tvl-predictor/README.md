# defi-tvl-predictor

Tracks DeFiLlama TVL changes on key protocols and chains. Uses TVL momentum as a leading indicator for "DeFi ecosystem" prediction markets on Polymarket and Kalshi, overlaying the TVL signal on current YES/NO prices to find edge.

## Required setup
1. Install `jelly-skill`, `prediction-skill`, `polymarket-skill`, and `kalshi-skill`
2. Add Polymarket and Kalshi API keys to `~/.jelly-claude/.keys`
3. No additional API keys required — DeFiLlama data is public via jelly-skill

## Activate
```
/agent defi-tvl-predictor
```

## Example prompts
- "What's the TVL momentum for Solana this week and how does it affect Polymarket markets?"
- "Check if Aave TVL is bullish and overlay on any Kalshi DeFi markets"
- "TVL predictor analysis for Raydium — is the trend bullish for ecosystem markets?"
- "Show me protocols with the highest TVL gains in 24h and map them to prediction markets"
