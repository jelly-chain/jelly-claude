# kalshi-trader

Browse, analyze, and trade Kalshi binary prediction market contracts (US regulated, fiat-based).

## Required setup
1. Create account at [kalshi.com](https://kalshi.com)
2. Get API keys at Account → API Access
3. Install `kalshi-skill`: `bash jelly-claude-skills/skills/kalshi-skill/install.sh`
4. Add keys to `~/.claude/skills/kalshi-skill/.keys`
5. Start with `KALSHI_BASE_URL=https://demo-api.kalshi.co/trade-api/v2`

## Activate
```
/agent kalshi-trader
```
