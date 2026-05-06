/** Common reusable schema types and type guards. */

export interface PaginatedResult<T> {
  items: T[];
  pageKey?: string;
  hasMore: boolean;
  total?: number;
}

export interface TimestampedResult<T> {
  data: T;
  fetchedAt: string;
}

export interface ErrorResult {
  error: string;
  code?: string;
}

export function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

export function isString(val: unknown): val is string {
  return typeof val === 'string';
}

export function isNumber(val: unknown): val is number {
  return typeof val === 'number';
}

export function isStringArray(val: unknown): val is string[] {
  return Array.isArray(val) && val.every(isString);
}

export function isPaginatedResult<T>(
  val: unknown,
  itemGuard: (v: unknown) => v is T,
): val is PaginatedResult<T> {
  if (!isRecord(val)) return false;
  if (!Array.isArray(val['items'])) return false;
  return val['items'].every(itemGuard);
}
