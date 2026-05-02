# jelly-forex-skills

Six traditional-finance skills for Claude Code agents — stock trading, forex, options flow, fundamentals, historical data, and SEC filings.

Skills live at `~/.claude/skills/<name>/SKILL.md` after installation.

## Skills

| Skill | What it does | Keys needed |
|-------|-------------|-------------|
| `alpaca-skill` | Stock & ETF trading (paper + live) via Alpaca API | `ALPACA_API_KEY`, `ALPACA_API_SECRET` |
| `oanda-skill` | Forex & CFD trading via OANDA (practice + live) | `OANDA_API_TOKEN`, `OANDA_ACCOUNT_ID` |
| `polygon-skill` | Options chains, unusual flow, historical OHLCV | `POLYGON_API_KEY` |
| `alpha-vantage-skill` | Fundamentals, earnings, DCF, RSI/MACD | `ALPHA_VANTAGE_API_KEY` |
| `yfinance-skill` | Historical prices, dividends, screeners (Python) | None |
| `sec-edgar-skill` | SEC filing retrieval, XBRL data, full-text search | `SEC_USER_AGENT` (email) |

## Install all skills

```bash
bash install-all.sh
```

Or install a single skill:
```bash
bash skills/alpaca-skill/install.sh
```

## Windows (PowerShell)

```powershell
.\install-all.ps1
```

## Usage with jelly-forex

This repo is designed to work alongside [jelly-forex](https://github.com/jelly-chain/jelly-forex) (the launcher) and [jelly-forex-agents](https://github.com/jelly-chain/jelly-forex-agents). Run `setup.sh` from jelly-forex to install everything automatically.

## Keys

All keys are stored at `~/.jelly-forex/.keys`. Copy `.keys.example` from any skill directory to see the required format.
