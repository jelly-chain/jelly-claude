# Jelly x402 — Solana SDK

HTTP 402 autonomous payments on **Solana**.

> Jelly is formless, unstoppable. Jelly sees all chains.

**Chain:** Solana Mainnet-Beta · Devnet  
**Native token:** SOL · SPL tokens: USDC  
**GitHub:** https://github.com/jelly-chain/sdk/tree/main/Solana  
**Docs:** https://jellychain.fun/docs  
**API base:** `https://api.jellychain.fun`

---

## Packages

| Language | Package | Install |
|----------|---------|---------|
| TypeScript / JS | `@jelly-chain/sdk` | `npm install @jelly-chain/sdk` |
| Python | `jelly-x402` | `pip install jelly-x402` |

---

## Folder Structure

```
Solana/
├── README.md          # This file
├── ts/                # TypeScript SDK (@jelly-chain/sdk)
│   ├── index.ts       # Main exports
│   ├── client.ts      # X402Client
│   ├── types.ts       # Type definitions
│   ├── errors.ts      # Error classes
│   ├── middleware.ts  # Express middleware
│   ├── wallet.ts      # Solana wallet utilities
│   └── package.json
└── python/            # Python SDK (jelly-x402)
    ├── README.md
    ├── setup.py
    ├── pyproject.toml
    └── x402_sdk/
        ├── __init__.py
        ├── client.py      # X402Client + AsyncX402Client
        ├── types.py
        ├── errors.py
        ├── middleware.py  # Flask middleware
        └── wallet.py
```

---

## TypeScript Setup

### Install

```bash
npm install @jelly-chain/sdk
# or
yarn add @jelly-chain/sdk
# or
pnpm add @jelly-chain/sdk
```

### Client (paying agent)

```typescript
import { X402Client } from '@jelly-chain/sdk';
import { Keypair } from '@solana/web3.js';

const keypair = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(process.env.SOLANA_PRIVATE_KEY!))
);

const client = new X402Client({
  keypair,
  apiKey: process.env.JELLY_API_KEY,
  baseUrl: 'https://api.jellychain.fun',
  maxPaymentPerRequest: 0.1,
});

const response = await client.request('https://api.example.com/premium-data');
console.log(response.data);

if (response.paymentMade) {
  console.log(`Paid ${response.paymentMade.amount} ${response.paymentMade.currency}`);
  console.log(`Signature: ${response.paymentMade.signature}`);
}
```

### Configuration

```typescript
import { X402Client, X402Config } from '@jelly-chain/sdk';

const config: X402Config = {
  apiKey: process.env.JELLY_API_KEY!,
  baseUrl: 'https://api.jellychain.fun',
  network: 'mainnet-beta',      // or 'devnet'
  maxPaymentPerRequest: 0.1,    // max SOL per request
  commitment: 'confirmed',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};
```

### Express Middleware (server-side gating)

```typescript
import express from 'express';
import { createX402Middleware } from '@jelly-chain/sdk';

const app = express();
const x402 = createX402Middleware({
  apiKey: process.env.JELLY_API_KEY!,
  recipient: 'YOUR_SOLANA_WALLET_ADDRESS',
});

// Require 0.001 SOL
app.get('/api/premium', x402.requirePayment(0.001), (req, res) => {
  res.json({ data: 'Premium content!' });
});

// Optional payment (free with benefits if paid)
app.get('/api/data', x402.optionalPayment(0.0005), (req, res) => {
  const payment = getPaymentInfo(req);
  res.json({ data: 'Content', premium: !!payment });
});
```

### Error Handling

```typescript
import {
  X402Client,
  InsufficientBalanceError,
  PaymentExpiredError,
  MaxPaymentExceededError,
  X402Error,
} from '@jelly-chain/sdk';

try {
  const response = await client.request('https://api.example.com/data');
} catch (e) {
  if (e instanceof InsufficientBalanceError) {
    console.error(`Need ${e.required} SOL, have ${e.available}`);
  } else if (e instanceof MaxPaymentExceededError) {
    console.error(`Payment ${e.requested} SOL > max ${e.maximum} SOL`);
  } else if (e instanceof PaymentExpiredError) {
    console.error(`Expired at ${e.expiredAt.toISOString()} — retry`);
  } else if (e instanceof X402Error) {
    console.error(`x402 error [${e.code}]: ${e.message}`);
  }
}
```

---

## Python Setup

### Install

```bash
pip install jelly-x402

# With Flask middleware
pip install jelly-x402[flask]

# With Solana signing (production)
pip install jelly-x402[solana]
```

### Client (paying agent)

```python
from jelly_x402 import X402Client, X402Config
import os

config = X402Config(
    network='mainnet-beta',
    rpc_url='https://api.mainnet-beta.solana.com',
    max_payment_per_request=0.1,
    commitment='confirmed',
)

client = X402Client(keypair=keypair, config=config)

response = client.request('https://api.example.com/premium-data')
print(response.data)

if response.payment_made:
    print(f"Paid {response.payment_made['amount']} {response.payment_made['currency']}")
    print(f"Signature: {response.payment_made['signature']}")
```

