/** Hex, wei, address formatting utilities for Polygon data. */

const WEI_PER_ETHER = BigInt('1000000000000000000');
const WEI_PER_GWEI = BigInt('1000000000');
const USDC_DECIMALS = 6;

export function hexToDecimal(hex: string): bigint {
  if (!hex || hex === '0x') return BigInt(0);
  return BigInt(hex);
}

export function weiToEther(wei: bigint | string): number {
  const w = typeof wei === 'string' ? hexToDecimal(wei) : wei;
  return Number(w) / Number(WEI_PER_ETHER);
}

export function weiToGwei(wei: bigint | string): number {
  const w = typeof wei === 'string' ? hexToDecimal(wei) : wei;
  return Number(w) / Number(WEI_PER_GWEI);
}

export function formatUSDC(raw: bigint | string | number): number {
  const value = typeof raw === 'string'
    ? (raw.startsWith('0x') ? Number(hexToDecimal(raw)) : Number(raw))
    : typeof raw === 'bigint' ? Number(raw) : raw;
  return value / Math.pow(10, USDC_DECIMALS);
}

export function checksumAddress(address: string): string {
  return address.toLowerCase();
}

export function shortenAddress(address: string, chars = 4): string {
  if (address.length < 10) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatBlockNumber(block: number | string): string {
  const n = typeof block === 'string' ? parseInt(block, 16) : block;
  return `#${n.toLocaleString()}`;
}

export function hexToNumber(hex: string): number {
  return parseInt(hex, 16);
}

export function numberToHex(n: number): string {
  return `0x${n.toString(16)}`;
}

export function formatPercent(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}
