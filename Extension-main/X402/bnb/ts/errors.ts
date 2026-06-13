/**
 * Jelly x402 BNB SDK Error Classes
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

  constructor(required: number, available: number, currency: string = 'BNB') {
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

export class InsufficientGasError extends X402Error {
  public requiredBNB: number;
  public availableBNB: number;

  constructor(requiredBNB: number, availableBNB: number) {
    super(
      `Insufficient BNB for gas: need ~${requiredBNB} BNB for fees, have ${availableBNB} BNB`,
      'INSUFFICIENT_GAS',
      402
    );
    this.name = 'InsufficientGasError';
    this.requiredBNB = requiredBNB;
    this.availableBNB = availableBNB;
    Object.setPrototypeOf(this, InsufficientGasError.prototype);
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
  public txHash?: string;

  constructor(reason: string, txHash?: string) {
    super(`Payment rejected: ${reason}`, 'PAYMENT_REJECTED', 402);
    this.name = 'PaymentRejectedError';
    this.reason = reason;
    this.txHash = txHash;
    Object.setPrototypeOf(this, PaymentRejectedError.prototype);
  }
}

export class TransactionFailedError extends X402Error {
  public txHash?: string;
  public revertReason?: string;

  constructor(message: string, txHash?: string, revertReason?: string) {
    super(message, 'TRANSACTION_FAILED', 500);
    this.name = 'TransactionFailedError';
    this.txHash = txHash;
    this.revertReason = revertReason;
    Object.setPrototypeOf(this, TransactionFailedError.prototype);
  }
}

export class InvalidAddressError extends X402Error {
  public address: string;

  constructor(address: string) {
    super(`Invalid BNB Chain (EVM) address: ${address}`, 'INVALID_ADDRESS', 400);
    this.name = 'InvalidAddressError';
    this.address = address;
    Object.setPrototypeOf(this, InvalidAddressError.prototype);
  }
}

export class WrongChainError extends X402Error {
  public expectedChainId: number;
  public actualChainId: number;

  constructor(expectedChainId: number, actualChainId: number) {
    super(
      `Wrong chain: expected chainId ${expectedChainId}, got ${actualChainId}`,
      'WRONG_CHAIN',
      400
    );
    this.name = 'WrongChainError';
    this.expectedChainId = expectedChainId;
    this.actualChainId = actualChainId;
    Object.setPrototypeOf(this, WrongChainError.prototype);
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

export class ConfigurationError extends X402Error {
  public field: string;

  constructor(field: string, message: string) {
    super(`Configuration error for '${field}': ${message}`, 'CONFIG_ERROR');
    this.name = 'ConfigurationError';
    this.field = field;
    Object.setPrototypeOf(this, ConfigurationError.prototype);
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
