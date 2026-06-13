# predict-fun-skill — BNB Chain Prediction Market Trading

## Overview
predict.fun is a Central Limit Order Book (CLOB) prediction market running natively on **BNB Chain**, settled in **USDT**. It is the primary BNB-native binary prediction market — similar in mechanics to Polymarket (Polygon/USDC) but running on BSC with USDT collateral. Markets resolve via the **UMA Optimistic Oracle**. Open to global users; no KYC required in EOA mode.

### Key facts at a glance
| Item | Value |
|------|-------|
| Chain | BNB Mainnet (Chain ID 56) / BNB Testnet (Chain ID 97) |
| Collateral | USDT (6 decimals on BNB) |
| Market type | Binary YES/NO, CLOB |
| Price range | 0.01 – 0.99 (= implied probability) |
| Resolution oracle | UMA Optimistic Oracle |
| REST API (mainnet) | `https://api.predict.fun/` |
| REST API (testnet) | `https://api-testnet.predict.fun/` |
| WebSocket | `wss://ws.predict.fun/ws` |
| TypeScript SDK | `@predictdotfun/sdk` (npm) |
| Rate limit | 240 req/min (mainnet + testnet) |
| API key | Required on mainnet; not required on testnet |
| LLMs.txt | `https://dev.predict.fun/llms.txt` |

**Always test on BNB Testnet first before trading real funds.**

---

## 1. Prerequisites Checklist

Before trading on predict.fun, ensure you have:

- [ ] **EVM wallet private key** — the same key that works for BNB Chain (EOA mode). This wallet will be the order `maker`. Keep it in `EVM_PRIVATE_KEY`.
- [ ] **BNB for gas** — ~0.01 BNB covers all approvals and typical on-chain operations. Send BNB to your wallet address.
- [ ] **USDT on BNB Chain** — collateral for trades. Bridge from a CEX (Binance → BNB Chain → USDT) or swap on PancakeSwap.
- [ ] **predict.fun API key** — required on mainnet. Request via Discord: https://discord.gg/predictdotfun → open a support ticket. Store in `PREDICT_API_KEY`.
- [ ] **Node.js 18+** and npm/yarn for the TypeScript SDK.
- [ ] *(Optional — Smart Wallet mode)* **Privy wallet private key** (`PRIVY_WALLET_PRIVATE_KEY`) + **Predict Account address** (`PREDICT_ACCOUNT_ADDRESS`) — export both from https://predict.fun/account/settings if you want to use your in-app Smart Wallet instead of a raw EOA.

---

## 2. SDK Installation

predict.fun's TypeScript SDK requires **ethers v6** as a peer dependency:

```bash
npm install @predictdotfun/sdk ethers
# or:
yarn add @predictdotfun/sdk ethers
```

Core exports from the SDK:
- `OrderBuilder` — builds, signs, and submits orders
- `ChainId` — `ChainId.BnbMainnet` (56) / `ChainId.BnbTestnet` (97)
- `Side` — `Side.BUY` (0) / `Side.SELL` (1)

---

## 3. Authentication

predict.fun uses two credentials for authenticated endpoints:

| Credential | Header | When needed |
|-----------|--------|-------------|
| API Key | `x-api-key: YOUR_API_KEY` | All endpoints on mainnet |
| JWT Token | `Authorization: Bearer JWT` | Personal actions: orders, positions, account |

### 3a. EOA Mode — standard wallet

```typescript
import { Wallet } from "ethers";
import { OrderBuilder, ChainId } from "@predictdotfun/sdk";

const signer = new Wallet(process.env.EVM_PRIVATE_KEY!);
// Create OrderBuilder — do this ONCE per session
const builder = await OrderBuilder.make(ChainId.BnbMainnet, signer);
```

**Get a JWT token (EOA):**

