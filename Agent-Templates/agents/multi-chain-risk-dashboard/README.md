# multi-chain-risk-dashboard

Aggregates all open prediction market positions (Polymarket, Kalshi, predict.fun) and DeFi positions (Raydium, Meteora, Orca) into a single risk dashboard. Shows total USD exposure, Value-at-Risk estimate, concentration warnings, and correlated position flags.

## Required setup
1. Install all prediction market skills: `polymarket-skill`, `kalshi-skill`, `predict-fun-skill`
2. Install `solana-wallet-skill`, `bnb-wallet-skill`, `birdeye-skill`, and `helius-skill`
3. Add all API keys to `~/.jelly-claude/.keys`

## Activate
```
/agent multi-chain-risk-dashboard
```

## Example prompts
- "Show me my full risk dashboard across all prediction and DeFi platforms"
- "What's my total exposure right now and am I over the concentration limits?"
- "Which of my positions are correlated with each other?"
- "Is my portfolio within the Jelly 5% position sizing rules?"
