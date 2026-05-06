import { PortfolioClient, WalletPortfolio } from '../client/portfolio.js';
import { ChainId, EVM_CHAINS } from '../config/chains.js';

export interface MultiChainPortfolio {
  address: string;
  chains: WalletPortfolio[];
  totalTokenCount: number;
  snapshotAt: string;
}

export class PortfolioService {
  async getPortfolio(address: string, chain: ChainId): Promise<WalletPortfolio> {
    const client = new PortfolioClient(chain);
    return client.getPortfolio(address);
  }

  async getMultiChainPortfolio(
    address: string,
    chains: ChainId[] = EVM_CHAINS,
  ): Promise<MultiChainPortfolio> {
    const portfolios = await Promise.all(
      chains.map((chain) => this.getPortfolio(address, chain)),
    );

    const totalTokenCount = portfolios.reduce((sum, p) => sum + p.tokens.length, 0);

    return {
      address,
      chains: portfolios,
      totalTokenCount,
      snapshotAt: new Date().toISOString(),
    };
  }
}
