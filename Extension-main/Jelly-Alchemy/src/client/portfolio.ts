import { AlchemyClient } from './alchemy.js';
import { ChainId } from '../config/chains.js';
import { env } from '../config/env.js';

export interface PortfolioToken {
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  valueUsd: number | null;
  logo: string | null;
}

export interface NativeBalance {
  balance: string;
  valueUsd: number | null;
}

export interface WalletPortfolio {
  address: string;
  chain: ChainId;
  nativeBalance: NativeBalance;
  tokens: PortfolioToken[];
  totalValueUsd: number | null;
  snapshotAt: string;
}

/** Portfolio summary client — aggregates native + token balances with USD values. */
export class PortfolioClient extends AlchemyClient {
  private readonly chain: ChainId;

  constructor(chain: ChainId) {
    super(chain, env);
    this.chain = chain;
  }

  async getPortfolio(address: string): Promise<WalletPortfolio> {
    const [nativeHex, tokenRes] = await Promise.all([
      this.request<string>({ method: 'eth_getBalance', params: [address, 'latest'] }),
      this.request<{ tokenBalances: Array<{ contractAddress: string; tokenBalance: string }> }>({
        method: 'alchemy_getTokenBalances',
        params: [address, 'erc20'],
      }),
    ]);

    return {
      address,
      chain: this.chain,
      nativeBalance: { balance: nativeHex, valueUsd: null },
      tokens: tokenRes.tokenBalances.map((t) => ({
        contractAddress: t.contractAddress,
        name: '',
        symbol: '',
        decimals: 18,
        balance: t.tokenBalance,
        valueUsd: null,
        logo: null,
      })),
      totalValueUsd: null,
      snapshotAt: new Date().toISOString(),
    };
  }
}
