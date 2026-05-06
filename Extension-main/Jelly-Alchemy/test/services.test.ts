import { describe, it, expect } from 'vitest';
import { WalletService } from '../src/services/wallet-service.js';
import { TokenService } from '../src/services/token-service.js';
import { NftService } from '../src/services/nft-service.js';
import { TransferService } from '../src/services/transfer-service.js';
import { PortfolioService } from '../src/services/portfolio-service.js';
import { PriceService } from '../src/services/price-service.js';
import { ContractService } from '../src/services/contract-service.js';
import { TracingService } from '../src/services/tracing-service.js';
import { WebhookService } from '../src/services/webhook-service.js';

describe('Jelly-Alchemy Services — instantiation', () => {
  it('WalletService instantiates', () => {
    const svc = new WalletService();
    expect(svc).toBeDefined();
    expect(typeof svc.getSummary).toBe('function');
    expect(typeof svc.getBalanceAcrossChains).toBe('function');
  });

  it('TokenService instantiates', () => {
    const svc = new TokenService();
    expect(svc).toBeDefined();
    expect(typeof svc.getBalances).toBe('function');
    expect(typeof svc.getAllBalances).toBe('function');
  });

  it('NftService instantiates', () => {
    const svc = new NftService();
    expect(svc).toBeDefined();
    expect(typeof svc.getNftsForOwner).toBe('function');
    expect(typeof svc.getAllNfts).toBe('function');
    expect(typeof svc.getNftsByCollection).toBe('function');
  });

  it('TransferService instantiates', () => {
    const svc = new TransferService();
    expect(svc).toBeDefined();
    expect(typeof svc.getActivity).toBe('function');
    expect(typeof svc.getRecentTransfers).toBe('function');
  });

  it('PortfolioService instantiates', () => {
    const svc = new PortfolioService();
    expect(svc).toBeDefined();
    expect(typeof svc.getPortfolio).toBe('function');
    expect(typeof svc.getMultiChainPortfolio).toBe('function');
  });

  it('PriceService instantiates', () => {
    const svc = new PriceService();
    expect(svc).toBeDefined();
    expect(typeof svc.getPricesBySymbol).toBe('function');
    expect(typeof svc.getPriceByAddress).toBe('function');
  });

  it('ContractService instantiates', () => {
    const svc = new ContractService();
    expect(svc).toBeDefined();
    expect(typeof svc.readState).toBe('function');
    expect(typeof svc.getTokenInfo).toBe('function');
    expect(typeof svc.isContract).toBe('function');
  });

  it('TracingService instantiates', () => {
    const svc = new TracingService();
    expect(svc).toBeDefined();
    expect(typeof svc.traceTransaction).toBe('function');
  });

  it('WebhookService instantiates', () => {
    const svc = new WebhookService();
    expect(svc).toBeDefined();
    expect(typeof svc.watchAddresses).toBe('function');
    expect(typeof svc.listAll).toBe('function');
    expect(typeof svc.remove).toBe('function');
  });
});
