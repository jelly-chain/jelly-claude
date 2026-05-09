/**
 * X402 SDK Main Client
 */

import type {
  X402Config,
  PaymentRequest,
  PaymentResponse,
  VerifyRequest,
  VerifyResponse,
  BalanceResponse,
  TransactionHistoryRequest,
  TransactionHistoryResponse,
  RequestOptions,
  X402Response,
  PaymentRequirement,
  AgentStats,
} from './types';

import {
  X402Error,
  NetworkError,
  RateLimitError,
  MaxPaymentExceededError,
  PaymentExpiredError,
  handleApiError,
} from './errors';

const DEFAULT_CONFIG: Partial<X402Config> = {
  baseUrl: 'https://api.jellychain.fun',
  network: 'mainnet-beta',
  maxPaymentPerRequest: 0.1,
  commitment: 'confirmed',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

export class X402Client {
  private config: Required<X402Config>;
  private keypair?: any;

  constructor(config: X402Config) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      logger: config.logger || (() => {}),
    } as Required<X402Config>;
  }

  setKeypair(keypair: any): void {
    this.keypair = keypair;
  }

  async request<T = any>(url: string, options: RequestOptions = {}): Promise<X402Response<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.config.timeout,
      maxPayment = this.config.maxPaymentPerRequest,
      autoSign = true,
    } = options;

    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < this.config.retryAttempts) {
      attempts++;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
            'X-402-SDK-Version': '1.0.0',
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 402 && autoSign) {
          const requirement = this.parsePaymentRequirement(response);
          
          if (requirement.amount > maxPayment) {
            throw new MaxPaymentExceededError(requirement.amount, maxPayment);
          }

          if (Date.now() / 1000 > requirement.expires) {
            throw new PaymentExpiredError(requirement.reference, new Date(requirement.expires * 1000));
          }

          if (!this.keypair) {
            throw new X402Error('Keypair required for automatic payments', 'NO_KEYPAIR');
          }

          const signature = await this.executePayment(requirement);
          
          const retryResponse = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.apiKey}`,
              'X-402-Payment-Signature': signature,
              'X-402-Payment-Reference': requirement.reference,
              ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
          });

          if (!retryResponse.ok) {
            const errorBody = await retryResponse.json().catch(() => ({}));
            handleApiError(retryResponse, errorBody);
          }

          const data = await retryResponse.json();
          return {
            data,
            status: retryResponse.status,
            headers: Object.fromEntries(retryResponse.headers.entries()),
            paymentMade: {
              amount: requirement.amount,
              currency: requirement.currency,
              signature,
            },
          };
        }

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          handleApiError(response, errorBody);
        }

        const data = await response.json();
        return {
          data,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
        };

      } catch (error) {
        lastError = error as Error;

        if (error instanceof RateLimitError) {
          await this.sleep(error.retryAfter * 1000);
          continue;
        }

        if (error instanceof X402Error) {
          throw error;
        }

        if ((error as any).name === 'AbortError') {
          throw new NetworkError('Request timed out');
        }

        if (attempts < this.config.retryAttempts) {
          await this.sleep(this.config.retryDelay * attempts);
          continue;
        }

        throw new NetworkError('Network request failed', error as Error);
      }
    }

    throw lastError || new NetworkError('Max retry attempts exceeded');
  }

  async verify(request: VerifyRequest): Promise<VerifyResponse> {
    const response = await this.apiRequest<VerifyResponse>('/verify', {
      method: 'POST',
      body: request,
    });
    return response.data;
  }

  async createPaymentRequest(request: PaymentRequest): Promise<PaymentResponse> {
    const response = await this.apiRequest<PaymentResponse>('/payment-request', {
      method: 'POST',
      body: request,
    });
    return response.data;
  }

  async getBalance(address: string): Promise<BalanceResponse> {
    const response = await this.apiRequest<BalanceResponse>(`/balance/${address}`);
    return response.data;
  }

  async getTransaction(signature: string): Promise<any> {
    const response = await this.apiRequest(`/transaction/${signature}`);
    return response.data;
  }

  async getTransactionHistory(request: TransactionHistoryRequest): Promise<TransactionHistoryResponse> {
    const params = new URLSearchParams();
    if (request.limit) params.set('limit', request.limit.toString());
    if (request.before) params.set('before', request.before);
    if (request.after) params.set('after', request.after);

    const queryString = params.toString();
    const url = `/transactions/${request.address}${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.apiRequest<TransactionHistoryResponse>(url);
    return response.data;
  }

  async getAgentStats(): Promise<AgentStats> {
    const response = await this.apiRequest<AgentStats>('/agent/stats');
    return response.data;
  }

  parsePaymentRequirement(response: Response): PaymentRequirement {
    const headers = response.headers;
    
    const amount = parseFloat(headers.get('X-402-Amount') || '0');
    const currency = (headers.get('X-402-Currency') || 'SOL') as 'SOL' | 'USDC';
    const recipient = headers.get('X-402-Recipient') || '';
    const reference = headers.get('X-402-Reference') || '';
    const expires = parseInt(headers.get('X-402-Expires') || '0', 10);
    const network = headers.get('X-402-Network') || undefined;

    if (!amount || !recipient || !reference) {
      throw new X402Error('Invalid 402 response: missing required headers', 'INVALID_402');
    }

    return { amount, currency, recipient, reference, expires, network };
  }

  private async apiRequest<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<X402Response<T>> {
    const url = `${this.config.baseUrl}/api${endpoint}`;
    return this.request<T>(url, { ...options, autoSign: false });
  }

  private async executePayment(requirement: PaymentRequirement): Promise<string> {
    this.config.logger(`Executing payment: ${requirement.amount} ${requirement.currency}`, 'info');
    
    const signature = `simulated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.config.logger(`Payment executed: ${signature}`, 'info');
    return signature;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default X402Client;
