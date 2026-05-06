import { WebhooksClient, Webhook, WebhookConfig, WebhookType } from '../client/webhooks.js';
import { env } from '../config/env.js';

export interface AddressWatchRequest {
  addresses: string[];
  webhookUrl: string;
  network: string;
}

export interface WebhookRegistration {
  webhook: Webhook;
  addresses: string[];
  registeredAt: string;
}

export class WebhookService {
  private readonly client = new WebhooksClient(env.apiKey);

  async watchAddresses(req: AddressWatchRequest): Promise<WebhookRegistration> {
    const config: WebhookConfig = {
      type: 'ADDRESS_ACTIVITY' as WebhookType,
      network: req.network,
      webhookUrl: req.webhookUrl,
      addresses: req.addresses,
    };

    const webhook = await this.client.createWebhook(config);

    return {
      webhook,
      addresses: req.addresses,
      registeredAt: new Date().toISOString(),
    };
  }

  async listAll(): Promise<Webhook[]> {
    const res = await this.client.listWebhooks();
    return res.data;
  }

  async remove(webhookId: string): Promise<void> {
    return this.client.deleteWebhook(webhookId);
  }

  async addAddressesToWebhook(webhookId: string, addresses: string[]): Promise<void> {
    return this.client.updateWebhookAddresses(webhookId, addresses);
  }
}