```typescript
const BASE = "https://api.predict.fun";

// Step 1: GET /v1/auth/message — get message to sign
const msgRes = await fetch(`${BASE}/v1/auth/message`, {
  headers: { "x-api-key": process.env.PREDICT_API_KEY! },
});
const { data: { message } } = await msgRes.json();

// Step 2: Sign the message with your EOA
const signature = await signer.signMessage(message);

// Step 3: POST /v1/auth — exchange signature for JWT
const authRes = await fetch(`${BASE}/v1/auth`, {
  method: "POST",
  headers: {
    "x-api-key": process.env.PREDICT_API_KEY!,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ signer: signer.address, message, signature }),
});
const { data: { token: JWT } } = await authRes.json();

// Helper: headers to use on all authenticated requests
const headers = {
  "x-api-key": process.env.PREDICT_API_KEY!,
  "Authorization": `Bearer ${JWT}`,
  "Content-Type": "application/json",
};
```

### 3b. Predict Account Mode — Smart Wallet (Privy)

Use this if your funds are in your in-app predict.fun Smart Wallet (the default when you use the web app). Export both values from https://predict.fun/account/settings.

```typescript
import { Wallet } from "ethers";
import { OrderBuilder, ChainId } from "@predictdotfun/sdk";

// Privy Wallet = the key that signs — fund this with a small amount of BNB for gas
const privyWallet = new Wallet(process.env.PRIVY_WALLET_PRIVATE_KEY!);

// Predict Account = your deposit address (where USDT lives)
const builder = await OrderBuilder.make(ChainId.BnbMainnet, privyWallet, {
  predictAccount: process.env.PREDICT_ACCOUNT_ADDRESS!,
});

// Get message and sign it using the SDK helper (standard signMessage won't work here)
const msgRes = await fetch("https://api.predict.fun/v1/auth/message", {
  headers: { "x-api-key": process.env.PREDICT_API_KEY! },
});
const { data: { message } } = await msgRes.json();
const signature = await builder.signPredictAccountMessage(message);

const authRes = await fetch("https://api.predict.fun/v1/auth", {
  method: "POST",
  headers: {
    "x-api-key": process.env.PREDICT_API_KEY!,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    signer: process.env.PREDICT_ACCOUNT_ADDRESS!,
    message,
    signature,
  }),
});
const { data: { token: JWT } } = await authRes.json();
```

> **Note for Predict Account orders:** Set `signer` and `maker` in orders to `PREDICT_ACCOUNT_ADDRESS`, not the Privy wallet address. The SDK handles this automatically when `predictAccount` is set.

---

## 4. One-Time Approvals (required before first trade)

Before your first order you must approve two contract allowances: ERC-20 (USDT) and ERC-1155 (ConditionalTokens) for both exchange contracts. The SDK handles all four approval transactions in one call:

```typescript
import { OrderBuilder, ChainId } from "@predictdotfun/sdk";
import { Wallet } from "ethers";

const signer = new Wallet(process.env.EVM_PRIVATE_KEY!);
const builder = await OrderBuilder.make(ChainId.BnbMainnet, signer);

const result = await builder.setApprovals();
if (!result.success) {
  throw new Error("Approval transactions failed — check BNB balance for gas");
}
console.log("Approvals set. This only needs to be done once per wallet.");
```

This approves both `CTFExchange` and `NegRiskCtfExchange` for both USDT and ConditionalTokens. Only run once per wallet address.

---

## 5. Browse Markets

