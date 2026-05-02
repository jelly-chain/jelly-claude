# jelly-forex

An AI-powered traditional finance agent system built on Claude Code. Combines six financial data skills with six specialised agents — covering stock trading, forex, options flow, fundamental analysis, portfolio tracking, and SEC filing research.

## What's inside

| Component | Repo | What it does |
|-----------|------|-------------|
| **Launcher** | jelly-forex (this repo) | Setup wizard, key management, Claude Code launcher |
| **Skills** | jelly-forex-skills | 6 API skill sheets for Claude Code |
| **Agents** | jelly-forex-agents | 6 specialised agent templates |

## Quick start

```bash
# 1. Clone all three repos (side by side)
git clone https://github.com/jelly-chain/Extension/jelly-forex.git
git clone https://github.com/jelly-chain/Extension/jelly-forex-skills.git
git clone https://github.com/jelly-chain/Extension/jelly-forex-agents.git

# 2. Run setup (installs skills, agents, saves keys)
cd jelly-forex
bash setup.sh

# 3. Start the agent
bash jelly-forex.sh
```

## Windows

```powershell
.\setup.ps1
.\jelly-forex.ps1
```

## Skills included

| Skill | What it covers |
|-------|---------------|
| `alpaca-skill` | Commission-free stock/ETF trading — paper + live, bracket orders |
| `oanda-skill` | Forex & CFD trading — 70+ pairs, pip calculator, streaming prices |
| `polygon-skill` | Options chains, unusual flow, IV surface, historical OHLCV |
| `alpha-vantage-skill` | Fundamentals, earnings, DCF, RSI, MACD |
| `yfinance-skill` | Historical data, dividends, screeners (Python, no key needed) |
| `sec-edgar-skill` | 10-K/10-Q/8-K retrieval, XBRL data, full-text search |

## Agents included

| Agent | What it does |
|-------|-------------|
| `stock-trader` | Paper trading by default — 1% risk rule, bracket orders enforced |
| `forex-trader` | Practice mode by default — pip sizing, SMA signals, stop-loss enforced |
| `options-scanner` | Unusual flow detection, vol/OI screening, IV surface analysis |
| `fundamentals-analyst` | DCF models, earnings trends, peer comparisons |
| `portfolio-tracker` | Unified P&L across Alpaca + OANDA accounts |
| `filing-reader` | SEC filing research, XBRL data, red flag detection |

## Safety first

Both `stock-trader` and `forex-trader` operate in **paper/practice mode by default**. You must explicitly confirm live trading intent before any real money is involved. See [STRATEGIES.md](./STRATEGIES.md) for responsible trading playbooks.

## Keys

Keys are stored at `~/.jelly-forex/.keys`. Run `setup.sh` to set them up interactively.

See each skill's `.keys.example` for the exact format.
