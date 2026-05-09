# Jelly x402 BNB SDK

HTTP 402 autonomous payments on **BNB Chain (Binance Smart Chain)**.

> Jelly is formless, unstoppable. Jelly sees all chains.

**Chain:** BNB Chain (BSC) — EVM-compatible  
**Chain ID:** 56 (mainnet) · 97 (testnet)  
**Native token:** BNB · BEP-20 tokens: USDT, USDC, BUSD  
**Explorer:** https://bscscan.com  
**GitHub:** https://github.com/jelly-chain/sdk  
**Docs:** https://jellychain.fun/docs

---

## Repository Structure

```
bnb/
├── README.md
├── ts/                        # TypeScript/JavaScript SDK
│   ├── index.ts               # Main exports
│   ├── client.ts              # BNBX402Client class
│   ├── types.ts               # BNB-specific type definitions
│   ├── errors.ts              # Error classes
│   ├── middleware.ts          # Express middleware
│   ├── wallet.ts              # BNBWallet utilities
│   └── package.json           # @jelly-chain/bnb-sdk
└── python/                    # Python SDK
    ├── README.md
    └── x402_bnb/
        ├── __init__.py        # Package exports
        ├── client.py          # BNBX402Client + AsyncBNBX402Client
        ├── types.py           # BNB type definitions (dataclasses)
        ├── errors.py          # Error classes
        ├── middleware.py      # Flask + FastAPI middleware
        └── wallet.py          # BNBWallet utilities
```

---

## BNB vs Solana — Key Differences

| Feature | Solana SDK | BNB SDK |
|---------|-----------|---------|
| Address format | Base58 (32–44 chars) | `0x` hex (42 chars) |
| Private key | 64-byte array | 32-byte hex |
| Native token | SOL | BNB |
| Tokens | USDC (SPL) | USDT, USDC, BUSD (BEP-20) |
| TX identifier | `signature` | `txHash` |
| Payment header | `X-402-Payment-Signature` | `X-402-Payment-TxHash` |
| Chain ID header | — | `X-402-Chain-Id: 56` |
| Signing library | `@solana/web3.js` | `ethers` v6 / `web3.py` |
| Gas | Compute units | Gas (gwei, paid in BNB) |

---

## TypeScript Setup

### Install

```bash
npm install @jelly-chain/bnb-sdk
# Peer dependency for signing
npm install ethers
```

### Quick Start (Client — paying agent)

```typescript
import { BNBX402Client, BNBWallet } from '@jelly-chain/bnb-sdk';

const wallet = BNBWallet.fromPrivateKey(process.env.BNB_PRIVATE_KEY!, {
  network: 'mainnet',
});

const client = new BNBX402Client({
  apiKey: process.env.JELLY_API_KEY!,
  network: 'mainnet',
  maxPaymentPerRequest: 0.005,  // BNB — conservative limit
  gasSpeed: 'standard',
});

client.setWallet(wallet);

// Make a payment-gated request — 402 is handled automatically
const response = await client.request('https://api.example.com/premium-data');
console.log(response.data);

if (response.paymentMade) {
  const { amount, currency, txHash } = response.paymentMade;
  console.log(`Paid ${amount} ${currency}`);
  console.log(`Tx: https://bscscan.com/tx/${txHash}`);
}
```

### Check Balances

```typescript
const balances = await client.getBalance(wallet.address);
console.log(`BNB: ${balances.balances.BNB}`);
console.log(`USDT: ${balances.balances.USDT}`);
```

### Async Request

```typescript
import { AsyncBNBX402Client, BNBWallet } from '@jelly-chain/bnb-sdk';

const client = new AsyncBNBX402Client({
  apiKey: process.env.JELLY_API_KEY!,
  maxPaymentPerRequest: 0.005,
});
client.setWallet(wallet);

const response = await client.request('https://api.example.com/data');
console.log(response.data);
```

### Server Middleware (Express)

```typescript
import express from 'express';
import { createBNBMiddleware } from '@jelly-chain/bnb-sdk';

const app = express();
const bnb = createBNBMiddleware({
  apiKey: process.env.JELLY_API_KEY!,
  recipient: '0xYourWalletAddress',
  chainId: 56,
});

// Require 0.001 BNB payment
app.get('/api/premium', bnb.requirePayment(0.001), (req, res) => {
  res.json({ data: 'Premium content!' });
});

// Require 1 USDT payment
app.get('/api/analytics', bnb.requirePayment(1, { currency: 'USDT' }), (req, res) => {
  res.json({ analytics: { /* ... */ } });
});
```

### Error Handling

```typescript
import {
  BNBX402Client,
  BNBWallet,
  InsufficientBalanceError,
  InsufficientGasError,
  MaxPaymentExceededError,
  PaymentExpiredError,
  TransactionFailedError,
  WrongChainError,
  X402Error,
} from '@jelly-chain/bnb-sdk';

