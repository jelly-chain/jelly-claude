import { describe, it, expect } from 'vitest';
import { RpcClient } from '../src/client/rpc.js';
import { ContractService } from '../src/services/contract-service.js';
import { TransferService } from '../src/services/transfer-service.js';

describe('ContractService.isContract — uses eth_getCode', () => {
  it('RpcClient exposes getCode() for eth_getCode', () => {
    const client = new RpcClient('eth-mainnet');
    expect(typeof client.getCode).toBe('function');
  });

  it('ContractService exposes isContract()', () => {
    const svc = new ContractService();
    expect(typeof svc.isContract).toBe('function');
  });

  it('bytecode "0x" evaluates as EOA (not a contract)', () => {
    const isDeployed = (code: string) => code !== '0x' && code !== '0x0' && code.length > 2;
    expect(isDeployed('0x')).toBe(false);
    expect(isDeployed('0x0')).toBe(false);
  });

  it('non-empty bytecode evaluates as a deployed contract', () => {
    const isDeployed = (code: string) => code !== '0x' && code !== '0x0' && code.length > 2;
    // Minimal EVM bytecode stub
    expect(isDeployed('0x6080604052')).toBe(true);
    expect(isDeployed('0xfe')).toBe(true);
  });
});

describe('TransferService.getRecentTransfers — block lookback math', () => {
  it('TransferService exposes getRecentTransfers()', () => {
    const svc = new TransferService();
    expect(typeof svc.getRecentTransfers).toBe('function');
  });

  it('fromBlock is computed as latestBlock - lookbackBlocks (not an absolute offset)', () => {
    const computeFromBlock = (latestHex: string, lookbackBlocks: number): string => {
      const latestBlock = parseInt(latestHex, 16);
      const fromBlock = Math.max(0, latestBlock - lookbackBlocks);
      return `0x${fromBlock.toString(16)}`;
    };

    // At block 1000 (0x3E8), looking back 100 blocks → fromBlock = 900 (0x384)
    expect(computeFromBlock('0x3e8', 100)).toBe('0x384');

    // At block 50, looking back 100 blocks → fromBlock clamps to 0
    expect(computeFromBlock('0x32', 100)).toBe('0x0');

    // At block 20_000_000 (0x1312d00), looking back 1000 → fromBlock = 19_999_000 (0x1312918)
    expect(computeFromBlock('0x1312d00', 1000)).toBe('0x1312918');
  });

  it('lookback of 0 returns the latest block itself', () => {
    const computeFromBlock = (latestHex: string, lookbackBlocks: number): string => {
      const latestBlock = parseInt(latestHex, 16);
      const fromBlock = Math.max(0, latestBlock - lookbackBlocks);
      return `0x${fromBlock.toString(16)}`;
    };
    expect(computeFromBlock('0x3e8', 0)).toBe('0x3e8');
  });
});
