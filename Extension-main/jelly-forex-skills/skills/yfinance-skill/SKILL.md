# yfinance Skill — Historical OHLCV, Dividends & Company Info (Python)

## Overview
`yfinance` is a Python library that wraps Yahoo Finance's unofficial API — providing historical OHLCV data, dividends, splits, earnings calendar, institutional holders, financial ratios, and option chains for free with no API key required.

## What you need
1. **Python 3.8+** — [python.org](https://python.org)
2. No API key required — Yahoo Finance is public
3. Install the library: `pip install yfinance pandas`

## Install

```bash
pip install yfinance pandas ta-lib   # ta-lib is optional, for technical indicators
```

## Basic usage — single ticker

```python
import yfinance as yf
import pandas as pd

# Create ticker object
aapl = yf.Ticker("AAPL")

# Get info dict (P/E, market cap, company description, etc.)
info = aapl.info
print("Name:", info.get("longName"))
print("Sector:", info.get("sector"))
print("P/E:", info.get("trailingPE"))
print("Forward P/E:", info.get("forwardPE"))
print("Market Cap:", f"${info.get('marketCap', 0) / 1e9:.0f}B")
print("Beta:", info.get("beta"))
print("52W High:", info.get("fiftyTwoWeekHigh"))
print("52W Low:", info.get("fiftyTwoWeekLow"))
print("Analyst Target:", info.get("targetMeanPrice"))
print("Recommendation:", info.get("recommendationKey"))
```

## Historical OHLCV data

```python
import yfinance as yf
import pandas as pd

# Download 1 year of daily data
df = yf.download("AAPL", start="2024-01-01", end="2024-12-31")
print(df.head())
print(df.describe())

# Intraday data (max 60 days back for 1h, 7 days for 5m)
df_1h = yf.download("AAPL", period="30d", interval="1h")
df_5m = yf.download("SPY",  period="5d",  interval="5m")

# Multiple tickers at once
df_multi = yf.download(["AAPL", "MSFT", "NVDA"], start="2024-01-01", end="2024-12-31")
print(df_multi["Close"].tail())  # Closing prices for all three

# Valid intervals: 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
# Valid periods: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
```

## Calculate returns and technical indicators

```python
import yfinance as yf
import pandas as pd
import numpy as np

def analyse_stock(symbol: str, period: str = "1y") -> dict:
    df = yf.download(symbol, period=period)
    close = df["Close"]

    # Returns
    returns = close.pct_change().dropna()

    # Moving averages
    df["SMA20"]  = close.rolling(20).mean()
    df["SMA50"]  = close.rolling(50).mean()
    df["SMA200"] = close.rolling(200).mean()

    # RSI (14-period)
    delta = close.diff()
    gain  = delta.clip(lower=0).rolling(14).mean()
    loss  = (-delta.clip(upper=0)).rolling(14).mean()
    rs    = gain / loss
    df["RSI"] = 100 - (100 / (1 + rs))

    # Bollinger Bands (20, 2σ)
    df["BB_mid"]   = df["SMA20"]
    df["BB_upper"] = df["SMA20"] + 2 * close.rolling(20).std()
    df["BB_lower"] = df["SMA20"] - 2 * close.rolling(20).std()

    # ATR (Average True Range) — volatility measure
    high_low   = df["High"] - df["Low"]
    high_close = (df["High"] - close.shift()).abs()
    low_close  = (df["Low"]  - close.shift()).abs()
    df["ATR"]  = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1).rolling(14).mean()

    latest = df.iloc[-1]
    return {
        "symbol":       symbol,
        "price":        float(close.iloc[-1]),
        "sma20":        float(latest.SMA20),
        "sma50":        float(latest.SMA50),
        "sma200":       float(latest.SMA200),
        "rsi":          float(latest.RSI),
        "atr":          float(latest.ATR),
        "annual_return": float(returns.sum()),
        "volatility":   float(returns.std() * np.sqrt(252)),
        "sharpe":       float((returns.mean() * 252) / (returns.std() * np.sqrt(252))),
    }

result = analyse_stock("NVDA")
print(f"{result['symbol']}: ${result['price']:.2f}")
print(f"RSI: {result['rsi']:.1f} | ATR: ${result['atr']:.2f}")
print(f"SMA20: ${result['sma20']:.2f} | SMA200: ${result['sma200']:.2f}")
print(f"Sharpe ratio: {result['sharpe']:.2f}")
```

## Dividends and splits

```python
ticker = yf.Ticker("KO")  # Coca-Cola

# Dividend history
dividends = ticker.dividends
print("Dividend history (last 10):")
print(dividends.tail(10))

# Annual dividend yield calculation
annual_div = dividends.last("1y").sum()
current_price = ticker.info.get("currentPrice", 0)
yield_pct = (annual_div / current_price * 100) if current_price else 0
print(f"Annual dividend yield: {yield_pct:.2f}%")

# Stock splits
splits = ticker.splits
print("\nSplit history:", splits)
```

## Earnings calendar

```python
ticker = yf.Ticker("AAPL")

# Earnings dates
earnings = ticker.earnings_dates
if earnings is not None:
    print("Upcoming/recent earnings:")
    print(earnings.head(8))

# EPS estimates and actuals
earnings_data = ticker.earnings_history
print("\nEPS history:")
print(earnings_data)
```

## Institutional and insider holdings

```python
ticker = yf.Ticker("AAPL")

# Top institutional holders
inst = ticker.institutional_holders
print("Top institutional holders:")
print(inst.head(10))

# Major holders summary (% institutional, % insider)
major = ticker.major_holders
print("\nMajor holders:")
print(major)

# Recent insider transactions
insider = ticker.insider_transactions
print("\nInsider transactions:")
print(insider.head(10))
```

## Options chain

```python
ticker = yf.Ticker("SPY")

# Available expiration dates
print("Expiries:", ticker.options[:5])

# Get chain for nearest expiry
expiry = ticker.options[0]
opt = ticker.option_chain(expiry)

calls = opt.calls
puts  = opt.puts

# Find ATM call (closest to current price)
price = ticker.info.get("currentPrice") or float(yf.download("SPY", period="1d")["Close"].iloc[-1])
atm_call = calls.iloc[(calls["strike"] - price).abs().argsort().iloc[:1]]
print(f"\nATM Call ({expiry}): strike={float(atm_call['strike'])}, IV={float(atm_call['impliedVolatility']):.2%}")

# All calls sorted by volume
print("\nTop 5 calls by volume:")
print(calls.nlargest(5, "volume")[["strike", "lastPrice", "impliedVolatility", "volume", "openInterest"]])
```

## Batch fundamentals screener

```python
import yfinance as yf
import pandas as pd

def screen_stocks(symbols: list[str], 
                  max_pe: float = 25,
                  min_dividend: float = 0.02,
                  max_debt_equity: float = 1.0) -> pd.DataFrame:
    rows = []
    for symbol in symbols:
        try:
            info = yf.Ticker(symbol).info
            pe     = info.get("trailingPE") or float("inf")
            div    = info.get("dividendYield") or 0
            de     = info.get("debtToEquity") or float("inf")
            if de: de /= 100  # yfinance returns as percentage
            if pe <= max_pe and div >= min_dividend and de <= max_debt_equity:
                rows.append({
                    "symbol":    symbol,
                    "pe":        round(pe, 1),
                    "div_yield": f"{div*100:.1f}%",
                    "debt_eq":   round(de, 2),
                    "sector":    info.get("sector", "N/A"),
                })
        except Exception:
            pass
    return pd.DataFrame(rows)

# Screen Dow Jones components for value + dividend
dow = ["AAPL","AMGN","AXP","BA","CAT","CRM","CVX","DIS","DOW","GS",
       "HD","HON","IBM","INTC","JNJ","JPM","KO","MCD","MMM","MRK",
       "MSFT","NKE","PG","TRV","UNH","V","VZ","WBA","WMT","XOM"]

results = screen_stocks(dow, max_pe=20, min_dividend=0.03, max_debt_equity=1.5)
print(results.sort_values("pe"))
```

## Rate limits & caveats
- **No API key required** — data pulled from Yahoo Finance unofficial API
- **Rate limits:** ~2,000 requests/hour before soft-blocking; add `time.sleep(0.5)` between calls
- **Data quality:** Generally reliable for daily OHLCV; intraday can have gaps
- **Not for production:** Yahoo can change the API without notice — not suitable for high-frequency trading
- **Use Alpaca or Polygon for production** market data needs

## Best practices
- Cache downloads to disk: `df = yf.download(...); df.to_csv('cache/AAPL.csv')`
- For multiple symbols, use batch download: `yf.download(['AAPL', 'MSFT'], ...)` — it's faster than one-by-one
- Always check `info.get('quoteType')` — some tickers return ETF data differently than stocks
- Use `period='max'` for the full price history
- `yfinance` is best for research and backtesting — use Alpaca for live trading