```typescript
const BASE = "https://api.predict.fun";
const apiKey = process.env.PREDICT_API_KEY!;

// List open markets (paginated)
const marketsRes = await fetch(
  `${BASE}/v1/markets?status=open&limit=20&sort=volume&order=desc`,
  { headers: { "x-api-key": apiKey } }
);
const { data: { markets } } = await marketsRes.json();

markets.forEach(m => {
  console.log(`[${m.id}] ${m.question}`);
  console.log(`  Fee: ${m.feeRateBps} bps | Status: ${m.status}`);
  console.log(`  YES tokenId: ${m.outcomes[0].onChainId}`);  // use for orders
  console.log(`  NO  tokenId: ${m.outcomes[1].onChainId}`);
});

// Get a specific market by ID
const mktRes = await fetch(`${BASE}/v1/markets/${marketId}`, {
  headers: { "x-api-key": apiKey },
});
const { data: market } = await mktRes.json();
const feeRateBps = market.feeRateBps; // e.g. 200 = 2% fee

// Get market statistics
const statsRes = await fetch(`${BASE}/v1/markets/${marketId}/stats`, {
  headers: { "x-api-key": apiKey },
});

// Search markets by keyword
const searchRes = await fetch(
  `${BASE}/v1/search?query=bitcoin+price+2025`,
  { headers: { "x-api-key": apiKey } }
);
const { data: { markets: results } } = await searchRes.json();

// Browse by category
const catsRes = await fetch(`${BASE}/v1/categories?status=open`, {
  headers: { "x-api-key": apiKey },
});
```

**Key market fields:**
- `m.outcomes[0].onChainId` — YES outcome token ID (use as `tokenId` in orders)
- `m.outcomes[1].onChainId` — NO outcome token ID
- `m.feeRateBps` — maker fee in basis points (fetch fresh before each order)
- `m.status` — `"open"` | `"closed"` | `"resolved"`
- `m.tradingStatus` — `"active"` | `"suspended"`

---

## 6. Read the Orderbook

The orderbook stores prices for the **YES** outcome. To get NO prices, use the complement formula.

```typescript
// GET /v1/markets/:id/orderbook
const obRes = await fetch(`${BASE}/v1/markets/${marketId}/orderbook`, {
  headers: { "x-api-key": apiKey },
});
const { data: { asks, bids, updateTimestampMs } } = await obRes.json();
// asks = [[price, qty], ...] sorted by price ASC (best ask = asks[0])
// bids = [[price, qty], ...] sorted by price DESC (best bid = bids[0])

// Complement formula — derive NO prices from YES orderbook
// decimalPrecision is typically 2 (confirmed by market data)
const getComplement = (price: number, decimals = 2): number => {
  const f = 10 ** decimals;
  return (f - Math.round(price * f)) / f;
};

const yesBestAsk = asks[0][0];           // cheapest YES to buy
const yesBestBid = bids[0][0];           // highest YES bid
const noBestBid  = getComplement(yesBestAsk);  // = cheapest NO to buy
const noBestAsk  = getComplement(yesBestBid);  // = best NO bid

console.log(`YES: bid ${yesBestBid} / ask ${yesBestAsk}  (mid ${((yesBestBid + yesBestAsk) / 2).toFixed(3)})`);
console.log(`NO:  bid ${noBestBid} / ask ${noBestAsk}`);

// Full NO-side depth (swap sides, complement each price)
const noAsks = bids.map(([p, q]) => [getComplement(p), q]);
const noBids = asks.map(([p, q]) => [getComplement(p), q]);

// Pricing intuition:
// price 0.72 → market implies 72% chance YES wins
// Buying YES at 0.72: risk 72¢, gain 28¢ if YES wins
// Buying NO at 0.28: risk 28¢, gain 72¢ if NO wins
```

---

## 7. Create a LIMIT Order (recommended)

LIMIT orders sit in the orderbook until matched or cancelled. Use for best fill price.

