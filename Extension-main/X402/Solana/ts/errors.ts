/**
 * X402 SDK Error Classes
 */

export class X402Error extends Error {
  public code: string;
  public statusCode?: number;
  public details?: Record<string, any>;

  constructor(message: string, code: string, statusCode?: number, details?: Record<string, any>) {
    super(message);
    this.name = 'X402Error';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, X402Error.prototype);
  }
}

export class InsufficientBalanceError extends X402Error {
  public required: number;
  public available: number;
  public currency: string;

  constructor(required: number, available: number, currency: string = 'SOL') {
    super(
      `Insufficient balance: need ${required} ${currency}, have ${available} ${currency}`,
      'INSUFFICIENT_BALANCE',
      402
    );
    this.name = 'InsufficientBalanceError';
    this.required = required;
    this.available = available;
    this.currency = currency;
    Object.setPrototypeOf(this, InsufficientBalanceError.prototype);
  }
}

export class PaymentExpiredError extends X402Error {
  public expiredAt: Date;
  public reference: string;

  constructor(reference: string, expiredAt: Date) {
    super(
      `Payment window expired at ${expiredAt.toISOString()}`,
      'PAYMENT_EXPIRED',
      410
    );
    this.name = 'PaymentExpiredError';
    this.reference = reference;
    this.expiredAt = expiredAt;
    Object.setPrototypeOf(this, PaymentExpiredError.prototype);
  }
}

export class PaymentRejectedError extends X402Error {
  public reason: string;
  public signature?: string;

  constructor(reason: string, signature?: string) {
    super(`Payment rejected: ${reason}`, 'PAYMENT_REJECTED', 402);
    this.name = 'PaymentRejectedError';
    this.reason = reason;
    this.signature = signature;
    Object.setPrototypeOf(this, PaymentRejectedError.prototype);
  }
}

export class TransactionFailedError extends X402Error {
  public signature?: string;
  public logs?: string[];

  constructor(message: string, signature?: string, logs?: string[]) {
    super(message, 'TRANSACTION_FAILED', 500);
    this.name = 'TransactionFailedError';
    this.signature = signature;
    this.logs = logs;
    Object.setPrototypeOf(this, TransactionFailedError.prototype);
  }
}

export class InvalidSignatureError extends X402Error {
  public signature: string;

  constructor(signature: string) {
    super(`Invalid transaction signature: ${signature}`, 'INVALID_SIGNATURE', 400);
    this.name = 'InvalidSignatureError';
    this.signature = signature;
    Object.setPrototypeOf(this, InvalidSignatureError.prototype);
  }
}

export class RateLimitError extends X402Error {
  public retryAfter: number;
  public limit: number;

  constructor(retryAfter: number, limit: number) {
    super(
      `Rate limit exceeded. Retry after ${retryAfter} seconds`,
      'RATE_LIMITED',
      429
    );
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    this.limit = limit;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class NetworkError extends X402Error {
  public originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
    this.originalError = originalError;
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class ConfigurationError extends X402Error {
  public field: string;

  constructor(field: string, message: string) {
    super(`Configuration error for '${field}': ${message}`, 'CONFIG_ERROR');
    this.name = 'ConfigurationError';
    this.field = field;
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

export class MaxPaymentExceededError extends X402Error {
  public requested: number;
  public maximum: number;

  constructor(requested: number, maximum: number) {
    super(
      `Payment amount ${requested} exceeds maximum allowed ${maximum}`,
      'MAX_PAYMENT_EXCEEDED',
      402
    );
    this.name = 'MaxPaymentExceededError';
    this.requested = requested;
    this.maximum = maximum;
    Object.setPrototypeOf(this, MaxPaymentExceededError.prototype);
  }
}

export function isX402Error(error: unknown): error is X402Error {
  return error instanceof X402Error;
}

export function handleApiError(response: Response, body: any): never {
  const message = body?.error || body?.message || 'Unknown API error';
  const code = body?.code || 'API_ERROR';

  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
    throw new RateLimitError(retryAfter, body?.limit || 0);
  }

  if (response.status === 402) {
    throw new PaymentRejectedError(message);
  }

  throw new X402Error(message, code, response.status, body);
}
