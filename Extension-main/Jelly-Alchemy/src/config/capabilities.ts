import { ChainId } from './chains.js';

export interface ChainCapabilities {
  supportsNFT: boolean;
  supportsSimulation: boolean;
  supportsTrace: boolean;
  supportsWebhooks: boolean;
  supportsTokenPrices: boolean;
  supportsPortfolio: boolean;
  supportsPolymarket: boolean;
}

const CAPABILITIES: Record<ChainId, ChainCapabilities> = {
  'eth-mainnet': {
    supportsNFT: true,
    supportsSimulation: true,
    supportsTrace: true,
    supportsWebhooks: true,
    supportsTokenPrices: true,
    supportsPortfolio: true,
    supportsPolymarket: false,
  },
  'bnb-mainnet': {
    supportsNFT: true,
    supportsSimulation: true,
    supportsTrace: true,
    supportsWebhooks: true,
    supportsTokenPrices: true,
    supportsPortfolio: true,
    supportsPolymarket: false,
  },
  'base-mainnet': {
    supportsNFT: true,
    supportsSimulation: true,
    supportsTrace: false,
    supportsWebhooks: true,
    supportsTokenPrices: true,
    supportsPortfolio: true,
    supportsPolymarket: false,
  },
  'arb-mainnet': {
    supportsNFT: true,
    supportsSimulation: true,
    supportsTrace: true,
    supportsWebhooks: true,
    supportsTokenPrices: true,
    supportsPortfolio: true,
    supportsPolymarket: false,
  },
  'polygon-mainnet': {
    supportsNFT: true,
    supportsSimulation: true,
    supportsTrace: true,
    supportsWebhooks: true,
    supportsTokenPrices: true,
    supportsPortfolio: true,
    supportsPolymarket: true,
  },
  'opbnb-mainnet': {
    supportsNFT: false,
    supportsSimulation: true,
    supportsTrace: false,
    supportsWebhooks: true,
    supportsTokenPrices: false,
    supportsPortfolio: false,
    supportsPolymarket: false,
  },
  'solana-mainnet': {
    supportsNFT: true,
    supportsSimulation: false,
    supportsTrace: false,
    supportsWebhooks: false,
    supportsTokenPrices: true,
    supportsPortfolio: true,
    supportsPolymarket: false,
  },
};

export function getCapabilities(chain: ChainId): ChainCapabilities {
  return CAPABILITIES[chain];
}

export function supports(chain: ChainId, feature: keyof ChainCapabilities): boolean {
  return CAPABILITIES[chain][feature];
}