```typescript
import { Wallet, parseUnits } from "ethers";
import { OrderBuilder, ChainId, Side } from "@predictdotfun/sdk";

const signer  = new Wallet(process.env.EVM_PRIVATE_KEY!);
const builder = await OrderBuilder.make(ChainId.BnbMainnet, signer);

// Fetch feeRateBps fresh before each order
const mktRes  = await fetch(`${BASE}/v1/markets/${marketId}`, { headers });
const { data: market } = await mktRes.json();
const feeRateBps = market.feeRateBps;
const yesTokenId = market.outcomes[0].onChainId; // buy YES
// const noTokenId = market.outcomes[1].onChainId; // or buy NO

// Define your trade
const price       = 0.65;            // 65¢ = 65% probability
const usdtSpend   = 10;              // $10 USDT
const USDT_DEC    = 6;               // USDT has 6 decimals on BNB Chain

// Calculate makerAmount (USDT you spend) and takerAmount (shares you receive)
const { makerAmount, takerAmount } = builder.getLimitOrderAmounts({
  side:       Side.BUY,
  price,
  tokenId:    yesTokenId,
  usdtAmount: parseUnits(usdtSpend.toString(), USDT_DEC),
});

// Build the order struct
const order = builder.buildOrder("LIMIT", {
  side:       Side.BUY,
  tokenId:    yesTokenId,
  makerAmount,
  takerAmount,
  nonce:      0n,
  feeRateBps,
});

// Sign the order (EIP-712 typed data)
const typedData   = builder.buildTypedData(order);
const signedOrder = await builder.signTypedDataOrder(typedData);
const orderHash   = builder.buildTypedDataHash(typedData);

// Submit to the API
const submitRes = await fetch(`${BASE}/v1/orders`, {
  method: "POST",
  headers,
  body: JSON.stringify({ order: signedOrder, orderHash }),
});
const result = await submitRes.json();
console.log("Status:", result.data.status);  // "OPEN" | "MATCHED" | "ERROR"
console.log("Hash:",   orderHash);
```

**Sell an existing YES position (close your position):**
```typescript
// Side.SELL = sell YES tokens back into the orderbook
const { makerAmount, takerAmount } = builder.getLimitOrderAmounts({
  side:    Side.SELL,
  price:   0.80,           // sell at 80¢ (higher than your 65¢ entry)
  tokenId: yesTokenId,
  usdtAmount: parseUnits("10", 6),
});
const order = builder.buildOrder("LIMIT", {
  side: Side.SELL, tokenId: yesTokenId, makerAmount, takerAmount, nonce: 0n, feeRateBps,
});
```

---

## 8. Create a MARKET Order (immediate fill)

MARKET orders fill immediately against the best available resting orders. Higher slippage risk on thin books.

```typescript
// First fetch the orderbook so we can calculate slippage
const obRes = await fetch(`${BASE}/v1/markets/${marketId}/orderbook`, { headers });
const { data: orderbook } = await obRes.json();

// Calculate amounts with slippage protection
const { makerAmount, takerAmount } = builder.getMarketOrderAmounts({
  side:       Side.BUY,
  tokenId:    yesTokenId,
  usdtAmount: parseUnits("10", 6),  // $10 USDT
  orderbook,                         // required for slippage calc
  slippage:   0.02,                  // 2% max slippage tolerance
});

const order       = builder.buildOrder("MARKET", {
  side: Side.BUY, tokenId: yesTokenId, makerAmount, takerAmount, nonce: 0n, feeRateBps,
});
const typedData   = builder.buildTypedData(order);
const signedOrder = await builder.signTypedDataOrder(typedData);
const orderHash   = builder.buildTypedDataHash(typedData);

await fetch(`${BASE}/v1/orders`, {
  method: "POST",
  headers,
  body: JSON.stringify({ order: signedOrder, orderHash }),
});
```

---

## 9. Cancel Orders

```typescript
// List your open orders first
const ordersRes = await fetch(`${BASE}/v1/orders?status=open`, { headers });
const { data: { orders } } = await ordersRes.json();
orders.forEach(o => console.log(o.hash, o.price, o.side, o.status));

// Cancel specific orders by hash
const cancelRes = await fetch(`${BASE}/v1/orders/remove`, {
  method: "POST",
  headers,
  body: JSON.stringify({ orderHashes: [orderHash1, orderHash2] }),
});
const { data } = await cancelRes.json();
console.log("Cancelled:", data.cancelledHashes);

// Get a single order status
const orderRes = await fetch(`${BASE}/v1/orders/${orderHash}`, { headers });

// Get order match events (fill history)
const matchRes = await fetch(`${BASE}/v1/orders/matches?limit=20`, { headers });
```

