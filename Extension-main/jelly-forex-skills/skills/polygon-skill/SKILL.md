# Polygon.io Skill — Options Chains, Market Data & Unusual Flow

## Overview
Polygon.io provides institutional-grade market data APIs: real-time and historical stock/options/forex data, options chains, unusual options flow detection, and tick-level data. The free tier covers most research use cases; paid plans add real-time streaming.

## What you need
1. **Polygon.io API key** — sign up at [polygon.io](https://polygon.io) → Dashboard → API Keys
2. Store key at `~/.jelly-forex/.keys` as `POLYGON_API_KEY`

## API base URL
```
https://api.polygon.io
```

## Authentication
```typescript
const POLYGON_BASE = 'https://api.polygon.io';
const headers = { Authorization: `Bearer ${process.env.POLYGON_API_KEY}` };

async function polygonGet(path: string, params: Record<string, any> = {}): Promise<any> {
  const url = new URL(POLYGON_BASE + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString(), { headers });
  if (!res.ok) throw new Error(`Polygon error ${res.status}: ${await res.text()}`);
  return res.json();
}
```

## Tickers & stock snapshot

```typescript
// Get a snapshot of a single stock (current price, day stats)
const snapshot = await polygonGet(`/v2/snapshot/locale/us/markets/stocks/tickers/AAPL`);
const ticker = snapshot.ticker;
console.log('Price:', ticker.day.c, 'Change%:', ((ticker.day.c - ticker.prevDay.c) / ticker.prevDay.c * 100).toFixed(2) + '%');
console.log('Volume:', ticker.day.v, 'VWAP:', ticker.day.vw);

// Get snapshots for multiple tickers
const bulk = await polygonGet('/v2/snapshot/locale/us/markets/stocks/tickers', {
  tickers: 'AAPL,MSFT,NVDA,TSLA,AMZN',
});
bulk.tickers.forEach((t: any) => {
  console.log(t.ticker, t.day.c, `+${((t.day.c - t.prevDay.c) / t.prevDay.c * 100).toFixed(1)}%`);
});
```

## Options chain

```typescript
interface OptionsContract {
  ticker: string;
  expiration_date: string;
  strike_price: number;
  contract_type: 'call' | 'put';
  implied_volatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  open_interest: number;
  volume: number;
  last_price: number;
}

async function getOptionsChain(
  underlying: string,
  expirationDate?: string,  // 'YYYY-MM-DD'
  strikeRange?: { min: number; max: number }
): Promise<OptionsContract[]> {
  const params: Record<string, any> = {
    underlying_asset: underlying,
    limit: 250,
    order: 'asc',
    sort: 'strike_price',
  };
  if (expirationDate) params['expiration_date'] = expirationDate;
  if (strikeRange) {
    params['strike_price.gte'] = strikeRange.min;
    params['strike_price.lte'] = strikeRange.max;
  }

  const data = await polygonGet('/v3/snapshot/options/' + underlying, params);
  return data.results.map((r: any) => ({
    ticker:            r.details.ticker,
    expiration_date:   r.details.expiration_date,
    strike_price:      r.details.strike_price,
    contract_type:     r.details.contract_type,
    implied_volatility: r.greeks ? r.implied_volatility : null,
    delta:             r.greeks?.delta,
    gamma:             r.greeks?.gamma,
    theta:             r.greeks?.theta,
    vega:              r.greeks?.vega,
    open_interest:     r.open_interest,
    volume:            r.day.volume,
    last_price:        r.day.close,
  }));
}

// Get AAPL options chain for nearest expiry
const chain = await getOptionsChain('AAPL');
const calls = chain.filter(c => c.contract_type === 'call');
const puts  = chain.filter(c => c.contract_type === 'put');
console.log('Calls:', calls.length, 'Puts:', puts.length);
```

## Unusual options flow detection

```typescript
interface UnusualOptions {
  ticker: string;
  expiry: string;
  strike: number;
  type: 'call' | 'put';
  volume: number;
  openInterest: number;
  volToOI: number;
  premium: number;
  impliedVolatility: number;
  daysToExpiry: number;
}

async function findUnusualOptionsFlow(
  symbols: string[],
  minVolToOI = 3,   // volume > 3× open interest = unusual
  minPremium = 50000  // minimum $50K in premium moved
): Promise<UnusualOptions[]> {
  const unusual: UnusualOptions[] = [];
  const today = new Date();

  for (const symbol of symbols) {
    const chain = await getOptionsChain(symbol);
    const filtered = chain.filter(opt => {
      if (!opt.open_interest || opt.open_interest === 0) return false;
      const ratio = opt.volume / opt.open_interest;
      const expiry = new Date(opt.expiration_date);
      const dte = Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
      const premium = (opt.last_price || 0) * opt.volume * 100;
      return ratio >= minVolToOI && premium >= minPremium && dte <= 60;
    });

    filtered.forEach(opt => {
      const dte = Math.ceil((new Date(opt.expiration_date).getTime() - today.getTime()) / 86400000);
      unusual.push({
        ticker:           symbol,
        expiry:           opt.expiration_date,
        strike:           opt.strike_price,
        type:             opt.contract_type,
        volume:           opt.volume,
        openInterest:     opt.open_interest,
        volToOI:          parseFloat((opt.volume / opt.open_interest).toFixed(1)),
        premium:          (opt.last_price || 0) * opt.volume * 100,
        impliedVolatility: opt.implied_volatility,
        daysToExpiry:     dte,
      });
    });
  }

  return unusual.sort((a, b) => b.premium - a.premium);
}

// Scan top tech stocks for unusual flow
const unusual = await findUnusualOptionsFlow(['AAPL', 'NVDA', 'TSLA', 'MSFT', 'META', 'AMZN'], 5, 100_000);
unusual.forEach(u => {
  console.log(`${u.ticker} ${u.type.toUpperCase()} $${u.strike} exp:${u.expiry} vol:${u.volume} OI:${u.openInterest} (${u.volToOI}x) $${(u.premium/1000).toFixed(0)}K`);
});
```

## Historical OHLCV bars

```typescript
async function getAggregates(
  ticker: string,
  multiplier: number,
  timespan: 'minute'|'hour'|'day'|'week'|'month',
  from: string,  // 'YYYY-MM-DD'
  to: string,
  limit = 5000
): Promise<{ t: number; o: number; h: number; l: number; c: number; v: number }[]> {
  const data = await polygonGet(
    `/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}`,
    { adjusted: 'true', sort: 'asc', limit }
  );
  return data.results ?? [];
}

// 1-year daily bars for SPY
const bars = await getAggregates('SPY', 1, 'day', '2024-01-01', '2024-12-31');
console.log('Bars count:', bars.length);
bars.slice(-3).forEach(b => {
  const date = new Date(b.t).toISOString().slice(0, 10);
  console.log(date, 'O:', b.o, 'H:', b.h, 'L:', b.l, 'C:', b.c, 'V:', b.v);
});
```

