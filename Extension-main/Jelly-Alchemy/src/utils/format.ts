/** Formatting helpers: hex → decimal, wei → ETH, address checksum. */

export function hexToDecimal(hex: string): bigint {
  return BigInt(hex);
}

export function weiToEth(wei: bigint): string {
  const eth = Number(wei) / 1e18;
  return eth.toFixed(8);
}

export function weiToToken(wei: bigint, decimals: number): string {
  const divisor = Math.pow(10, decimals);
  return (Number(wei) / divisor).toFixed(6);
}

export function formatAddress(address: string): string {
  return address.toLowerCase().startsWith('0x') ? address.toLowerCase() : `0x${address.toLowerCase()}`;
}

export function shortAddress(address: string): string {
  const addr = formatAddress(address);
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function formatTokenAmount(raw: string, decimals: number): string {
  const bn = BigInt(raw);
  return weiToToken(bn, decimals);
}

export function parseHexBalance(hex: string): string {
  const wei = hexToDecimal(hex);
  return weiToEth(wei);
}