---

## 10. Manage Positions

```typescript
// Your current positions (all markets)
const posRes = await fetch(`${BASE}/v1/positions`, { headers });
const { data: { positions } } = await posRes.json();

positions.forEach(p => {
  console.log(`Market ${p.marketId} | Side: ${p.side} | Size: ${p.size} shares`);
  console.log(`  Avg entry: ${p.avgPrice} | Current P&L: ${((currentPrice - p.avgPrice) * p.size).toFixed(2)} USDT`);
});

// Positions for any public wallet address
const pubPosRes = await fetch(`${BASE}/v1/positions/${walletAddress}`, {
  headers: { "x-api-key": apiKey },
});

// Redeem winning positions after market resolves
const redeemResult = await builder.redeemPositions({ marketId });
console.log("Redeemed:", redeemResult);

// Merge positions (advanced — split full-set back to USDT)
const mergeResult = await builder.mergePositions({ marketId, amount: parseUnits("10", 6) });
```

---

## 11. Account Info & Activity

```typescript
// Your connected account
const acctRes = await fetch(`${BASE}/v1/account`, { headers });
const { data: account } = await acctRes.json();
console.log("Address:", account.address, "USDT balance:", account.balance);

// Trade history (paginated)
const actRes = await fetch(`${BASE}/v1/account/activity?limit=50`, { headers });
const { data: { events } } = await actRes.json();
events.forEach(e => console.log(e.eventName, e.marketId, e.amount, e.timestamp));
```

---

## 12. WebSocket — Live Data

```typescript
import WebSocket from "ws";

// Connect — API key as query param
const ws = new WebSocket(
  `wss://ws.predict.fun/ws?apiKey=${process.env.PREDICT_API_KEY}`
);

ws.on("open", () => {
  // Subscribe to live orderbook updates for a market (public — no auth)
  ws.send(JSON.stringify({
    method: "subscribe",
    topic:  `predictOrderbook/${marketId}`,
    requestId: 1,
  }));

  // Subscribe to price feed updates (public)
  ws.send(JSON.stringify({
    method: "subscribe",
    topic:  `assetPriceUpdate/${priceFeedId}`,
    requestId: 2,
  }));

  // Subscribe to your wallet events (requires JWT — pass it in topic)
  ws.send(JSON.stringify({
    method: "subscribe",
    topic:  `predictWalletEvents/${JWT}`,
    requestId: 3,
  }));
});

ws.on("message", (raw) => {
  const msg = JSON.parse(raw.toString());

  // REQUIRED: respond to server heartbeats every 15s or connection drops
  if (msg.type === "M" && msg.topic === "heartbeat") {
    ws.send(JSON.stringify({ method: "heartbeat", timestamp: msg.timestamp }));
    return;
  }

  // Subscription acknowledgement
  if (msg.type === "R") {
    console.log("Subscribed to:", msg.topic, "success:", msg.success);
    return;
  }

  // Orderbook update
  if (msg.topic?.startsWith("predictOrderbook/")) {
    const { asks, bids } = msg.data;
    console.log("Book update — best ask:", asks[0], "best bid:", bids[0]);
  }

  // Wallet events
  if (msg.topic?.startsWith("predictWalletEvents/")) {
    // eventType: orderAccepted | orderNotAccepted | orderExpired | orderCancelled
    //            orderTransactionSubmitted | orderTransactionSuccess | orderTransactionFailed
    console.log("Wallet event:", msg.data.eventType, msg.data.orderHash);
  }
});