### Quick Start (API key only)

```python
from jelly_x402 import X402Client

client = X402Client(
    api_key=os.environ['JELLY_API_KEY'],
    base_url='https://api.jellychain.fun',
    max_payment_per_request=0.1,
)

response = client.request('https://api.example.com/premium-data')
print(response.data)
```

### Async Support

```python
from jelly_x402 import AsyncX402Client
import asyncio, os

async def main():
    client = AsyncX402Client(keypair=keypair)
    response = await client.request('https://api.example.com/data')
    print(response.data)

asyncio.run(main())
```

### Flask Middleware

```python
from flask import Flask, jsonify
from jelly_x402 import create_x402_middleware
import os

app = Flask(__name__)
x402 = create_x402_middleware(
    api_key=os.environ['JELLY_API_KEY'],
    recipient='YOUR_SOLANA_WALLET_ADDRESS',
)

@app.route('/api/premium')
@x402.require_payment(0.001)  # 0.001 SOL
def premium():
    return jsonify({'data': 'Premium content!'})
```

### Error Handling

```python
from jelly_x402 import (
    X402Error,
    InsufficientBalanceError,
    PaymentExpiredError,
    MaxPaymentExceededError,
)

try:
    response = client.request('https://api.example.com/data')
except InsufficientBalanceError as e:
    print(f"Need {e.required} SOL, have {e.available}")
except MaxPaymentExceededError as e:
    print(f"Payment {e.requested} SOL > max {e.maximum} SOL")
except PaymentExpiredError:
    print("Payment window expired — retry")
except X402Error as e:
    print(f"Jelly x402 error [{e.code}]: {e.message}")
```

---

## Agent Setup (Skill)

Place in `.local/skills/jelly-x402/SKILL.md` for autonomous agent integration:

````markdown
---
name: jelly-x402
description: Solana x402 payment client. Use to make payment-enabled HTTP requests settled on Solana.
---

## Environment Variables
- `JELLY_API_KEY` — API key from jellychain.fun
- `SOLANA_PRIVATE_KEY` — JSON array of secret key bytes

## TypeScript Usage
```javascript
const { X402Client } = await import('@jelly-chain/sdk');
const { Keypair } = await import('@solana/web3.js');

const keypair = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(process.env.SOLANA_PRIVATE_KEY))
);
const client = new X402Client({
  keypair,
  apiKey: process.env.JELLY_API_KEY,
  baseUrl: 'https://api.jellychain.fun',
  maxPaymentPerRequest: 0.05,
});

const response = await client.request('https://api.example.com/data');
console.log(response.data);
```

## Python Usage
```python
from jelly_x402 import X402Client
import os

client = X402Client(
    api_key=os.environ['JELLY_API_KEY'],
    max_payment_per_request=0.05,
)
response = client.request('https://api.example.com/data')
print(response.data)
```

## Agent Safety
1. Keep `maxPaymentPerRequest` conservative (0.01–0.1 SOL)
2. Log all payment signatures for audit trail
3. Never hardcode private keys — always use environment variables
````

---

## API Reference

### Client Methods

| Method | Description |
|--------|-------------|
| `request(url, options)` | HTTP request with automatic 402 handling |
| `verify(request)` | Verify a payment transaction |
| `createPaymentRequest(req)` | Create a payment requirement |
| `getBalance(address)` | SOL + USDC balance |
| `getTransaction(signature)` | Transaction details |
| `getTransactionHistory(req)` | Paginated history |
| `getAgentStats()` | Agent payment stats |

### HTTP Headers (Solana)

| Header | Direction | Description |
|--------|-----------|-------------|
| `X-402-Amount` | Response | Payment amount in SOL |
| `X-402-Currency` | Response | `SOL` or `USDC` |
| `X-402-Recipient` | Response | Recipient wallet address |
| `X-402-Reference` | Both | Unique payment reference |
| `X-402-Expires` | Response | Unix timestamp expiry |
| `X-402-Payment-Signature` | Request | Completed transaction signature |
| `X-402-Payment-Reference` | Request | Payment reference |

### Error Classes

| Class | Description |
|-------|-------------|
| `X402Error` | Base error class |
| `InsufficientBalanceError` | Not enough SOL/USDC |
| `PaymentExpiredError` | Payment window expired |
| `PaymentRejectedError` | Server rejected payment |
| `TransactionFailedError` | On-chain transaction failed |
| `MaxPaymentExceededError` | Amount exceeds configured max |
| `RateLimitError` | API rate limit hit |
| `NetworkError` | Connection failure |

---

## Support

- Website: https://jellychain.fun
- Docs: https://jellychain.fun/docs
- GitHub: https://github.com/jelly-chain/sdk
- Twitter: https://x.com/jellyqnw

## License

MIT
