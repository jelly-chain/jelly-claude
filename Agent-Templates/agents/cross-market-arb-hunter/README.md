# cross-market-arb-hunter

Monitor the same event simultaneously across Polymarket, Kalshi, and predict.fun. Flags price divergences above a configurable threshold and suggests the highest-EV trade direction with net spread calculated after all platform fees.

## Required setup
1. Install `polymarket-skill`, `kalshi-skill`, and `predict-fun-skill`
2. Add API keys for all three platforms to `~/.jelly-claude/.keys`
3. Fund wallets: USDC on Polygon (Polymarket), USD on Kalshi, USDT on BNB Chain (predict.fun)

## Activate
```
/agent cross-market-arb-hunter
```

## Example prompts
- "Find arb opportunities between Polymarket and Kalshi on the next Fed rate decision"
- "Scan all three platforms for BTC price markets expiring this month"
- "Alert me when any market pair has a net spread above 4%"
- "Is there a profitable arb on the 2026 US election markets?"
