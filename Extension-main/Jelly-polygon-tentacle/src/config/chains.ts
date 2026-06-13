/** Polygon PoS chain constants and key contract addresses. */

export interface ChainConstants {
  chainId: number;
  name: string;
  nativeToken: string;
  nativeTokenDecimals: number;
  blockTimeSeconds: number;
  explorer: string;
  contracts: ChainContracts;
}

export interface ChainContracts {
  usdc: string;
  usdcE: string;
  weth: string;
  wmatic: string;
  pol: string;
  quickswapRouter: string;
  uniswapV3Router: string;
  aaveV3Pool: string;
  polymarketCtfExchange: string;
  polymarketNegRiskCtfExchange: string;
  polymarketUmaCtf: string;
}

export const POLYGON_MAINNET: ChainConstants = {
  chainId: 137,
  name: 'Polygon Mainnet',
  nativeToken: 'POL',
  nativeTokenDecimals: 18,
  blockTimeSeconds: 2,
  explorer: 'https://polygonscan.com',
  contracts: {
    usdc: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    usdcE: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    weth: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    wmatic: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    pol: '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6',
    quickswapRouter: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
    uniswapV3Router: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    aaveV3Pool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    polymarketCtfExchange: '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E',
    polymarketNegRiskCtfExchange: '0xC5d563A36AE78145C45a50134d48A1215220f80a',
    polymarketUmaCtf: '0xf05321ea3d24d2b16e4c76bca199da57faf68700',
  },
};

export const POLYGON_AMOY: ChainConstants = {
  chainId: 80002,
  name: 'Polygon Amoy (Testnet)',
  nativeToken: 'POL',
  nativeTokenDecimals: 18,
  blockTimeSeconds: 2,
  explorer: 'https://amoy.polygonscan.com',
  contracts: {
    usdc: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
    usdcE: '',
    weth: '',
    wmatic: '',
    pol: '',
    quickswapRouter: '',
    uniswapV3Router: '',
    aaveV3Pool: '',
    polymarketCtfExchange: '',
    polymarketNegRiskCtfExchange: '',
    polymarketUmaCtf: '',
  },
};

/** Blocks per time unit on Polygon PoS (approx 2s block time). */
export const BLOCKS_PER_MINUTE = 30;
export const BLOCKS_PER_HOUR = 1800;
export const BLOCKS_PER_DAY = 43200;
