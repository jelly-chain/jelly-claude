# Webhook Playbooks

Jelly-Alchemy's `WebhookService` and `watch-address` tool let you register Alchemy Notify webhooks to receive real-time onchain events. All webhook calls are stubs in v0.1; this document describes the intended usage patterns for v0.2+.

## Playbook 1 — Watch a Whale Wallet

```typescript
import { WebhookService } from 'jelly-alchemy/services/webhook-service.js';

const svc = new WebhookService();

await svc.watchAddresses({
  addresses: ['0xWhaleAddress1', '0xWhaleAddress2'],
  webhookUrl: 'https://your-server.com/hooks/whale-alert',
  network: 'ETH_MAINNET',
});
```

Alchemy will POST to your webhook whenever any of the watched addresses sends or receives a transaction.

---

## Playbook 2 — Monitor a DeFi Contract

Use `ADDRESS_ACTIVITY` type on a liquidity pool or AMM contract to capture every swap, add-liquidity, and remove-liquidity event.

```typescript
await svc.watchAddresses({
  addresses: ['0xUniswapV3PoolAddress'],
  webhookUrl: 'https://your-server.com/hooks/pool-activity',
  network: 'MATIC_MAINNET',
});
```

---

## Playbook 3 — List and Clean Up Webhooks

```typescript
const webhooks = await svc.listAll();
console.log(`Active webhooks: ${webhooks.length}`);

for (const wh of webhooks) {
  if (!wh.isActive) {
    await svc.remove(wh.id);
  }
}
```

---

## Webhook Payload Shape

```typescript
interface WebhookPayload {
  webhookId: string;
  id: string;
  createdAt: string;
  type: WebhookType;
  event: Record<string, unknown>;
}
```

Parse incoming payloads using `WebhooksClient.parsePayload(rawBody)`.

---

## Supported Networks (Alchemy Notify)

| Chain | Network String |
|-------|---------------|
| Ethereum | `ETH_MAINNET` |
| BNB Chain | `BNB_MAINNET` |
| Base | `BASE_MAINNET` |
| Arbitrum | `ARB_MAINNET` |
| Polygon | `MATIC_MAINNET` |
