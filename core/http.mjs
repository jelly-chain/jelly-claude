import { BUDDY_ROOT } from './fs.mjs';

export async function httpJson(url, opts = {}) {
  return httpFetch(url, { ...opts, parse: 'json' });
}

export async function httpText(url, opts = {}) {
  return httpFetch(url, { ...opts, parse: 'text' });
}

export async function httpJsonRetry(url, opts = {}) {
  return retry(async () => httpJson(url, opts), 3);
}

async function httpFetch(url, opts = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 30000);
  
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Buddy/2.0',
        ...opts.headers
      },
      ...opts
    });
    
    clearTimeout(timeout);
    
    if (!res.ok) {
      return { ok: false, status: res.status, statusText: res.statusText };
    }
    
    const parse = opts.parse ?? 'text';
    const data = parse === 'json' ? await res.json() : await res.text();
    
    return { ok: true, status: res.status, headers: Object.fromEntries(res.headers), data };
  } catch (e) {
    clearTimeout(timeout);
    return { ok: false, error: e.message };
  }
}

async function retry(fn, maxRetries = 3, delayMs = 500) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await new Promise(r => setTimeout(r, delayMs * (i + 1)));
    }
  }
}

export default { httpJson, httpText, httpJsonRetry };
