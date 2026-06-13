/** Webhook registration types and stub client for Alchemy Notify. */

export type WebhookType =
  | 'MINED_TRANSACTION'
  | 'DROPPED_TRANSACTION'
  | 'ADDRESS_ACTIVITY'
  | 'NFT_ACTIVITY'
  | 'NFT_METADATA_UPDATE';

export interface WebhookConfig {
  type: WebhookType;
  network: string;
  webhookUrl: string;
  addresses?: string[];
  nftFilters?: { contractAddress: string; tokenId?: string }[];
}

export interface Webhook {
  id: string;
  network: string;
  webhookType: WebhookType;
  webhookUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface WebhookListResponse {
  data: Webhook[];
  totalCount: number;
}

export interface WebhookPayload {
  webhookId: string;
  id: string;
  createdAt: string;
  type: WebhookType;
  event: Record<string, unknown>;
}

/** Stub client for Alchemy Notify webhook management. v0.1 — types only. */
export class WebhooksClient {
  private readonly baseUrl = 'https://dashboard.alchemy.com/api';
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createWebhook(config: WebhookConfig): Promise<Webhook> {
    void config;
    return Promise.reject(new Error('WebhooksClient.createWebhook: not implemented in v0.1'));
  }

  async listWebhooks(): Promise<WebhookListResponse> {
    void this.baseUrl;
    void this.apiKey;
    return Promise.reject(new Error('WebhooksClient.listWebhooks: not implemented in v0.1'));
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    void webhookId;
    return Promise.reject(new Error('WebhooksClient.deleteWebhook: not implemented in v0.1'));
  }

  async updateWebhookAddresses(webhookId: string, addresses: string[]): Promise<void> {
    void webhookId;
    void addresses;
    return Promise.reject(new Error('WebhooksClient.updateWebhookAddresses: not implemented in v0.1'));
  }

  parsePayload(raw: unknown): WebhookPayload {
    if (typeof raw !== 'object' || raw === null) {
      throw new Error('Invalid webhook payload');
    }
    return raw as WebhookPayload;
  }
}