## Options IV surface (implied volatility by strike/expiry)

```typescript
async function ivSurface(symbol: string): Promise<Map<string, { strike: number; callIV: number; putIV: number }[]>> {
  const chain = await getOptionsChain(symbol);
  const surface = new Map<string, { strike: number; callIV: number; putIV: number }[]>();

  chain.forEach(opt => {
    if (!surface.has(opt.expiration_date)) surface.set(opt.expiration_date, []);
    const existing = surface.get(opt.expiration_date)!.find(e => e.strike === opt.strike_price);
    if (existing) {
      if (opt.contract_type === 'call') existing.callIV = opt.implied_volatility ?? 0;
      else existing.putIV = opt.implied_volatility ?? 0;
    } else {
      surface.get(opt.expiration_date)!.push({
        strike: opt.strike_price,
        callIV: opt.contract_type === 'call' ? opt.implied_volatility ?? 0 : 0,
        putIV:  opt.contract_type === 'put'  ? opt.implied_volatility ?? 0 : 0,
      });
    }
  });

  return surface;
}
```

## News & market events

```typescript
// Get latest news for a ticker
const news = await polygonGet('/v2/reference/news', {
  ticker: 'AAPL',
  limit:  10,
  order:  'desc',
  sort:   'published_utc',
});
news.results.forEach((n: any) => {
  console.log(n.published_utc.slice(0, 16), n.title);
  console.log('  Sentiment:', n.insights?.[0]?.sentiment);
});
```

## Rate limits & pricing
- **Free tier:** 5 API calls/minute, delayed data (15 min)
- **Starter ($29/month):** Unlimited calls, real-time US stocks/options
- **Developer ($79/month):** WebSocket streams, options flow
- **Advanced ($199/month):** Full tick data, Level 2 order book

## Error handling

```typescript
try {
  const data = await polygonGet('/v2/snapshot/locale/us/markets/stocks/tickers/AAPL');
} catch (err: any) {
  if (err.message.includes('403')) throw new Error('Invalid POLYGON_API_KEY or insufficient plan for this endpoint');
  if (err.message.includes('429')) throw new Error('Polygon rate limit — upgrade plan or slow down');
  if (err.message.includes('404')) throw new Error('Ticker not found or not covered by Polygon');
  throw err;
}
```

## Best practices
- Start with the free tier — it covers most research and backtesting needs
- Use snapshots for current data; aggregates for historical OHLCV
- For unusual flow, filter by: vol/OI > 3×, DTE < 60, premium > $50K
- Cache chain data locally — fetching full chains on every request is slow
- Options with high volume relative to OI (especially on weeklies near earnings) often signal institutional positioning
- Always cross-check unusual flow with the underlying's technical setup before acting
