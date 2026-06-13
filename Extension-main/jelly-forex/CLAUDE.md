# Jelly-Forex — Claude Code Configuration

This file is loaded automatically by Claude Code when you start from the jelly-forex directory.

## Active skills

All skills are installed at `~/.claude/skills/<name>/SKILL.md`.

| Skill path | What it covers |
|-----------|---------------|
| `~/.claude/skills/alpaca-skill/SKILL.md` | Alpaca stock/ETF trading — paper + live, orders, positions, WebSocket |
| `~/.claude/skills/oanda-skill/SKILL.md` | OANDA forex/CFD trading — practice + live, pip calculator, candles, streaming |
| `~/.claude/skills/polygon-skill/SKILL.md` | Polygon.io options chains, unusual flow, historical OHLCV, IV surface |
| `~/.claude/skills/alpha-vantage-skill/SKILL.md` | Alpha Vantage fundamentals, earnings, DCF, RSI, MACD |
| `~/.claude/skills/yfinance-skill/SKILL.md` | yfinance Python — historical data, screeners, dividends (no key) |
| `~/.claude/skills/sec-edgar-skill/SKILL.md` | SEC EDGAR — 10-K/10-Q/8-K, XBRL facts, full-text search |

## Active agents

All agents are installed at `~/.claude/agents/<name>.md`. Invoke with `/agent <name>`.

| Agent | Purpose |
|-------|---------|
| `stock-trader` | Alpaca paper/live stock trading |
| `forex-trader` | OANDA practice/live forex trading |
| `options-scanner` | Unusual options flow via Polygon |
| `fundamentals-analyst` | DCF and earnings analysis |
| `portfolio-tracker` | Multi-account portfolio view |
| `filing-reader` | SEC EDGAR filing research |

## Keys location

All API keys and credentials are stored at:
```
~/.jelly-forex/.keys
```

This file is loaded automatically when you run `jelly-forex.sh` (or `jelly-forex.ps1` on Windows).

## Paper trading is the default

Both `stock-trader` (Alpaca) and `forex-trader` (OANDA) start in paper/practice mode.
You must explicitly confirm live trading intent in any session that uses real money.

## Strategies

See [STRATEGIES.md](./STRATEGIES.md) for multi-agent trading playbooks covering:
1. Earnings momentum play (stock-trader + fundamentals-analyst)
2. Forex momentum + carry trade (forex-trader)
3. Covered call writing (options-scanner + stock-trader)
4. Fundamental value screener (fundamentals-analyst + stock-trader)
