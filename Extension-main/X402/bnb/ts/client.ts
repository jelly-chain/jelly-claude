/**
 * Jelly x402 BNB Client
 * Make HTTP 402 payment-enabled requests settled on BNB Chain (BSC).
 *
 * BNB Chain specifics:
 *  - Chain ID 56 (mainnet) / 97 (testnet)
 *  - EVM-compatible addresses (0x...)
 *  - Native token: BNB  |  Tokens: USDT, USDC, BUSD (BEP-20)
 *  - Transaction identified by txHash (not "signature")
 *  - Gas denominated in gwei; paid in BNB
 */

import type {
  BNBConfig,
  BNBPaymentRequest,
  BNBPaymentResponse,
  BNBVerifyRequest,
  BNBVerifyResponse,
  BNBBalanceResponse,
  BNBTransactionHistoryRequest,
  BNBTransactionHistoryResponse,
  BNBRequestOptions,
  BNBResponse,
  BNBPaymentRequirement,
  BNBAgentStats,
  BNBGasEstimate,
} from './types';

import {
  X402Error,
  NetworkError,
  RateLimitError,
  MaxPaymentExceededError,
  PaymentExpiredError,
  handleApiError,
} from './errors';

import { BNBWallet } from './wallet';

const DEFAULT_CONFIG: Partial<BNBConfig> = {
  baseUrl: 'https://api.jellychain.fun',
  network: 'mainnet',
  chainId: 56,
  maxPaymentPerRequest: 0.01,   // BNB (smaller default than SOL — BNB is ~$600+)
  gasSpeed: 'standard',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

export class BNBX402Client {
  private config: Required<BNBConfig>;
  private wallet?: BNBWallet;

  constructor(config: BNBConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      rpcUrl: config.rpcUrl || (config.network === 'testnet'
        ? 'https://data-seed-prebsc-1-s1.binance.org:8545/'
        : 'https://bsc-dataseed.binance.org/'),
      logger: config.logger || (() => {}),
    } as Required<BNBConfig>;
  }

  /**
   * Attach a BNBWallet for automatic payment signing.
   * The wallet's address is used as the payer.
   */
  setWallet(wallet: BNBWallet): void {
    this.wallet = wallet;
  }

  /**
   * Make an HTTP request with automatic HTTP 402 handling on BNB Chain.
   *
   * If the endpoint responds with 402:
   *  1. Parses payment requirement from response headers
   *  2. Validates amount < maxPaymentPerRequest and not expired
   *  3. Executes an on-chain BNB/BEP-20 transfer
   *  4. Retries the original request with X-402-Payment-TxHash header
   */
  async request<T = any>(url: string, options: BNBRequestOptions = {}): Promise<BNBResponse<T>> {
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
            'X-402-SDK': 'jelly-x402-bnb',
            'X-402-SDK-Version': '1.0.0',
            'X-402-Chain-Id': this.config.chainId.toString(),
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
            throw new PaymentExpiredError(
              requirement.reference,
              new Date(requirement.expires * 1000)
            );
          }

          if (!this.wallet) {
            throw new X402Error(
              'BNBWallet required for automatic payments — call setWallet(wallet) first',
              'NO_WALLET'
            );
          }

          const tx = await this.executePayment(requirement);
          this.config.logger(`Payment sent: ${tx.txHash}`, 'info');

          const retryResponse = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.apiKey}`,
              'X-402-Payment-TxHash': tx.txHash,
              'X-402-Payment-Reference': requirement.reference,
              'X-402-Chain-Id': requirement.chainId.toString(),
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
              txHash: tx.txHash,
              gasUsed: tx.gasUsed,
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

  async verify(request: BNBVerifyRequest): Promise<BNBVerifyResponse> {
    const response = await this.apiRequest<BNBVerifyResponse>('/bnb/verify', {
      method: 'POST',
      body: request,
    });
    return response.data;
  }

  async createPaymentRequest(request: BNBPaymentRequest): Promise<BNBPaymentResponse> {
    const response = await this.apiRequest<BNBPaymentResponse>('/bnb/payment-request', {
      method: 'POST',
      body: request,
    });
    return response.data;
  }

  async getBalance(address: string): Promise<BNBBalanceResponse> {
    const response = await this.apiRequest<BNBBalanceResponse>(`/bnb/balance/${address}`);
    return response.data;
  }

  async getTransaction(txHash: string): Promise<any> {
    const response = await this.apiRequest(`/bnb/transaction/${txHash}`);
    return response.data;
  }

  async getTransactionHistory(
    request: BNBTransactionHistoryRequest
  ): Promise<BNBTransactionHistoryResponse> {
    const params = new URLSearchParams();
    if (request.limit) params.set('limit', request.limit.toString());
    if (request.before) params.set('before', request.before);
    if (request.after) params.set('after', request.after);
    if (request.currency) params.set('currency', request.currency);

    const qs = params.toString();
    const url = `/bnb/transactions/${request.address}${qs ? `?${qs}` : ''}`;
    const response = await this.apiRequest<BNBTransactionHistoryResponse>(url);
    return response.data;
  }

  async getGasEstimate(): Promise<BNBGasEstimate> {
    const response = await this.apiRequest<BNBGasEstimate>('/bnb/gas');
    return response.data;
  }

  async getAgentStats(): Promise<BNBAgentStats> {
    const response = await this.apiRequest<BNBAgentStats>('/bnb/agent/stats');
    return response.data;
  }

  /**
   * Parse payment requirement from a 402 response.
   * BNB-specific headers:
   *   X-402-Amount         — amount in BNB (or token units)
   *   X-402-Currency       — BNB | USDT | USDC | BUSD
   *   X-402-Recipient      — 0x... EVM address
   *   X-402-Reference      — unique payment reference
   *   X-402-Expires        — unix timestamp
   *   X-402-Chain-Id       — 56 (mainnet) or 97 (testnet)
   */
  parsePaymentRequirement(response: Response): BNBPaymentRequirement {
    const h = response.headers;

    const amount = parseFloat(h.get('X-402-Amount') || '0');
    const currency = (h.get('X-402-Currency') || 'BNB') as BNBPaymentRequirement['currency'];
    const recipient = h.get('X-402-Recipient') || '';
    const reference = h.get('X-402-Reference') || '';
    const expires = parseInt(h.get('X-402-Expires') || '0', 10);
    const chainId = parseInt(h.get('X-402-Chain-Id') || '56', 10);
    const network = h.get('X-402-Network') || undefined;

    if (!amount || !recipient || !reference) {
      throw new X402Error('Invalid 402 response: missing BNB payment headers', 'INVALID_402');
    }

    return { amount, currency, recipient, reference, expires, chainId, network };
  }

  private async apiRequest<T = any>(
    endpoint: string,
    options: BNBRequestOptions = {}
  ): Promise<BNBResponse<T>> {
    const url = `${this.config.baseUrl}/api${endpoint}`;
    return this.request<T>(url, { ...options, autoSign: false });
  }

  private async executePayment(req: BNBPaymentRequirement): Promise<{ txHash: string; gasUsed?: number }> {
    this.config.logger(
      `Executing BNB payment: ${req.amount} ${req.currency} → ${req.recipient}`,
      'info'
    );

    if (!this.wallet) throw new X402Error('No wallet', 'NO_WALLET');

    const tx = await this.wallet.transfer({
      recipient: req.recipient,
      amount: req.amount,
      currency: req.currency,
      memo: req.reference,
      gasSpeed: this.config.gasSpeed,
    });

    this.config.logger(`Tx hash: ${tx.txHash}`, 'info');
    return { txHash: tx.txHash, gasUsed: tx.gasUsed };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Async wrapper around BNBX402Client for use in async/await heavy agent pipelines.
 */
export class AsyncBNBX402Client extends BNBX402Client {
  constructor(config: BNBConfig) {
    super(config);
  }
}

export default BNBX402Client;
