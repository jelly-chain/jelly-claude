/** Response normalization utilities for Alchemy + Polymarket API responses. */

export function normalizeAddress(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.toLowerCase().trim();
}

export function normalizeHexString(raw: unknown): string {
  if (typeof raw !== 'string') return '0x0';
  const cleaned = raw.trim();
  return cleaned.startsWith('0x') ? cleaned : `0x${cleaned}`;
}

export function normalizeNumber(raw: unknown, fallback = 0): number {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const n = Number(raw);
    return Number.isNaN(n) ? fallback : n;
  }
  if (typeof raw === 'bigint') return Number(raw);
  return fallback;
}

export function normalizeString(raw: unknown, fallback = ''): string {
  if (typeof raw === 'string') return raw;
  return fallback;
}

export function normalizeBoolean(raw: unknown, fallback = false): boolean {
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'string') return raw === 'true' || raw === '1';
  if (typeof raw === 'number') return raw !== 0;
  return fallback;
}

export function normalizeArray<T>(
  raw: unknown,
  itemNormalizer: (item: unknown) => T,
): T[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(itemNormalizer);
}

export function safeRecord(raw: unknown): Record<string, unknown> {
  if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

export function normalizeTimestamp(raw: unknown): string {
  if (typeof raw === 'string' && raw.includes('T')) return raw;
  if (typeof raw === 'number') return new Date(raw * 1000).toISOString();
  return new Date().toISOString();
}
