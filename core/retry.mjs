// core/retry.mjs — Phase 2: retry with exponential backoff (typed API)
export async function withRetry(fn, { retries = 3, baseDelayMs = 500, retryOn = [429, 500, 502, 503] } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try { return await fn(); } catch (err) {
      lastError = err;
      const status = err?.status ?? err?.code;
      const isRetryable = retryOn.includes(status);
      if (attempt === retries || !isRetryable) throw err;
      const delay = baseDelayMs * 2 ** attempt + (Math.random() * 100);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError;
}
export default withRetry;