ws.on("error", (err) => console.error("WS error:", err));
ws.on("close", (code, reason) => {
  console.log("WS closed:", code, reason.toString());
  // Implement exponential backoff reconnect here
});
```

---

## 13. Deployed Contract Addresses — BNB Mainnet

### Shared Contracts
| Contract | Address |
|----------|---------|
| UmaCompatibleOptimisticOracle | `0x76F42e5520E62AD88f8fE583cBb4BfF27eeC2531` |
| Vault | `0x09F683d8a144c4ac296D770F839098c3377410c5` |
| ZeroDevWithdrawalHelper | `0xf4aa30b537882eca7e69defb68d6f631cda77b00` |
| RewardDistributor | `0x14e3cB02F48818a8FeF6BC257059767cA9d436Ae` |

### Yield Bearing Prediction Market (default)
| Contract | Address |
|----------|---------|
| YieldBearingConditionalTokens | `0x9400F8Ad57e9e0F352345935d6D3175975eb1d9F` |
| UmaCompatibleCtfAdapter | `0x947cc06D38d3cB0a2BB5AdFB668b99B4FF53d7B4` |
| **CTFExchange** | **`0x6bEb5a40C032AFc305961162d8204CDA16DECFa5`** |
| NegRisk ConditionalTokens | `0xF64b0b318AAf83BD9071110af24D24445719A07F` |
| YieldBearingNegRiskAdapter | `0x41dCe1A4B8FB5e6327701750aF6231B7CD0B2A40` |
| YieldBearingWrappedCollateral | `0xCfb9beF5F7B748aC72311F057f3a888BC73334D9` |
| **NegRiskCtfExchange** | **`0x8A289d458f5a134bA40015085A8F50Ffb681B41d`** |
| NegRiskOperator | `0xBB7250101e0e3611D7e136fFE73Bc24b98E3e175` |
| NegRisk UmaCompatibleCtfAdapter | `0x26B366Ab634C43BdA6D784fDCe34F24A37DF8172` |
| FeeModuleV2 | `0xFbC2259aBB3F01c019ECE1d0200Ee673BB7BA34F` |
| NegRiskFeeModuleV2 | `0xD172f3FBabe763Ee8E52D8b32421574236dA6057` |
| ConditionalTokensFeesHandler | `0xb4D9F13738a50E88E0ade2ecCc89254EF1645f6E` |
| RegisterTokenHelper | `0xa48C26abd9024a5CC5a869bBd97A6a3D6B9C2089` |

### Non-Yield Bearing Prediction Market
| Contract | Address |
|----------|---------|
| ConditionalTokens | `0x22DA1810B194ca018378464a58f6Ac2B10C9d244` |
| UmaCompatibleCtfAdapter | `0x242E1Ba24f6fC524bfb410062Ca5689A9622613d` |
| CTFExchange | `0x8BC070BEdAB741406F4B1Eb65A72bee27894B689` |
| NegRiskAdapter | `0xc3Cf7c252f65E0d8D88537dF96569AE94a7F1A6E` |
| WrappedCollateral | `0x66239b70133773A72A0D589E5564E88a50Cd39e7` |
| NegRiskCtfExchange | `0x365fb81bd4A24D6303cd2F19c349dE6894D8d58A` |
| NegRiskOperator | `0x56020F5024641d577Cb54032aF70a23a986ECfFD` |
| NegRisk UmaCompatibleCtfAdapter | `0xf61198a64C2e4CAD8CCAf218f3f2ECeFb017902F` |
| FeeModuleV2 | `0xF1f8F5C641F20C48526269EF7DFF19172Efa9783` |

**USDT on BNB Chain:** `0x55d398326f99059fF775485246999027B3197955`

---

## 14. Testnet Reference

Use testnet to practice before touching real money.

```typescript
// No API key required on testnet
const TESTNET_BASE = "https://api-testnet.predict.fun";

// Use ChainId.BnbTestnet in OrderBuilder
const builder = await OrderBuilder.make(ChainId.BnbTestnet, signer);

