import { AlchemyClient } from './alchemy.js';
import { ChainId } from '../config/chains.js';
import { env } from '../config/env.js';

export interface SimulationTx {
  from: string;
  to: string;
  value?: string;
  data?: string;
  gas?: string;
  gasPrice?: string;
}

export interface AssetChange {
  assetType: 'NATIVE' | 'ERC20' | 'ERC721' | 'ERC1155';
  changeType: 'APPROVE' | 'TRANSFER';
  from: string;
  to: string;
  amount: string | null;
  tokenId: string | null;
  symbol: string | null;
  decimals: number | null;
  contractAddress: string | null;
  name: string | null;
}

export interface SimulationResult {
  changes: AssetChange[];
  gasUsed: string;
  error: string | null;
}

export interface SimulationResponse {
  simulationResults: SimulationResult[];
}

/** Alchemy simulation client — `alchemy_simulateAssetChanges`. */
export class SimulationClient extends AlchemyClient {
  constructor(chain: ChainId) {
    super(chain, env);
  }

  async simulateAssetChanges(tx: SimulationTx): Promise<SimulationResult> {
    const res = await this.request<SimulationResponse>({
      method: 'alchemy_simulateAssetChanges',
      params: [tx],
    });
    const first = res.simulationResults[0];
    if (!first) throw new Error('No simulation result returned');
    return first;
  }

  async simulateBatch(txs: SimulationTx[]): Promise<SimulationResult[]> {
    const res = await this.request<SimulationResponse>({
      method: 'alchemy_simulateAssetChangesBundle',
      params: [txs],
    });
    return res.simulationResults;
  }
}
