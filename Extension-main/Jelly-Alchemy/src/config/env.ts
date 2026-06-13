/** Reads and validates all Alchemy environment variables. No `as any`. */

export interface AlchemyEnv {
  apiKey: string;
  ethMainnetUrl: string;
  bnbMainnetUrl: string;
  baseMainnetUrl: string;
  arbMainnetUrl: string;
  polygonMainnetUrl: string;
  opBnbMainnetUrl: string;
  solanaMainnetUrl: string;
}

function buildChainUrl(chain: string, apiKey: string): string {
  return `https://${chain}.g.alchemy.com/v2/${apiKey}`;
}

export function loadEnv(): AlchemyEnv {
  const apiKey = process.env['ALCHEMY_API_KEY'] ?? '';

  return {
    apiKey,
    ethMainnetUrl:
      process.env['ALCHEMY_ETH_MAINNET_URL'] ?? buildChainUrl('eth-mainnet', apiKey),
    bnbMainnetUrl:
      process.env['ALCHEMY_BNB_MAINNET_URL'] ?? buildChainUrl('bnb-mainnet', apiKey),
    baseMainnetUrl:
      process.env['ALCHEMY_BASE_MAINNET_URL'] ?? buildChainUrl('base-mainnet', apiKey),
    arbMainnetUrl:
      process.env['ALCHEMY_ARB_MAINNET_URL'] ?? buildChainUrl('arb-mainnet', apiKey),
    polygonMainnetUrl:
      process.env['ALCHEMY_POLYGON_MAINNET_URL'] ?? buildChainUrl('polygon-mainnet', apiKey),
    opBnbMainnetUrl:
      process.env['ALCHEMY_OPBNB_MAINNET_URL'] ?? buildChainUrl('opbnb-mainnet', apiKey),
    solanaMainnetUrl:
      process.env['ALCHEMY_SOLANA_MAINNET_URL'] ?? buildChainUrl('solana-mainnet', apiKey),
  };
}

export const env: AlchemyEnv = loadEnv();
