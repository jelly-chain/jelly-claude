/** WebhookService — register and manage Polygon address webhooks. */

import { WebhooksClient, WebhookDefinition } from '../client/webhooks.js';

export interface WatchedAddress {
  address: string;
  label?: string;
  webhookId: string;
  callbackUrl: string;
  addedAt: string;
}

export class WebhookService {
  private readonly watched = new Map<string, WatchedAddress>();

  constructor(private readonly client: WebhooksClient) {}

  async watchAddress(
    address: string,
    callbackUrl: string,
    label?: string,
  ): Promise<WatchedAddress> {
    const existing = this.watched.get(address.toLowerCase());
    if (existing) return existing;

    const webhook = await this.client.registerAddressActivity([address], callbackUrl);
    const entry: WatchedAddress = {
      address: address.toLowerCase(),
      label,
      webhookId: webhook.id,
      callbackUrl,
      addedAt: new Date().toISOString(),
    };
    this.watched.set(entry.address, entry);
    return entry;
  }

  async unwatchAddress(address: string): Promise<void> {
    const entry = this.watched.get(address.toLowerCase());
    if (!entry) return;
    await this.client.deleteWebhook(entry.webhookId);
    this.watched.delete(address.toLowerCase());
  }

  listWatched(): WatchedAddress[] {
    return Array.from(this.watched.values());
  }

  isWatched(address: string): boolean {
    return this.watched.has(address.toLowerCase());
  }

  async listWebhooks(): Promise<WebhookDefinition[]> {
    return this.client.listWebhooks();
  }
}
