# Webhook Recipes

Alchemy webhook patterns for monitoring Polygon addresses in real time.

## Setup

1. Get an Alchemy API key at https://www.alchemy.com
2. Set `ALCHEMY_API_KEY` and `POLYGON_WEBHOOK_SECRET` in `.env`
3. Expose a public HTTPS endpoint for webhook delivery

## Recipe 1: Watch the Polymarket CTF Exchange

Trigger on every USDC flow into or out of the CTF Exchange contract.

```ts
import { WebhookService } from 'jelly-polygon-tentacle/src/services/webhook-service.js';
import { WebhooksClient } from 'jelly-polygon-tentacle/src/client/webhooks.js';

const client = new WebhooksClient(process.env.ALCHEMY_API_KEY);
const service = new WebhookService(client);

await service.watchAddress(
  '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E', // CTF Exchange
  'https://your-server.com/webhooks/polygon',
  'polymarket-ctf',
);
```

## Recipe 2: Monitor Multiple Whale Wallets

```ts
const whales = [
  '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
  '0x4b5057b2c87ec9e7c906bd0afe7b4df33eae3180',
];

for (const whale of whales) {
  await service.watchAddress(whale, callbackUrl, `whale-${whale.slice(2, 8)}`);
}
```

## Verifying Webhook Signatures

```ts
import { verifyWebhookSignature } from 'jelly-polygon-tentacle/src/client/webhooks.js';

app.post('/webhooks/polygon', (req, res) => {
  const sig = req.headers['x-alchemy-signature'];
  const valid = verifyWebhookSignature(
    JSON.stringify(req.body),
    sig,
    process.env.POLYGON_WEBHOOK_SECRET,
  );
  if (!valid) return res.sendStatus(401);
  // process payload
  res.sendStatus(200);
});
```

## Payload Shape

```json
{
  "webhookId": "wh_abc123",
  "type": "ADDRESS_ACTIVITY",
  "createdAt": "2025-05-06T00:00:00.000Z",
  "event": {
    "network": "MATIC_MAINNET",
    "activity": [
      {
        "fromAddress": "0x...",
        "toAddress": "0x...",
        "blockNum": "0x376be88",
        "hash": "0x...",
        "value": 500000,
        "asset": "USDC",
        "category": "token"
      }
    ]
  }
}
```
