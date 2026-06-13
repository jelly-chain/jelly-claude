/** Typed environment configuration — all reads use bracket notation. */

export interface PolygonTentacleEnv {
  alchemyApiKey: string;
  polygonMainnetUrl: string;
  polygonAmoyUrl: string;
  polymarketApiKey: string;
  webhookSecret: string;
  cacheTtlSeconds: number;
  debug: boolean;
}

function parseInt10(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

function buildPolygonUrl(apiKey: string): string {
  if (!apiKey) return '';
  return `https://polygon-mainnet.g.alchemy.com/v2/${apiKey}`;
}

export function loadEnv(): PolygonTentacleEnv {
  const apiKey = process.env['ALCHEMY_API_KEY'] ?? '';
  return {
    alchemyApiKey: apiKey,
    polygonMainnetUrl:
      process.env['ALCHEMY_POLYGON_MAINNET_URL'] ?? buildPolygonUrl(apiKey),
    polygonAmoyUrl: process.env['ALCHEMY_POLYGON_AMOY_URL'] ?? '',
    polymarketApiKey: process.env['POLYMARKET_API_KEY'] ?? '',
    webhookSecret: process.env['POLYGON_WEBHOOK_SECRET'] ?? '',
    cacheTtlSeconds: parseInt10(process.env['CACHE_TTL_SECONDS'], 60),
    debug: process.env['SDK_DEBUG'] === 'true',
  };
}

export const env: PolygonTentacleEnv = loadEnv();
