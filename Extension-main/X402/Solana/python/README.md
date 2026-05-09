# Jelly x402 SDK for Python

Official Python SDK for integrating with the Jelly x402 autonomous payment protocol on Solana.

> Jelly is formless, unstoppable. Jelly sees all chains.

**GitHub:** https://github.com/jelly-chain/sdk  
**Docs:** https://jellychain.fun/docs

## Installation

```bash
pip install jelly-x402
```

With Flask middleware support:
```bash
pip install jelly-x402[flask]
```

With Solana wallet support:
```bash
pip install jelly-x402[solana]
```

## Quick Start

```python
from jelly_x402 import X402Client

client = X402Client(
    api_key='x402_your_api_key',
    base_url='https://api.jellychain.fun',
    max_payment_per_request=0.1  # Max SOL per request
)

# Make a payment-enabled request
response = client.request('https://api.example.com/premium-data')
print(response.data)

# If payment was made automatically:
if response.payment_made:
    print(f"Paid {response.payment_made['amount']} {response.payment_made['currency']}")
```

## Configuration

```python
from jelly_x402 import X402Client, X402Config

config = X402Config(
    network='mainnet-beta',   # or 'devnet'
    rpc_url='https://api.mainnet-beta.solana.com',
    max_payment_per_request=0.1,
    commitment='confirmed',
)

client = X402Client(keypair=keypair, config=config)
```

## Async Support

```python
from jelly_x402 import AsyncX402Client
import asyncio

async def main():
    client = AsyncX402Client(keypair=keypair)
    response = await client.request('https://api.example.com/data')
    print(response.data)

asyncio.run(main())
```

## Flask Middleware

```python
from flask import Flask
from jelly_x402 import create_x402_middleware

app = Flask(__name__)
x402 = create_x402_middleware(
    api_key='x402_your_api_key',
    recipient='YOUR_SOLANA_WALLET_ADDRESS'
)

@app.route('/api/premium')
@x402.require_payment(0.001)  # 0.001 SOL
def premium_endpoint():
    return {'data': 'Premium content!'}
```

## Error Handling

```python
from jelly_x402 import X402Error, InsufficientBalanceError, PaymentExpiredError

try:
    response = client.request('https://api.example.com/data')
except InsufficientBalanceError as e:
    print(f"Not enough SOL: need {e.required}")
except PaymentExpiredError:
    print("Payment window expired, retrying...")
except X402Error as e:
    print(f"Jelly x402 error: {e.message}")
```

## Documentation

Full documentation: https://jellychain.fun/docs

## Support

- GitHub: https://github.com/jelly-chain/sdk
- Email: support@jellychain.fun

## License

MIT
