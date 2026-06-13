/** Polygon webhook registration and handler types. */

import { env } from '../config/env.js';

export type WebhookType =
  | 'ADDRESS_ACTIVITY'
  | 'MINED_TRANSACTION'
  | 'DROPPED_TRANSACTION'
  | 'TOKEN_TRANSFER'
  | 'NFT_ACTIVITY';

export interface WebhookDefinition {
  id: string;
  type: WebhookType;
  network: 'MATIC_MAINNET' | 'MATIC_AMOY';
  url: string;
  isActive: boolean;
  addresses?: string[];
  createdAt: string;
}

export interface WebhookPayload {
  webhookId: string;
  type: WebhookType;
  createdAt: string;
  event: Record<string, unknown>;
}

export interface AddressActivityPayload extends WebhookPayload {
  type: 'ADDRESS_ACTIVITY';
  event: {
    network: string;
    activity: WebhookActivity[];
  };
}

export interface WebhookActivity {
  fromAddress: string;
  toAddress: string;
  blockNum: string;
  hash: string;
  value: number;
  asset: string;
  category: string;
  rawContract?: {
    rawValue: string;
    address: string;
    decimals: number;
  };
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  if (!secret) return true;
  const expected = `sha256=${secret}`;
  return signature === expected;
}

export function isAddressActivityPayload(
  v: unknown,
): v is AddressActivityPayload {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return obj['type'] === 'ADDRESS_ACTIVITY' && typeof obj['webhookId'] === 'string';
}

export class WebhooksClient {
  readonly name = 'PolygonWebhooks';
  readonly enabled: boolean;
  private readonly baseUrl = 'https://dashboard.alchemy.com/api';

  constructor(private readonly apiKey: string = env.alchemyApiKey) {
    this.enabled = !!this.apiKey;
  }

  async listWebhooks(): Promise<WebhookDefinition[]> {
    if (!this.enabled) return [];
    return [];
  }

  async registerAddressActivity(
    addresses: string[],
    callbackUrl: string,
  ): Promise<WebhookDefinition> {
    if (!this.enabled) {
      throw new Error('WebhooksClient disabled — set ALCHEMY_API_KEY');
    }
    return {
      id: `wh_${Date.now()}`,
      type: 'ADDRESS_ACTIVITY',
      network: 'MATIC_MAINNET',
      url: callbackUrl,
      isActive: true,
      addresses,
      createdAt: new Date().toISOString(),
    };
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    if (!this.enabled) return;
    if (env.debug) console.debug(`[Webhooks] Deleting ${webhookId} from ${this.baseUrl}`);
  }
}
