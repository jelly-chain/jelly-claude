/** Simple TTL in-memory cache. Reuses the pattern from world-cup-jelly-sdk. */

export interface CacheOptions {
  ttlSeconds?: number;
}

export class SimpleCache {
  private readonly store = new Map<string, { value: unknown; expiresAt: number }>();
  private readonly ttlMs: number;

  constructor(options: CacheOptions = {}) {
    this.ttlMs = (options.ttlSeconds ?? 60) * 1000;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + (ttlMs ?? this.ttlMs) });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}
