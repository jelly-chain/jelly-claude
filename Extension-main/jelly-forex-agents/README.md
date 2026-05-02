# jelly-forex-agents

Six specialised Claude Code agent templates for traditional finance — stock trading, forex, options scanning, fundamental analysis, portfolio tracking, and SEC filing research.

Agents install to `~/.claude/agents/<name>.md` and are invoked inside Claude Code with `/agent <name>`.

## Agents

| Agent | Purpose | Skills needed |
|-------|---------|---------------|
| `stock-trader` | Paper/live stock trading on Alpaca — bracket orders, 1% risk rule | `alpaca-skill` |
| `forex-trader` | Forex trading on OANDA — practice mode, pip calculator, SMA signals | `oanda-skill` |
| `options-scanner` | Unusual options flow, IV surface, vol/OI screening | `polygon-skill`, `alpha-vantage-skill` |
| `fundamentals-analyst` | DCF models, earnings analysis, peer comparisons | `alpha-vantage-skill`, `yfinance-skill` |
| `portfolio-tracker` | Multi-account P&L aggregation across Alpaca + OANDA | `alpaca-skill`, `oanda-skill` |
| `filing-reader` | SEC EDGAR 10-K/10-Q/8-K retrieval, XBRL data, red flags | `sec-edgar-skill`, `alpha-vantage-skill` |

## Install all agents

```bash
bash install-all.sh
```

Install a single agent:
```bash
bash install-all.sh --only stock-trader
```

## Windows (PowerShell)

```powershell
.\install-all.ps1
# Or a single agent:
.\install-all.ps1 --only stock-trader
```

## Usage

Inside Claude Code, invoke any agent:
```
/agent stock-trader
/agent forex-trader
/agent options-scanner
/agent fundamentals-analyst
/agent portfolio-tracker
/agent filing-reader
```

## Paper trading by default

Both `stock-trader` (Alpaca) and `forex-trader` (OANDA) default to paper/practice mode. You must explicitly confirm live trading intent before either agent will switch to real money.
