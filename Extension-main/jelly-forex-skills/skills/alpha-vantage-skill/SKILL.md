# Alpha Vantage Skill — Fundamentals, Earnings & Technical Indicators

## Overview
Alpha Vantage provides free and premium stock fundamentals: income statements, balance sheets, cash flow, earnings (EPS actual vs estimate), P/E ratios, and 50+ technical indicators. It's the go-to source for building DCF models and screening stocks on fundamentals.

## What you need
1. **Alpha Vantage API key** — free at [alphavantage.co](https://www.alphavantage.co/support/#api-key)
2. Store key at `~/.jelly-forex/.keys` as `ALPHA_VANTAGE_API_KEY`

## API base URL
```
https://www.alphavantage.co/query
```

## Authentication
```typescript
const AV_BASE = 'https://www.alphavantage.co/query';
const AV_KEY  = process.env.ALPHA_VANTAGE_API_KEY!;

async function avGet(params: Record<string, string>): Promise<any> {
  const url = new URL(AV_BASE);
  url.searchParams.set('apikey', AV_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Alpha Vantage error ${res.status}`);
  const data = await res.json();
  if (data['Note']) throw new Error('Alpha Vantage rate limit reached — wait 1 minute');
  if (data['Information']) throw new Error('Alpha Vantage API issue: ' + data['Information']);
  return data;
}
```

## Company overview (P/E, market cap, sector)

```typescript
async function getCompanyOverview(symbol: string): Promise<{
  name: string; sector: string; industry: string;
  marketCap: number; pe: number; eps: number;
  dividendYield: number; priceToBook: number;
  beta: number; fiftyTwoWeekHigh: number; fiftyTwoWeekLow: number;
  analystTargetPrice: number; forwardPE: number;
}> {
  const data = await avGet({ function: 'OVERVIEW', symbol });
  return {
    name:               data.Name,
    sector:             data.Sector,
    industry:           data.Industry,
    marketCap:          parseInt(data.MarketCapitalization),
    pe:                 parseFloat(data.PERatio),
    eps:                parseFloat(data.EPS),
    dividendYield:      parseFloat(data.DividendYield),
    priceToBook:        parseFloat(data.PriceToBookRatio),
    beta:               parseFloat(data.Beta),
    fiftyTwoWeekHigh:   parseFloat(data['52WeekHigh']),
    fiftyTwoWeekLow:    parseFloat(data['52WeekLow']),
    analystTargetPrice: parseFloat(data.AnalystTargetPrice),
    forwardPE:          parseFloat(data.ForwardPE),
  };
}

const aapl = await getCompanyOverview('AAPL');
console.log(`${aapl.name} | ${aapl.sector}`);
console.log(`P/E: ${aapl.pe} | Forward P/E: ${aapl.forwardPE}`);
console.log(`Market Cap: $${(aapl.marketCap / 1e9).toFixed(0)}B`);
console.log(`52W: $${aapl.fiftyTwoWeekLow} – $${aapl.fiftyTwoWeekHigh}`);
```

## Earnings (EPS actual vs estimate, surprise %)

```typescript
interface EarningsRecord {
  fiscalDateEnding: string;
  reportedDate: string;
  reportedEPS: number;
  estimatedEPS: number;
  surprise: number;
  surprisePercentage: number;
}

async function getEarnings(symbol: string): Promise<EarningsRecord[]> {
  const data = await avGet({ function: 'EARNINGS', symbol });
  return (data.quarterlyEarnings ?? []).map((e: any) => ({
    fiscalDateEnding:   e.fiscalDateEnding,
    reportedDate:       e.reportedDate,
    reportedEPS:        parseFloat(e.reportedEPS),
    estimatedEPS:       parseFloat(e.estimatedEPS),
    surprise:           parseFloat(e.surprise),
    surprisePercentage: parseFloat(e.surprisePercentage),
  }));
}

const earnings = await getEarnings('NVDA');
console.log('Last 4 quarters:');
earnings.slice(0, 4).forEach(e => {
  const beat = e.surprisePercentage > 0 ? '✓ BEAT' : '✗ MISS';
  console.log(`${e.fiscalDateEnding}: reported ${e.reportedEPS} vs est ${e.estimatedEPS} (${e.surprisePercentage.toFixed(1)}%) ${beat}`);
});
```

## Income statement

```typescript
async function getIncomeStatement(symbol: string): Promise<any[]> {
  const data = await avGet({ function: 'INCOME_STATEMENT', symbol });
  return (data.quarterlyReports ?? []).map((r: any) => ({
    period:           r.fiscalDateEnding,
    revenue:          parseInt(r.totalRevenue),
    grossProfit:      parseInt(r.grossProfit),
    operatingIncome:  parseInt(r.operatingIncome),
    netIncome:        parseInt(r.netIncome),
    ebitda:           parseInt(r.ebitda),
    grossMargin:      parseFloat(r.grossProfit) / parseFloat(r.totalRevenue),
    operatingMargin:  parseFloat(r.operatingIncome) / parseFloat(r.totalRevenue),
    netMargin:        parseFloat(r.netIncome) / parseFloat(r.totalRevenue),
  }));
}

