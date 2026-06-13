# Jelly-Forex — Agents Reference (6 agents)

Agents are installed at `~/.claude/agents/<agent-name>.md`.  
Invoke inside Claude Code with `/agent <agent-name>`.

---

## stock-trader
**Purpose:** Commission-free stock and ETF trading via Alpaca — paper mode by default, bracket orders, 1% risk rule, position sizing, PDT rule awareness.  
**Required skills:** `alpaca-skill`  
**Required keys:** `ALPACA_API_KEY`, `ALPACA_API_SECRET`  
**Safety:** Paper trading enforced by default. Explicit confirmation required before live trading.  
**Example prompts:**
- "Buy 10 AAPL at market with a $5 stop-loss (paper)"
- "Place a bracket order: buy NVDA at $850, stop $800, target $950"
- "Show me my open positions and P&L"

---

## forex-trader
**Purpose:** Forex and CFD trading via OANDA — practice mode by default, pip calculator, SMA crossover signals, stop-loss attached to every order.  
**Required skills:** `oanda-skill`  
**Required keys:** `OANDA_API_TOKEN`, `OANDA_ACCOUNT_ID`  
**Safety:** Practice account enforced by default. Live confirmed explicitly.  
**Example prompts:**
- "Buy 5,000 EUR/USD at market with 20-pip stop (practice)"
- "What is the SMA crossover signal on EUR/USD H1 right now?"
- "Calculate position size for 1% risk with a 30-pip stop on GBP/USD"

---

## options-scanner
**Purpose:** Unusual options flow detection via Polygon.io — vol/OI ratio screening, premium size filtering, IV surface, break-even analysis, institutional flow context.  
**Required skills:** `polygon-skill`, `alpha-vantage-skill`  
**Required keys:** `POLYGON_API_KEY`, `ALPHA_VANTAGE_API_KEY`  
**Example prompts:**
- "Scan AAPL, NVDA, TSLA for unusual options flow today"
- "Show me the options chain for SPY expiring this Friday"
- "What does this options flow mean: 10,000 TSLA $300 calls for $3M?"

---

## fundamentals-analyst
**Purpose:** Full-stack fundamental research — earnings history, income statement, DCF valuation, balance sheet, peer comparison, bull/bear cases.  
**Required skills:** `alpha-vantage-skill`, `yfinance-skill`  
**Required keys:** `ALPHA_VANTAGE_API_KEY`  
**Example prompts:**
- "Analyse Apple — is it overvalued at the current price?"
- "Build a DCF for Microsoft: 12% FCF growth, 9% WACC"
- "Show NVDA's earnings history for the last 8 quarters"

---

## portfolio-tracker
**Purpose:** Unified portfolio view across Alpaca stock accounts and OANDA forex accounts — aggregate P&L, sector allocation, concentration alerts, margin monitoring.  
**Required skills:** `alpaca-skill`, `oanda-skill`  
**Required keys:** `ALPACA_API_KEY`, `ALPACA_API_SECRET`, `OANDA_API_TOKEN`, `OANDA_ACCOUNT_ID`  
**Example prompts:**
- "Show me my complete portfolio across all accounts"
- "Am I too concentrated in any single stock?"
- "What is my total portfolio value and today's P&L?"

---

## filing-reader
**Purpose:** SEC EDGAR filing research — retrieve and summarise 10-K, 10-Q, and 8-K filings, parse XBRL financial data, run full-text search, detect accounting red flags.  
**Required skills:** `sec-edgar-skill`, `alpha-vantage-skill`  
**Required keys:** `SEC_USER_AGENT`, `ALPHA_VANTAGE_API_KEY`  
**Example prompts:**
- "Summarise the Risk Factors from Apple's latest 10-K"
- "Find all 8-K filings from NVDA in the last 60 days"
- "Search all 10-Ks filed in 2024 mentioning 'cybersecurity incident'"
