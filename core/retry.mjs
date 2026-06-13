// core/retry.mjs — Retry with exponential backoff + AppError integration
import { AppError, errRateLimited, errTimeout, errCircuitOpen } from './app-error.mjs';
import { createLogger } from './logger.mjs';
import { metrics } from './metrics.mjs';

const log = createLogger('retry');

export async function withRetry(fn, {
  retries = 10,
  baseDelayMs = 500,
  retryOn = [429, 500, 502, 503],
  source = 'unknown',
  maxDelayMs = 60_000,
  backoffFactor = 2,
  jitter = true,
} = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      // Convert to AppError for consistent handling
      if (!(err instanceof AppError)) {
        lastError = AppError.from(err, source);
      }

      const isRetryable = lastError.retryable || retryOn.includes(lastError.status ?? lastError.code);
      if (attempt === retries || !isRetryable) {
        metrics.incMetric('retry.exhausted', 1, { source });
        throw lastError;
      }

      // Exponential backoff with jitter
      const baseDelay = baseDelayMs * (backoffFactor ** attempt);
      const jitterMs = jitter ? Math.random() * baseDelayMs : 0;
      const delay = Math.min(baseDelay + jitterMs, maxDelayMs);

      // Respect retry-after header if present
      const retryAfterMs = lastError.context?.retryAfterMs;
      const finalDelay = retryAfterMs ? Math.max(delay, retryAfterMs) : delay;

      log.debug(`Retry attempt ${attempt + 1}/${retries} for ${source}`, {
        delayMs: finalDelay,
        error: lastError.message,
      });
      metrics.incMetric('retry.attempts', 1, { source });

      await new Promise(r => setTimeout(r, finalDelay));
    }
  }
  throw lastError;
}

/**
 * Retry only if the error is retryable per AppError codes.
 */
export async function withRetryable(fn, opts = {}) {
  return withRetry(fn, {
    ...opts,
    retryOn: [], // rely on AppError.retryable instead
  });
}

export default withRetry;