// All REST endpoints work the same — just change the base URL
const markets = await fetch(`${TESTNET_BASE}/v1/markets?status=open`, {
  // No x-api-key header needed on testnet
}).then(r => r.json());
```

Get testnet BNB from: https://testnet.bnbchain.org/faucet-smart

---

## 15. Complete API Reference

| Method | Path | Needs JWT | Description |
|--------|------|-----------|-------------|
| GET | `/v1/auth/message` | No | Get message to sign for JWT |
| POST | `/v1/auth` | No | Exchange signature for JWT |
| GET | `/v1/markets` | No | List markets (filter: status, sort, limit) |
| GET | `/v1/markets/:id` | No | Market detail + outcome token IDs + feeRateBps |
| GET | `/v1/markets/:id/stats` | No | Volume, open interest, last price |
| GET | `/v1/markets/:id/last-sale` | No | Last trade price and size |
| GET | `/v1/markets/:id/orderbook` | No | Live bids/asks for YES side |
| GET | `/v1/markets/:id/timeseries` | No | Historical price series |
| GET | `/v1/markets/:id/timeseries/latest` | No | Current price only |
| POST | `/v1/orders` | Yes | Create LIMIT or MARKET order |
| GET | `/v1/orders` | Yes | List your orders (filter by status) |
| GET | `/v1/orders/:hash` | Yes | Single order by hash |
| GET | `/v1/orders/matches` | Yes | Fill history (filter: market, minValue) |
| POST | `/v1/orders/remove` | Yes | Cancel orders by hash array |
| GET | `/v1/account` | Yes | Your account info and USDT balance |
| GET | `/v1/account/activity` | Yes | Trade activity log (paginated) |
| POST | `/v1/account/referral` | Yes | Set referral code |
| GET | `/v1/positions` | Yes | Your open positions |
| GET | `/v1/positions/:address` | No | Any wallet's positions (public) |
| GET | `/v1/categories` | No | List market categories |
| GET | `/v1/categories/:slug` | No | Category detail + its markets |
| GET | `/v1/tags` | No | All tags with at least one market |
| GET | `/v1/search` | No | Full-text search across markets + categories |

All mainnet requests require `x-api-key` header. JWT required only for personal actions.

---

## 16. Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Invalid API key` | Wrong or missing `x-api-key` | Check env var; testnet doesn't need one |
| `401 Unauthorized` | JWT expired or missing | Re-authenticate via GET /v1/auth/message → POST /v1/auth |
| `Insufficient allowance` | ERC-20/ERC-1155 approval not set | Run `builder.setApprovals()` again |
| `Self trade prevention` | You have a resting order on the other side | Cancel opposing orders first |
| `Order too small` | Below market minimum size | Check `market.minOrderSize` and increase |
| `429 Too Many Requests` | >240 req/min | Add exponential backoff; batch reads with WebSocket |
| `Invalid signature` | Wrong signing method for Predict Account | Use `builder.signPredictAccountMessage()` not `signer.signMessage()` |
| `Nonce already used` | Reused order nonce | Increment nonce for each order |
| `Market not active` | Market is closed or suspended | Check `market.tradingStatus === "active"` before ordering |

---

## 17. Risk Rules — Always Follow

- **5% rule:** Never risk more than 5% of your USDT balance on a single market position.
- **Use LIMIT orders** on thin books — MARKET orders can suffer severe slippage on low-volume markets.
- **Check liquidity:** Read the orderbook depth before sizing your order. If total ask depth < your intended size, split the order.
- **Verify resolution criteria:** Read `market.resolutionSource` and `market.resolutionCriteria` before entering. Know exactly what triggers YES vs NO.
- **Test on testnet first:** Any new strategy must run on BNB Testnet before mainnet deployment.
- **Never expose private keys:** Never log `EVM_PRIVATE_KEY` or `PRIVY_WALLET_PRIVATE_KEY`. Always load from environment variables.
- **Monitor open orders:** Stale LIMIT orders in volatile markets can fill at unfavourable prices. Cancel if the market moves away.
- **Redeem after resolution:** Resolved markets stop paying automatically — call `redeemPositions()` to claim your winnings.
