/** Error hierarchy for jelly-polygon-tentacle. */

export class PolygonTentacleError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'PolygonTentacleError';
  }
}

export class ProviderError extends PolygonTentacleError {
  constructor(message: string, public readonly provider: string) {
    super(message, 'PROVIDER_ERROR');
    this.name = 'ProviderError';
  }
}

export class AlchemyError extends PolygonTentacleError {
  constructor(message: string) {
    super(message, 'ALCHEMY_ERROR');
    this.name = 'AlchemyError';
  }
}

export class PolymarketError extends PolygonTentacleError {
  constructor(message: string) {
    super(message, 'POLYMARKET_ERROR');
    this.name = 'PolymarketError';
  }
}

export class ValidationError extends PolygonTentacleError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends PolygonTentacleError {
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConfigError extends PolygonTentacleError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR');
    this.name = 'ConfigError';
  }
}

export class RateLimitError extends PolygonTentacleError {
  constructor(provider: string) {
    super(`Rate limit exceeded for provider: ${provider}`, 'RATE_LIMIT');
    this.name = 'RateLimitError';
  }
}

export function isPolygonTentacleError(err: unknown): err is PolygonTentacleError {
  return err instanceof PolygonTentacleError;
}

export function toPolygonTentacleError(err: unknown): PolygonTentacleError {
  if (isPolygonTentacleError(err)) return err;
  const message = err instanceof Error ? err.message : String(err);
  return new PolygonTentacleError(message, 'UNKNOWN_ERROR');
}
