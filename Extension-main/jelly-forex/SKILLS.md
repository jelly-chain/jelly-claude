# Jelly-Forex — Skills Reference (6 skills)

Skills are installed at `~/.claude/skills/<skill-name>/SKILL.md`.  
After `setup.sh` runs, all 6 are available automatically.

---

## alpaca-skill
**Platform:** Alpaca Markets  
**Purpose:** Commission-free stock and ETF trading — paper trading and live. Place market, limit, stop, and bracket orders. Real-time and historical market data via REST and WebSocket.  
**Required keys:** `ALPACA_API_KEY`, `ALPACA_API_SECRET`  
**Always start in paper mode:** Set `paper: true` until strategy is verified.

---

## oanda-skill
**Platform:** OANDA  
**Purpose:** Forex and CFD trading — practice and live accounts. 70+ currency pairs plus commodities and indices. Built-in pip calculator, position sizing, candle history, and streaming prices.  
**Required keys:** `OANDA_API_TOKEN`, `OANDA_ACCOUNT_ID`  
**Always start in practice mode:** `OANDA_PRACTICE=true` until verified.

---

## polygon-skill
**Platform:** Polygon.io  
**Purpose:** Options chains with greeks, unusual options flow detection (vol/OI screening), IV surface analysis, historical OHLCV aggregates (stock/ETF/forex), and market news.  
**Required keys:** `POLYGON_API_KEY`  
**Use when:** Scanning for unusual options activity, analysing options chains, or fetching tick-level price history.

---

## alpha-vantage-skill
**Platform:** Alpha Vantage  
**Purpose:** Company fundamentals (P/E, market cap, beta), quarterly earnings with beat/miss history, income statement and balance sheet, DCF valuation helper, and technical indicators (RSI, MACD, SMA).  
**Required keys:** `ALPHA_VANTAGE_API_KEY`  
**Use when:** Building fundamental research on a company or running technical indicator analysis.

---

## yfinance-skill
**Platform:** Yahoo Finance (via Python yfinance library)  
**Purpose:** Free historical OHLCV data, dividend history, earnings calendar, institutional holders, options chains, and batch fundamental screeners. No API key needed.  
**Required keys:** None  
**Use when:** Researching stocks in Python, running batch screeners, or getting historical data without a paid API subscription.

---

## sec-edgar-skill
**Platform:** SEC EDGAR (US Securities and Exchange Commission)  
**Purpose:** Public company filing retrieval — 10-K annual reports, 10-Q quarterly reports, 8-K material events, proxy statements. XBRL structured financial data for historical revenue/EPS. Full-text search across all filings.  
**Required keys:** `SEC_USER_AGENT` (your name + email, required by SEC)  
**Use when:** Researching what a company's filings say, building a financial model from primary source data, or searching for companies mentioning specific topics.
