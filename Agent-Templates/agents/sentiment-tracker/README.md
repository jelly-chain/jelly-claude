# sentiment-tracker

Aggregates social signals from news sources, Twitter/X, and Reddit for any prediction market topic. Computes a net sentiment score (−100 to +100) and overlays it on current YES/NO prices to flag divergences between crowd sentiment and market price.

## Required setup
1. Install `prediction-skill`, `polymarket-skill`, and `kalshi-skill`
2. Add Polymarket and Kalshi API keys to `~/.jelly-claude/.keys`

## Activate
```
/agent sentiment-tracker
```

## Example prompts
- "Track sentiment for 'Federal Reserve rate cut' and overlay on Kalshi market"
- "What's the social sentiment for Solana price markets right now?"
- "Is there a sentiment divergence on the BTC ETF approval market?"
- "Aggregate news and Twitter sentiment for any 2026 US election market"