const income = await getIncomeStatement('AAPL');
income.slice(0, 4).forEach(q => {
  console.log(
    q.period,
    `Rev: $${(q.revenue/1e9).toFixed(1)}B`,
    `Net: $${(q.netIncome/1e9).toFixed(1)}B`,
    `Margin: ${(q.netMargin*100).toFixed(1)}%`
  );
});
```

## Balance sheet

```typescript
async function getBalanceSheet(symbol: string) {
  const data = await avGet({ function: 'BALANCE_SHEET', symbol });
  const latest = data.quarterlyReports[0];
  return {
    period:              latest.fiscalDateEnding,
    totalAssets:         parseInt(latest.totalAssets),
    totalLiabilities:    parseInt(latest.totalLiabilities),
    totalEquity:         parseInt(latest.totalShareholderEquity),
    cash:                parseInt(latest.cashAndCashEquivalentsAtCarryingValue),
    totalDebt:           parseInt(latest.shortLongTermDebtTotal || 0),
    currentRatio:        parseFloat(latest.totalCurrentAssets) / parseFloat(latest.totalCurrentLiabilities),
    debtToEquity:        parseFloat(latest.shortLongTermDebtTotal || 0) / parseFloat(latest.totalShareholderEquity),
  };
}

const balance = await getBalanceSheet('MSFT');
console.log(`Cash: $${(balance.cash/1e9).toFixed(0)}B`);
console.log(`Debt: $${(balance.totalDebt/1e9).toFixed(0)}B`);
console.log(`D/E ratio: ${balance.debtToEquity.toFixed(2)}`);
console.log(`Current ratio: ${balance.currentRatio.toFixed(2)}`);
```

## Simple DCF valuation model

```typescript
interface DCFInputs {
  fcf:           number;  // Free cash flow (trailing 12m)
  growthRate:    number;  // Annual FCF growth rate (e.g. 0.15 for 15%)
  terminalGrowth: number; // Terminal growth rate (e.g. 0.03)
  discountRate:  number;  // WACC (e.g. 0.10)
  years:         number;  // Projection period (typically 10)
  sharesOut:     number;  // Shares outstanding
  netCash:       number;  // Net cash (cash - debt)
}

function dcfValuation(inputs: DCFInputs): { intrinsicValue: number; presentValues: number[] } {
  const { fcf, growthRate, terminalGrowth, discountRate, years, sharesOut, netCash } = inputs;
  let presentValues: number[] = [];
  let currentFCF = fcf;

  for (let year = 1; year <= years; year++) {
    currentFCF *= (1 + growthRate);
    const pv = currentFCF / Math.pow(1 + discountRate, year);
    presentValues.push(pv);
  }

  const terminalValue = (currentFCF * (1 + terminalGrowth)) / (discountRate - terminalGrowth);
  const pvTerminal = terminalValue / Math.pow(1 + discountRate, years);

  const enterpriseValue = presentValues.reduce((s, v) => s + v, 0) + pvTerminal;
  const equity = enterpriseValue + netCash;
  const intrinsicValue = equity / sharesOut;

  return { intrinsicValue, presentValues };
}

// Example: AAPL DCF
const dcf = dcfValuation({
  fcf:           100e9,  // $100B free cash flow
  growthRate:    0.10,
  terminalGrowth: 0.03,
  discountRate:  0.09,
  years:         10,
  sharesOut:     15.5e9,
  netCash:       49e9,
});
console.log(`DCF intrinsic value: $${dcf.intrinsicValue.toFixed(2)}`);
```

## Technical indicators (RSI, MACD, SMA)

```typescript
// RSI (Relative Strength Index)
async function getRSI(symbol: string, period = 14): Promise<{ date: string; rsi: number }[]> {
  const data = await avGet({
    function: 'RSI',
    symbol,
    interval:   'daily',
    time_period: period.toString(),
    series_type: 'close',
  });
  return Object.entries(data['Technical Analysis: RSI'])
    .slice(0, 20)
    .map(([date, v]: any) => ({ date, rsi: parseFloat(v.RSI) }));
}

// MACD
async function getMACD(symbol: string): Promise<{ date: string; macd: number; signal: number; hist: number }[]> {
  const data = await avGet({
    function: 'MACD',
    symbol,
    interval:        'daily',
    series_type:     'close',
    fastperiod:      '12',
    slowperiod:      '26',
    signalperiod:    '9',
  });
  return Object.entries(data['Technical Analysis: MACD'])
    .slice(0, 20)
    .map(([date, v]: any) => ({
      date,
      macd:   parseFloat(v.MACD),
      signal: parseFloat(v.MACD_Signal),
      hist:   parseFloat(v.MACD_Hist),
    }));
}

const rsi = await getRSI('AAPL');
console.log('RSI (latest 5):');
rsi.slice(0, 5).forEach(r => console.log(r.date, r.rsi.toFixed(1)));
```

## Rate limits & pricing
- **Free:** 25 requests/day (sufficient for research)
- **Premium ($50/month):** 75 req/min, real-time data
- **Professional ($120/month):** Unlimited calls, WebSocket

## Error handling

```typescript
try {
  const data = await avGet({ function: 'OVERVIEW', symbol: 'AAPL' });
} catch (err: any) {
  if (err.message.includes('rate limit')) {
    await new Promise(r => setTimeout(r, 60_000));  // wait 1 minute
    // retry...
  }
  if (err.message.includes('Invalid API call')) throw new Error('Check symbol name and Alpha Vantage plan');
  throw err;
}
```

## Best practices
- Free tier is limited to 25 req/day — cache all results to disk
- Add a 12-second delay between requests on free tier to avoid hitting limits
- For DCF, combine with yfinance-skill for current market price comparison
- RSI > 70 = overbought, RSI < 30 = oversold — combine with other signals before acting
- Earnings surprises > 10% often cause significant price movements — track next earnings date
- For P/E comparison: always compare within the same sector, not across industries
