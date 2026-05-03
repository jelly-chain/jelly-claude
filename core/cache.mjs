export class CacheManager {
  constructor(opts = {}) {
    this._store = new Map();
    this._ttls  = new Map();
    this._defaultTtlMs = opts.defaultTtlMs ?? 60_000;
    this._maxSize = opts.maxSize ?? 1000;
    this._hits = 0;
    this._misses = 0;
  }

  set(key, value, ttlMs) {
    if (this._store.size >= this._maxSize) this._evictOldest();
    this._store.set(key, { value, ts: Date.now() });
    this._ttls.set(key, ttlMs ?? this._defaultTtlMs);
    return value;
  }

  get(key) {
    const entry = this._store.get(key);
    if (!entry) { this._misses++; return undefined; }
    const ttl = this._ttls.get(key);
    if (ttl != null && Date.now() - entry.ts > ttl) {
      this._store.delete(key);
      this._ttls.delete(key);
      this._misses++;
      return undefined;
    }
    this._hits++;
    return entry.value;
  }

  has(key) { return this.get(key) !== undefined; }

  async getOrFetch(key, fetcher, ttlMs) {
    const cached = this.get(key);
    if (cached !== undefined) return cached;
    const fresh = await fetcher();
    this.set(key, fresh, ttlMs);
    return fresh;
  }

  del(key) {
    this._store.delete(key);
    this._ttls.delete(key);
  }

  clear() {
    this._store.clear();
    this._ttls.clear();
  }

  _evictOldest() {
    let oldest = Infinity, oldKey = null;
    for (const [k, v] of this._store) {
      if (v.ts < oldest) { oldest = v.ts; oldKey = k; }
    }
    if (oldKey) { this._store.delete(oldKey); this._ttls.delete(oldKey); }
  }

  stats() {
    return {
      size:   this._store.size,
      hits:   this._hits,
      misses: this._misses,
      hitRate: this._hits + this._misses === 0
        ? 0
        : (this._hits / (this._hits + this._misses)).toFixed(3),
    };
  }
}

const _caches = new Map();

export function getCache(name, opts) {
  if (!_caches.has(name)) _caches.set(name, new CacheManager(opts));
  return _caches.get(name);
}

export const defaultCache = new CacheManager({ defaultTtlMs: 60_000, maxSize: 2000 });
export default { CacheManager, getCache, defaultCache };
