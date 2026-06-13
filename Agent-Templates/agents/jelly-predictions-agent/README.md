# jelly-predictions-agent

Research prediction market opportunities using live on-chain data from jellychain.fun — cross-referenced with Polymarket and Kalshi markets.

## Activate
```
/agent jelly-predictions-agent
```

## Required setup
1. Install required skills:
   ```bash
   bash ../jelly-claude-skills/skills/jelly-skill/install.sh
   bash ../jelly-claude-skills/skills/polymarket-skill/install.sh
   bash ../jelly-claude-skills/skills/kalshi-skill/install.sh
   ```
2. Optionally add trading keys to `~/.jelly-claude/.keys`:
   ```
   POLYMARKET_API_KEY=...
   KALSHI_API_KEY=...
   ```
   Keys are not needed for read-only research — only for placing trades.
