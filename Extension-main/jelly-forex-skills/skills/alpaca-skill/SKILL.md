# Alpaca Skill — Stock & ETF Trading (Paper + Live)

## Overview
Alpaca is a commission-free stock and ETF brokerage with a full REST API and WebSocket streaming. It supports paper trading (simulated), live trading (US equities/ETFs), fractional shares, and market data. All without payment for order flow.

## What you need
1. **Alpaca account** — sign up at [alpaca.markets](https://alpaca.markets)
2. **API key + secret** — from the Alpaca dashboard → Paper Trading or Live Trading
3. Store keys at `~/.jelly-forex/.keys` as `ALPACA_API_KEY` and `ALPACA_API_SECRET`

## API base URLs
| Environment | Base URL |
|-------------|----------|
| Paper trading | `https://paper-api.alpaca.markets` |
| Live trading | `https://api.alpaca.markets` |
| Market data | `https://data.alpaca.markets` |

**Always start with paper trading. Never switch to live without explicit intent.**

## Install SDK
```bash
npm install @alpacahq/alpaca-trade-api
# or use the REST API directly with axios/fetch
```

## Authentication
```typescript
import Alpaca from '@alpacahq/alpaca-trade-api';

const alpaca = new Alpaca({
  keyId:  process.env.ALPACA_API_KEY!,
  secretKey: process.env.ALPACA_API_SECRET!,
  paper: true,   // ALWAYS true unless explicitly going live
  feed: 'iex',   // 'iex' (free) or 'sip' (paid, full market data)
});
```

## Account information

```typescript
// Get account status and balances
const account = await alpaca.getAccount();
console.log('Portfolio value:', account.portfolio_value);
console.log('Buying power:',    account.buying_power);
console.log('Cash:',            account.cash);
console.log('Day trade count:', account.daytrade_count);
console.log('Pattern day trader:', account.pattern_day_trader);
```

## Market / Limit orders

```typescript
// Market buy order
const buyOrder = await alpaca.createOrder({
  symbol:    'AAPL',
  qty:       10,
  side:      'buy',
  type:      'market',
  time_in_force: 'day',
});
console.log('Order ID:', buyOrder.id, 'Status:', buyOrder.status);

// Limit buy order
const limitOrder = await alpaca.createOrder({
  symbol:    'TSLA',
  qty:       5,
  side:      'buy',
  type:      'limit',
  limit_price: 240.00,
  time_in_force: 'gtc',   // good-till-cancelled
});

// Stop-loss order
const stopOrder = await alpaca.createOrder({
  symbol:    'TSLA',
  qty:       5,
  side:      'sell',
  type:      'stop',
  stop_price: 220.00,
  time_in_force: 'gtc',
});

// Bracket order (entry + take-profit + stop-loss)
const bracketOrder = await alpaca.createOrder({
  symbol:   'NVDA',
  qty:      2,
  side:     'buy',
  type:     'limit',
  limit_price: 850.00,
  time_in_force: 'gtc',
  order_class: 'bracket',
  take_profit: { limit_price: 950.00 },
  stop_loss:   { stop_price: 800.00 },
});
```

## Fractional shares (dollar-based orders)

```typescript
// Buy $100 worth of AMZN (fractional)
const dollarOrder = await alpaca.createOrder({
  symbol:    'AMZN',
  notional:  100,    // USD amount (omit qty when using notional)
  side:      'buy',
  type:      'market',
  time_in_force: 'day',
});
```

## Position management

```typescript
// Get all open positions
const positions = await alpaca.getPositions();
positions.forEach(p => {
  console.log(p.symbol, 'qty:', p.qty, 'P&L:', p.unrealized_pl, 'Value:', p.market_value);
});

// Get a specific position
const applePos = await alpaca.getPosition('AAPL');
console.log('AAPL avg cost:', applePos.avg_entry_price);

// Close a specific position
await alpaca.closePosition('AAPL');

// Close all positions at once (liquidate)
await alpaca.closeAllPositions({ cancel_orders: true });
```

## Order management

```typescript
// List open orders
const openOrders = await alpaca.getOrders({ status: 'open', limit: 50 });

// Cancel an order
await alpaca.cancelOrder(orderId);

// Cancel all open orders
await alpaca.cancelAllOrders();

// Check order status
const order = await alpaca.getOrder(orderId);
console.log(order.status, order.filled_qty, order.filled_avg_price);
```

## Market data — latest quotes and bars

```typescript
// Latest quote (bid/ask spread)
const quotes = await alpaca.getLatestQuotes(['AAPL', 'MSFT', 'TSLA'], { feed: 'iex' });
for (const [symbol, quote] of Object.entries(quotes)) {
  console.log(symbol, 'Bid:', quote.BidPrice, 'Ask:', quote.AskPrice, 'Spread:', (quote.AskPrice - quote.BidPrice).toFixed(2));
}

// Historical bars (OHLCV)
const bars = await alpaca.getBarsV2('AAPL', {
  start:     '2024-01-01',
  end:       '2024-12-31',
  timeframe: alpaca.newTimeframe(1, alpaca.timeframeUnit.DAY),
  feed:      'iex',
  limit:     1000,
});
const allBars = [];
for await (const bar of bars) allBars.push(bar);
console.log('Bars:', allBars.length, 'First close:', allBars[0]?.ClosePrice);
```

## Real-time streaming (WebSocket)

```typescript
const ws = alpaca.data_stream_v2;

ws.onConnect(() => {
  ws.subscribeForTrades(['AAPL', 'TSLA']);
  ws.subscribeForQuotes(['NVDA']);
  ws.subscribeForBars(['SPY']);
});

ws.onStockTrade(trade => {
  console.log(`Trade: ${trade.Symbol} @ $${trade.Price} x ${trade.Size}`);
});

ws.onStockQuote(quote => {
  console.log(`Quote: ${quote.Symbol} bid=${quote.BidPrice} ask=${quote.AskPrice}`);
});

ws.onStockBar(bar => {
  console.log(`Bar: ${bar.Symbol} O=${bar.OpenPrice} H=${bar.HighPrice} L=${bar.LowPrice} C=${bar.ClosePrice}`);
});

ws.connect();
// cleanup: ws.disconnect();
```

## Check if market is open

```typescript
const clock = await alpaca.getClock();
console.log('Market open:', clock.is_open);
console.log('Next open:',  clock.next_open);
console.log('Next close:', clock.next_close);

const calendar = await alpaca.getCalendar({ start: '2025-01-01', end: '2025-12-31' });
calendar.slice(0, 5).forEach(day => {
  console.log(day.date, 'Open:', day.open, 'Close:', day.close);
});
```

## Position sizing helper

```typescript
function positionSize(
  accountValue: number,
  riskPercent: number,  // e.g. 0.01 for 1%
  entryPrice: number,
  stopPrice: number
): number {
  const riskAmount = accountValue * riskPercent;
  const riskPerShare = Math.abs(entryPrice - stopPrice);
  return Math.floor(riskAmount / riskPerShare);
}

// Risk 1% of $100,000 account on AAPL trade with $5 stop
const shares = positionSize(100_000, 0.01, 185.00, 180.00);
console.log('Shares to buy:', shares);  // 200
```

## Rate limits & pricing
- **Market data (IEX):** Free, 15-min delayed
- **Market data (SIP):** $9/month, real-time consolidated tape
- **Trading API:** Free, unlimited orders
- **WebSocket:** Free, up to 1024 subscriptions per stream

## Error handling

```typescript
try {
  await alpaca.createOrder(params);
} catch (err: any) {
  if (err.response?.status === 403) throw new Error('Alpaca account not approved or not authorized for live trading');
  if (err.response?.status === 422) throw new Error(`Invalid order: ${err.response.data?.message}`);
  if (err.response?.status === 429) throw new Error('Alpaca rate limit exceeded — slow down');
  if (err.response?.data?.message?.includes('insufficient')) throw new Error('Insufficient buying power');
  throw err;
}
```

## Best practices
- **Always start in paper mode** — set `paper: true` until you've verified logic works
- Never trade within 30 minutes of market open/close unless that's your strategy
- Use bracket orders to enforce risk limits at the API level (not just in code)
- Position size using the 1% rule — never risk more than 1% of account per trade
- Use `time_in_force: 'gtc'` for limit orders that should persist, `'day'` for intraday only
- Check `account.pattern_day_trader` — PDT rule restricts accounts under $25K to 3 day-trades per 5 days
- Always cancel open orders before closing positions to avoid over-selling
