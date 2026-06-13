/** Chain registry for all Jelly-Alchemy supported chains. */

export type ChainId =
  | 'eth-mainnet'
  | 'bnb-mainnet'
  | 'base-mainnet'
  | 'arb-mainnet'
  | 'polygon-mainnet'
  | 'opbnb-mainnet'
  | 'solana-mainnet';

export interface ChainDescriptor {
  id: ChainId;
  name: string;
  evmChainId: number | null;
  nativeToken: string;
  nativeTokenDecimals: number;
  rpcUrlKey: string;
  blockExplorer: string;
}

export const CHAINS: Record<ChainId, ChainDescriptor> = {
  'eth-mainnet': {
    id: 'eth-mainnet',
    name: 'Ethereum',
    evmChainId: 1,
    nativeToken: 'ETH',
    nativeTokenDecimals: 18,
    rpcUrlKey: 'ethMainnetUrl',
    blockExplorer: 'https://etherscan.io',
  },
  'bnb-mainnet': {
    id: 'bnb-mainnet',
    name: 'BNB Chain',
    evmChainId: 56,
    nativeToken: 'BNB',
    nativeTokenDecimals: 18,
    rpcUrlKey: 'bnbMainnetUrl',
    blockExplorer: 'https://bscscan.com',
  },
  'base-mainnet': {
    id: 'base-mainnet',
    name: 'Base',
    evmChainId: 8453,
    nativeToken: 'ETH',
    nativeTokenDecimals: 18,
    rpcUrlKey: 'baseMainnetUrl',
    blockExplorer: 'https://basescan.org',
  },
  'arb-mainnet': {
    id: 'arb-mainnet',
    name: 'Arbitrum One',
    evmChainId: 42161,
    nativeToken: 'ETH',
    nativeTokenDecimals: 18,
    rpcUrlKey: 'arbMainnetUrl',
    blockExplorer: 'https://arbiscan.io',
  },
  'polygon-mainnet': {
    id: 'polygon-mainnet',
    name: 'Polygon PoS',
    evmChainId: 137,
    nativeToken: 'POL',
    nativeTokenDecimals: 18,
    rpcUrlKey: 'polygonMainnetUrl',
    blockExplorer: 'https://polygonscan.com',
  },
  'opbnb-mainnet': {
    id: 'opbnb-mainnet',
    name: 'opBNB',
    evmChainId: 204,
    nativeToken: 'BNB',
    nativeTokenDecimals: 18,
    rpcUrlKey: 'opBnbMainnetUrl',
    blockExplorer: 'https://opbnbscan.com',
  },
  'solana-mainnet': {
    id: 'solana-mainnet',
    name: 'Solana',
    evmChainId: null,
    nativeToken: 'SOL',
    nativeTokenDecimals: 9,
    rpcUrlKey: 'solanaMainnetUrl',
    blockExplorer: 'https://solscan.io',
  },
};

export const EVM_CHAINS: ChainId[] = [
  'eth-mainnet',
  'bnb-mainnet',
  'base-mainnet',
  'arb-mainnet',
  'polygon-mainnet',
  'opbnb-mainnet',
];

export const SOLANA_CHAINS: ChainId[] = ['solana-mainnet'];

export function getChain(id: ChainId): ChainDescriptor {
  return CHAINS[id];
}

export function isEvmChain(id: ChainId): boolean {
  return EVM_CHAINS.includes(id);
}