try {
  const response = await client.request('https://api.example.com/data');
} catch (e) {
  if (e instanceof InsufficientBalanceError) {
    console.error(`Need ${e.required} ${e.currency}, have ${e.available}`);
  } else if (e instanceof InsufficientGasError) {
    console.error(`Top up BNB for gas: need ~${e.requiredBNB} BNB`);
  } else if (e instanceof MaxPaymentExceededError) {
    console.error(`Payment ${e.requested} BNB > max ${e.maximum} BNB`);
  } else if (e instanceof WrongChainError) {
    console.error(`Wrong chain: expected ${e.expectedChainId}, got ${e.actualChainId}`);
  } else if (e instanceof X402Error) {
    console.error(`x402 error [${e.code}]: ${e.message}`);
  }
}
```

---

## Python Setup

### Install

```bash
pip install jelly-x402-bnb
# Optional: real signing (required in production)
pip install jelly-x402-bnb[web3]
# Optional: async support
pip install jelly-x402-bnb[async]
# Optional: Flask middleware
pip install jelly-x402-bnb[flask]
# Everything
pip install jelly-x402-bnb[full]
```

### Quick Start (Client — paying agent)

```python
import os
from x402_bnb import BNBX402Client, BNBWallet

wallet = BNBWallet.from_private_key(os.environ['BNB_PRIVATE_KEY'])
client = BNBX402Client(
    api_key=os.environ['JELLY_API_KEY'],
    network='mainnet',
    max_payment_per_request=0.005,
    gas_speed='standard',
)
client.set_wallet(wallet)

response = client.request('https://api.example.com/premium-data')
print(response.data)

if response.payment_made:
    print(f"Paid {response.payment_made['amount']} {response.payment_made['currency']}")
    print(f"Tx: https://bscscan.com/tx/{response.payment_made['tx_hash']}")
```

### Async Client

```python
import asyncio
import os
from x402_bnb import AsyncBNBX402Client, BNBWallet

async def main():
    wallet = BNBWallet.from_private_key(os.environ['BNB_PRIVATE_KEY'])
    client = AsyncBNBX402Client(
        api_key=os.environ['JELLY_API_KEY'],
        max_payment_per_request=0.005,
    )
    client.set_wallet(wallet)

    response = await client.request('https://api.example.com/premium-data')
    print(response.data)

asyncio.run(main())
```

### Check Balances

```python
balance = client.get_balance(wallet.address)
print(f"BNB: {balance.balances['BNB']}")
print(f"USDT: {balance.balances['USDT']}")
print(f"USDC: {balance.balances['USDC']}")
```

### Flask Middleware

```python
import os
from flask import Flask, jsonify, g
from x402_bnb.middleware import create_bnb_middleware, get_payment_info

app = Flask(__name__)
bnb = create_bnb_middleware(
    api_key=os.environ['JELLY_API_KEY'],
    recipient='0xYourWalletAddress',
    chain_id=56,
)

@app.route('/api/premium')
@bnb.require_payment(0.001)                 # 0.001 BNB
def premium():
    payment = get_payment_info(g)
    return jsonify({
        'data': 'Premium content!',
        'paid_via': payment['tx_hash'],
    })

@app.route('/api/analytics')
@bnb.require_payment(1.0, currency='USDT')  # 1 USDT
def analytics():
    return jsonify({'analytics': {}})
```

### FastAPI Middleware

```python
import os
from fastapi import FastAPI, Depends
from x402_bnb.middleware import create_bnb_middleware

app = FastAPI()
bnb = create_bnb_middleware(
    api_key=os.environ['JELLY_API_KEY'],
    recipient='0xYourWalletAddress',
)

@app.get('/api/premium')
async def premium(payment=Depends(bnb.fastapi_payment_dependency(0.001))):
    return {'data': 'Premium content!', 'paid_via': payment['tx_hash']}
```

### Error Handling

```python
from x402_bnb import (
    BNBX402Client, BNBWallet,
    InsufficientBalanceError, InsufficientGasError,
    MaxPaymentExceededError, PaymentExpiredError,
    WrongChainError, TransactionFailedError, X402Error,
)

try:
    response = client.request('https://api.example.com/data')
except InsufficientBalanceError as e:
    print(f"Need {e.required} {e.currency}, have {e.available}")
except InsufficientGasError as e:
    print(f"Top up BNB for gas: need ~{e.required_bnb} BNB")
except MaxPaymentExceededError as e:
    print(f"Payment {e.requested} BNB > max {e.maximum} BNB")
except WrongChainError as e:
    print(f"Wrong chain: expected {e.expected_chain_id}")
except PaymentExpiredError as e:
    print(f"Expired at {e.expired_at} — retry")
except X402Error as e:
    print(f"x402 error [{e.code}]: {e.message}")
