# whale-signal-predictor

Monitors configured whale wallets via Helius. When a qualified whale enters a large position on a token correlated with a prediction market event, fires a JellyScore re-evaluation and produces a structured signal alert.

## Required setup
1. Install `helius-skill` and `birdeye-skill`
2. Add `HELIUS_API_KEY` and `BIRDEYE_API_KEY` to `~/.jelly-claude/.keys`
3. Solana wallet (read-only monitoring — no trade execution in this agent)

## Activate
```
/agent whale-signal-predictor
```

## Example prompts
- "Monitor these whale wallets and alert me on any SOL/JUP move over $100K"
- "Who are the top 10 most profitable Solana wallets trading JUP right now?"
- "A whale just bought $500K of SOL — which prediction markets are correlated?"
- "Set a whale alert for any Solana ecosystem token buy over $50K"
