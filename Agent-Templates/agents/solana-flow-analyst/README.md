# solana-flow-analyst

Real-time token flow analysis on Solana — identifies net accumulation vs. distribution on any SPL token over a configurable rolling window using the Helius enhanced transactions API. Produces a Flow Score (0–100) used as a Jelly Score signal component.

## Required setup
1. Install `helius-skill` and `birdeye-skill`
2. Add `HELIUS_API_KEY` and `BIRDEYE_API_KEY` to `~/.jelly-claude/.keys`

## Activate
```
/agent solana-flow-analyst
```

## Example prompts
- "Analyze the last 24h flow for SOL and tell me if whales are accumulating"
- "Is JUP seeing exchange inflows right now? Is there sell pressure?"
- "Flow analysis for BONK over the last 4 hours — smart money or retail?"
- "Which Solana tokens have the highest smart-money accumulation scores today?"
