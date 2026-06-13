# OANDA Skill — Forex & CFD Trading

## Overview
OANDA is one of the most accessible forex brokers with a full REST API and streaming. It supports 70+ currency pairs, commodities (gold, oil), and indices. OANDA provides a practice (paper) account with $100,000 virtual funds — always start there.

## What you need
1. **OANDA account** — sign up at [oanda.com](https://www.oanda.com) (practice or live)
2. **API token** — from OANDA → My Account → Manage API Access
3. **Account ID** — from OANDA → My Account (format: `101-004-XXXXXXX-001`)
4. Store at `~/.jelly-forex/.keys` as `OANDA_API_TOKEN` and `OANDA_ACCOUNT_ID`

## API base URLs
| Environment | URL |
|-------------|-----|
| Practice (paper) | `https://api-fxpractice.oanda.com/v3` |
| Live | `https://api-fxtrade.oanda.com/v3` |
| Practice stream | `https://stream-fxpractice.oanda.com/v3` |
| Live stream | `https://stream-fxtrade.oanda.com/v3` |

**Always use practice until you're confident. Live accounts use real money.**

## Authentication
```typescript
import axios from 'axios';

const oandaClient = axios.create({
  baseURL: process.env.OANDA_PRACTICE === 'true'
    ? 'https://api-fxpractice.oanda.com/v3'
    : 'https://api-fxtrade.oanda.com/v3',
  headers: {
    Authorization: `Bearer ${process.env.OANDA_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

const accountId = process.env.OANDA_ACCOUNT_ID!;
```

## Account summary

```typescript
const { data } = await oandaClient.get(`/accounts/${accountId}/summary`);
const account = data.account;
console.log('Balance:',     account.balance);
console.log('NAV:',         account.NAV);
console.log('Unrealized P&L:', account.unrealizedPL);
console.log('Open trades:', account.openTradeCount);
console.log('Margin used:', account.marginUsed);
console.log('Leverage:',    account.marginRate ? (1 / parseFloat(account.marginRate)).toFixed(0) + 'x' : 'N/A');
```

## Get current prices

```typescript
// Get live bid/ask for multiple instruments
const instruments = 'EUR_USD,GBP_USD,USD_JPY,XAU_USD';
const { data } = await oandaClient.get(`/accounts/${accountId}/pricing`, {
  params: { instruments },
});

data.prices.forEach((p: any) => {
  const bid = parseFloat(p.bids[0].price);
  const ask = parseFloat(p.asks[0].price);
  const spread = ((ask - bid) * 10000).toFixed(1);  // in pips for most pairs
  console.log(`${p.instrument}: bid=${bid} ask=${ask} spread=${spread} pips`);
});
```

## Pip calculator

```typescript
function pipValue(
  instrument: string,
  units: number,
  accountCurrency = 'USD'
): number {
  // Standard pip sizes:
  // Most pairs (e.g. EUR_USD): 0.0001 = 1 pip
  // JPY pairs (e.g. USD_JPY): 0.01 = 1 pip
  // XAU_USD (gold): 0.01 = 1 pip
  const pipSize = instrument.includes('JPY') ? 0.01 : 0.0001;
  // For simplicity: pip value = pipSize × units (for USD-denominated pairs)
  return pipSize * Math.abs(units);
}

// Calculate position size from pip risk
function positionSize(
  accountBalance: number,
  riskPercent: number,  // e.g. 0.01 for 1%
  stopLossPips: number,
  instrument: string
): number {
  const riskAmount = accountBalance * riskPercent;
  const pipSize = instrument.includes('JPY') ? 0.01 : 0.0001;
  // Each standard lot (100,000 units) = ~$10 per pip for USD pairs
  // Each micro lot (1,000 units) = ~$0.10 per pip
  const pipValuePerUnit = pipSize;  // approximate for USD-quote pairs
  return Math.floor(riskAmount / (stopLossPips * pipValuePerUnit));
}

const units = positionSize(10_000, 0.01, 20, 'EUR_USD');
console.log(`Units for 1% risk, 20-pip stop: ${units}`);
```

## Place a market order

```typescript
interface OandaOrder {
  instrument: string;
  units: string;     // positive = buy, negative = sell
  stopLossOnFill?: { price: string; timeInForce: 'GTC' | 'GFD' };
  takeProfitOnFill?: { price: string; timeInForce: 'GTC' | 'GFD' };
  trailingStopLossOnFill?: { distance: string };
}

async function marketOrder(
  instrument: string,
  units: number,   // e.g. 1000 to buy 1000 EUR_USD
  stopLoss?: number,
  takeProfit?: number
): Promise<string> {
  const order: { order: OandaOrder & { type: string } } = {
    order: {
      type: 'MARKET',
      instrument,
      units: units.toString(),
    },
  };

  if (stopLoss) {
    order.order.stopLossOnFill = {
      price: stopLoss.toFixed(5),
      timeInForce: 'GTC',
    };
  }
  if (takeProfit) {
    order.order.takeProfitOnFill = {
      price: takeProfit.toFixed(5),
      timeInForce: 'GTC',
    };
  }

  const { data } = await oandaClient.post(`/accounts/${accountId}/orders`, order);
  const tradeId = data.orderFillTransaction?.tradeOpened?.tradeID;
  console.log('Trade ID:', tradeId, 'Fill price:', data.orderFillTransaction?.price);
  return tradeId;
}

// Buy 1,000 EUR/USD at market with 20-pip stop
const entryPrice = 1.0850;
await marketOrder('EUR_USD', 1000, entryPrice - 0.0020, entryPrice + 0.0040);
```

## Place a limit order

```typescript
const { data } = await oandaClient.post(`/accounts/${accountId}/orders`, {
  order: {
    type:       'LIMIT',
    instrument: 'GBP_USD',
    units:      '2000',
    price:      '1.26500',         // fill when price reaches here
    timeInForce: 'GTC',
    stopLossOnFill:   { price: '1.25500', timeInForce: 'GTC' },
    takeProfitOnFill: { price: '1.28000', timeInForce: 'GTC' },
  },
});
console.log('Order ID:', data.relatedTransactionIDs[0]);
```

## Manage open trades

```typescript
// List all open trades
const { data: tradesData } = await oandaClient.get(`/accounts/${accountId}/openTrades`);
tradesData.trades.forEach((t: any) => {
  console.log(
    t.id, t.instrument, 'units:', t.currentUnits,
    'P&L:', t.unrealizedPL, 'open price:', t.price
  );
});

// Close a specific trade
const tradeId = '12345';
const { data: closeData } = await oandaClient.put(
  `/accounts/${accountId}/trades/${tradeId}/close`
);
console.log('Closed at:', closeData.orderFillTransaction?.price, 'P&L:', closeData.orderFillTransaction?.pl);

// Modify stop-loss on open trade
await oandaClient.put(`/accounts/${accountId}/trades/${tradeId}/orders`, {
  stopLoss: { price: '1.0800', timeInForce: 'GTC' },
});
```

## Historical candles (OHLCV)

```typescript
interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

async function getCandles(
  instrument: string,
  granularity: 'M1'|'M5'|'M15'|'H1'|'H4'|'D'|'W',
  count = 500
): Promise<Candle[]> {
  const { data } = await oandaClient.get(`/instruments/${instrument}/candles`, {
    params: { granularity, count, price: 'M' },  // M = midpoint
  });

  return data.candles
    .filter((c: any) => c.complete)
    .map((c: any) => ({
      time:   c.time,
      open:   parseFloat(c.mid.o),
      high:   parseFloat(c.mid.h),
      low:    parseFloat(c.mid.l),
      close:  parseFloat(c.mid.c),
      volume: c.volume,
    }));
}

const candles = await getCandles('EUR_USD', 'H1', 200);
console.log('Last 200 hourly candles loaded. Latest close:', candles.at(-1)?.close);
```

## Real-time price streaming

```typescript
import https from 'https';

function streamPrices(instruments: string[], onPrice: (price: any) => void): void {
  const baseUrl = 'stream-fxpractice.oanda.com';
  const path = `/v3/accounts/${accountId}/pricing/stream?instruments=${instruments.join(',')}`;

  const req = https.get({
    hostname: baseUrl,
    path,
    headers: { Authorization: `Bearer ${process.env.OANDA_API_TOKEN}` },
  }, res => {
    res.on('data', (chunk: Buffer) => {
      const lines = chunk.toString().split('\n').filter(Boolean);
      lines.forEach(line => {
        try {
          const msg = JSON.parse(line);
          if (msg.type === 'PRICE') onPrice(msg);
        } catch {}
      });
    });
  });

  req.on('error', err => console.error('Stream error:', err));
}

streamPrices(['EUR_USD', 'GBP_USD'], price => {
  const bid = price.bids[0].price;
  const ask = price.asks[0].price;
  console.log(`${price.instrument}: ${bid}/${ask}`);
});
```

## Simple moving average crossover signal

```typescript
async function smaCrossoverSignal(instrument: string): Promise<'BUY'|'SELL'|'HOLD'> {
  const candles = await getCandles(instrument, 'H1', 50);
  const closes  = candles.map(c => c.close);

  const sma20 = closes.slice(-20).reduce((s, v) => s + v, 0) / 20;
  const sma50 = closes.slice(-50).reduce((s, v) => s + v, 0) / 50;
  const prev20 = closes.slice(-21, -1).reduce((s, v) => s + v, 0) / 20;
  const prev50 = closes.slice(-51, -1).reduce((s, v) => s + v, 0) / 50;

  if (prev20 <= prev50 && sma20 > sma50) return 'BUY';   // golden cross
  if (prev20 >= prev50 && sma20 < sma50) return 'SELL';  // death cross
  return 'HOLD';
}

const signal = await smaCrossoverSignal('EUR_USD');
console.log('Signal:', signal);
```

## Rate limits & pricing
- **Practice API:** Free, unlimited
- **Live API:** Free with live account, rate limited to ~100 req/s
- **Spread:** 0.8–1.5 pips on EUR/USD (varies by account type and time of day)
- **No commission** on standard accounts — profit on spread

## Error handling

```typescript
try {
  await oandaClient.post(`/accounts/${accountId}/orders`, orderData);
} catch (err: any) {
  if (err.response?.status === 401) throw new Error('Invalid OANDA_API_TOKEN');
  if (err.response?.status === 404) throw new Error('OANDA_ACCOUNT_ID not found');
  if (err.response?.status === 400) {
    const msg = err.response.data?.orderRejectTransaction?.rejectReason;
    throw new Error(`Order rejected: ${msg}`);
  }
  if (err.response?.data?.rejectReason === 'MARGIN_CLOSEOUT_APPROACH_WARNING') {
    throw new Error('Warning: Insufficient margin for this trade size');
  }
  throw err;
}
```

## Best practices
- Always start with the practice account — your practice keys work identically to live
- Use stop-loss on every trade without exception — attach it directly to the order with `stopLossOnFill`
- Never risk more than 1–2% of account per trade
- Use `units` not lot sizes — OANDA uses units (e.g. 10,000 = 1 mini lot for EUR_USD)
- Check spread before entry — avoid trading during high-spread periods (news events, Sunday open)
- Monitor `marginUsed` / `NAV` ratio — below 100% margin utilization is safe; >80% risks margin call
- For EUR/USD, 1 pip = 0.0001. For USD/JPY, 1 pip = 0.01
