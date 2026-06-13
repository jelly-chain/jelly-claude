/** AlchemyError hierarchy — no `as any`, all errors are typed. */

export class AlchemyError extends Error {
  override readonly name: string = 'AlchemyError';
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AlchemyRateLimitError extends AlchemyError {
  override readonly name = 'AlchemyRateLimitError';
  constructor(message = 'Alchemy rate limit exceeded') {
    super(message, 'RATE_LIMIT', 429);
  }
}

export class AlchemyAuthError extends AlchemyError {
  override readonly name = 'AlchemyAuthError';
  constructor(message = 'Invalid or missing Alchemy API key') {
    super(message, 'AUTH_ERROR', 401);
  }
}

export class AlchemyNetworkError extends AlchemyError {
  override readonly name = 'AlchemyNetworkError';
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
  }
}

export class AlchemyNotFoundError extends AlchemyError {
  override readonly name = 'AlchemyNotFoundError';
  constructor(resource: string) {
    super(`Resource not found: ${resource}`, 'NOT_FOUND', 404);
  }
}

export class AlchemyUnsupportedChainError extends AlchemyError {
  override readonly name = 'AlchemyUnsupportedChainError';
  constructor(chain: string, feature: string) {
    super(`Chain "${chain}" does not support feature: ${feature}`, 'UNSUPPORTED_CHAIN');
  }
}

export function isAlchemyError(err: unknown): err is AlchemyError {
  return err instanceof AlchemyError;
}

export function toAlchemyError(err: unknown): AlchemyError {
  if (err instanceof AlchemyError) return err;
  if (err instanceof Error) return new AlchemyError(err.message);
  return new AlchemyError(String(err));
}
