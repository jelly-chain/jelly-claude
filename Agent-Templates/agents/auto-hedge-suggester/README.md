# auto-hedge-suggester

Given a set of open prediction market positions, suggests the most cost-effective hedging trades — opposite positions on correlated markets or DeFi-based hedges — to reduce net delta exposure below a configurable threshold (default: 3% of portfolio).

## Required setup
1. Install `polymarket-skill`, `kalshi-skill`, `predict-fun-skill`, `prediction-skill`
2. Install `jupiter-skill` and `solana-wallet-skill` for DeFi hedge options
3. Add all API keys to `~/.jelly-claude/.keys`
4. Fund wallets on each platform you want to hedge on

## Activate
```
/agent auto-hedge-suggester
```

## Example prompts
- "Suggest hedges for my current Polymarket and Kalshi positions"
- "My net delta on BTC price markets is too high — how do I hedge it cheaply?"
- "Find the most cost-effective way to reduce my exposure to the Fed rate decision market"
- "Run a full hedge analysis and propose the minimum trades to bring all deltas below 3%"
