# kalshi-polymarket-spreader

Specialized cross-market arbitrage agent for Kalshi ↔ Polymarket pairs. Handles the collateral type differences (USD fiat on Kalshi vs. USDC on Polygon) and computes true net arbitrage after all fees, capital lock-up costs, and transfer delays to identify genuinely profitable spreads.

## Required setup
1. Install `kalshi-skill` and `polymarket-skill`
2. Add `KALSHI_API_KEY`, `KALSHI_API_SECRET`, and Polymarket API keys to `~/.jelly-claude/.keys`
3. Fund your Polygon wallet with USDC for Polymarket legs

## Activate
```
/agent kalshi-polymarket-spreader
```

## Example prompts
- "Find Kalshi↔Polymarket arb on the Fed rate decision next month"
- "Is there a profitable spread between Kalshi and Polymarket on the 2026 election?"
- "Show me all Kalshi markets with a Polymarket equivalent and net spread > 3%"
- "Execute the arb: Leg A on Kalshi, Leg B on Polymarket"
