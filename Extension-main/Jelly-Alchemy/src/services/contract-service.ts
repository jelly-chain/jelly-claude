import { RpcClient } from '../client/rpc.js';
import { DataApiClient } from '../client/data-api.js';
import { ChainId } from '../config/chains.js';

export interface ContractState {
  contractAddress: string;
  chain: ChainId;
  result: string;
  block: string;
}

export interface ContractTokenInfo {
  address: string;
  name: string | null;
  symbol: string | null;
  decimals: number | null;
  logo: string | null;
}

export class ContractService {
  async readState(
    contractAddress: string,
    calldata: string,
    chain: ChainId,
    block = 'latest',
  ): Promise<ContractState> {
    const client = new RpcClient(chain);
    const result = await client.call(contractAddress, calldata, block);
    return { contractAddress, chain, result, block };
  }

  async getTokenInfo(contractAddress: string, chain: ChainId): Promise<ContractTokenInfo> {
    const client = new DataApiClient(chain);
    const meta = await client.getTokenMetadata(contractAddress);
    return {
      address: contractAddress,
      name: meta.name,
      symbol: meta.symbol,
      decimals: meta.decimals,
      logo: meta.logo,
    };
  }

  async isContract(address: string, chain: ChainId): Promise<boolean> {
    const client = new RpcClient(chain);
    const code = await client.getCode(address, 'latest');
    return code !== '0x' && code !== '0x0' && code.length > 2;
  }
}