```

---

## Agent Setup (Skills)

For autonomous agents, place the following SKILL.md in `.local/skills/jelly-x402-bnb/SKILL.md`:

````markdown
---
name: jelly-x402-bnb
description: BNB Chain x402 payment client for autonomous agents. Use to make payment-enabled HTTP requests settled on BNB Chain via HTTP 402.
---

# Jelly x402 BNB Skill

## When to Use
- Making HTTP requests to endpoints returning 402 Payment Required on BNB Chain
- Paying for data/compute in BNB, USDT, USDC, or BUSD
- Cross-chain agent workflows where Solana is not supported

## Environment Variables
- `JELLY_API_KEY` — Jelly x402 API key
- `BNB_PRIVATE_KEY` — 32-byte hex private key (no 0x prefix needed)
- `BNB_RECIPIENT` — Default recipient 0x address

## Quick Usage (TypeScript agent)
```javascript
const { BNBX402Client, BNBWallet } = await import('@jelly-chain/bnb-sdk');

const wallet = BNBWallet.fromPrivateKey(process.env.BNB_PRIVATE_KEY);
const client = new BNBX402Client({
  apiKey: process.env.JELLY_API_KEY,
  network: 'mainnet',
  maxPaymentPerRequest: 0.005,
});
client.setWallet(wallet);

const response = await client.request('https://api.example.com/data');
console.log(response.data);
```

## Quick Usage (Python agent)
```python
from x402_bnb import BNBX402Client, BNBWallet
import os

wallet = BNBWallet.from_private_key(os.environ['BNB_PRIVATE_KEY'])
client = BNBX402Client(api_key=os.environ['JELLY_API_KEY'], max_payment_per_request=0.005)
client.set_wallet(wallet)

response = client.request('https://api.example.com/data')
print(response.data)
```

## Agent Safety
1. Keep `maxPaymentPerRequest` / `max_payment_per_request` low (0.001–0.01 BNB)
2. Always keep a small BNB reserve for gas (~0.01 BNB buffer)
3. Log all txHash values for audit trail
4. Never hardcode private keys — always read from environment
````

---

## API Reference

### BNBX402Client Methods

| Method | Description |
|--------|-------------|
| `request(url, options)` | HTTP request with automatic 402 handling |
| `verify(request)` | Verify a payment by txHash |
| `createPaymentRequest(req)` | Create a 402 payment requirement |
| `getBalance(address)` | BNB + token balances |
| `getTransaction(txHash)` | Transaction details |
| `getTransactionHistory(req)` | Paginated transaction history |
| `getGasEstimate()` | Current BSC gas prices |
| `parsePaymentRequirement(resp)` | Parse X-402-* headers |

### HTTP Headers (BNB-specific)

| Header | Direction | Description |
|--------|-----------|-------------|
| `X-402-Amount` | Response | Payment amount |
| `X-402-Currency` | Response | `BNB` \| `USDT` \| `USDC` \| `BUSD` |
| `X-402-Recipient` | Response | Recipient `0x` address |
| `X-402-Reference` | Both | Unique payment reference |
| `X-402-Expires` | Response | Unix timestamp expiry |
| `X-402-Chain-Id` | Both | `56` (mainnet) or `97` (testnet) |
| `X-402-Payment-TxHash` | Request | Completed transaction hash |
| `X-402-Payment-Reference` | Request | Payment reference |

### Error Classes

| Class | Code | Description |
|-------|------|-------------|
| `X402Error` | `*` | Base error |
| `InsufficientBalanceError` | `INSUFFICIENT_BALANCE` | Not enough token |
| `InsufficientGasError` | `INSUFFICIENT_GAS` | Not enough BNB for gas |
| `MaxPaymentExceededError` | `MAX_PAYMENT_EXCEEDED` | Amount > max |
| `PaymentExpiredError` | `PAYMENT_EXPIRED` | Window expired |
| `PaymentRejectedError` | `PAYMENT_REJECTED` | Server rejected |
| `TransactionFailedError` | `TRANSACTION_FAILED` | On-chain failure |
| `WrongChainError` | `WRONG_CHAIN` | Wrong chainId |
| `InvalidAddressError` | `INVALID_ADDRESS` | Bad 0x address |
| `RateLimitError` | `RATE_LIMITED` | API rate limit |
| `NetworkError` | `NETWORK_ERROR` | Connection failure |

---

## Network Details

| Network | Chain ID | RPC | Explorer |
|---------|----------|-----|----------|
| Mainnet | 56 | `https://bsc-dataseed.binance.org/` | `https://bscscan.com` |
| Testnet | 97 | `https://data-seed-prebsc-1-s1.binance.org:8545/` | `https://testnet.bscscan.com` |

## Support

- Website: https://jellychain.fun
- Docs: https://jellychain.fun/docs
- GitHub: https://github.com/jelly-chain/sdk
- Twitter: https://x.com/jellyqnw

## License

MIT
