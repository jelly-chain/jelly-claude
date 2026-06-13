# polymarket-trader

Browse, analyze, and trade Polymarket prediction markets on Polygon blockchain.

## Required setup
1. Install `polymarket-skill`: `bash jelly-claude-skills/skills/polymarket-skill/install.sh`
2. Get API keys at [app.polymarket.com](https://app.polymarket.com) → Settings → API
3. Fund your Polygon wallet with USDC
4. Add keys to `~/.jelly-claude/.keys`

## Activate
```
/agent polymarket-trader
```

## Example prompts
- "Find markets about crypto prices this year"
- "Buy $20 YES on [market]"
- "Show my positions and P&L"
