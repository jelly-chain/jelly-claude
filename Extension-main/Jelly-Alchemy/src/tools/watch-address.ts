import { ToolDefinition } from './index.js';
import { WebhooksClient, WebhookConfig } from '../client/webhooks.js';
import { env } from '../config/env.js';

export const watchAddressTool: ToolDefinition = {
  name: 'watch-address',
  description: 'Register an Alchemy Notify webhook to watch a wallet address for incoming/outgoing activity.',
  input_schema: {
    type: 'object',
    properties: {
      address: { type: 'string', description: 'Address to watch' },
      webhookUrl: { type: 'string', description: 'HTTPS URL to receive webhook events' },
      network: {
        type: 'string',
        enum: ['ETH_MAINNET', 'BNB_MAINNET', 'BASE_MAINNET', 'ARB_MAINNET', 'MATIC_MAINNET'],
      },
    },
    required: ['address', 'webhookUrl', 'network'],
  },
};

export interface WatchAddressInput {
  address: string;
  webhookUrl: string;
  network: string;
}

export async function handleWatchAddress(input: WatchAddressInput) {
  const client = new WebhooksClient(env.apiKey);
  const config: WebhookConfig = {
    type: 'ADDRESS_ACTIVITY',
    network: input.network,
    webhookUrl: input.webhookUrl,
    addresses: [input.address],
  };
  return client.createWebhook(config);
}
