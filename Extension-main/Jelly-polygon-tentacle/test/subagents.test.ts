import { describe, it, expect } from 'vitest';
import { PolygonFlowAgent } from '../src/subagents/polygon-flow-agent.js';
import { PolymarketSignalAgent } from '../src/subagents/polymarket-signal-agent.js';
import { VolatilityWindowAgent } from '../src/subagents/volatility-window-agent.js';
import { WhaleScoutAgent } from '../src/subagents/whale-scout-agent.js';
import { TokenService } from '../src/services/token-service.js';
import { PolymarketService } from '../src/services/polymarket-service.js';
import { VolatilityService } from '../src/services/volatility-service.js';
import { WalletService } from '../src/services/wallet-service.js';
import { DataApiClient } from '../src/client/data-api.js';
import { RpcClient } from '../src/client/rpc.js';
import { PolymarketClient } from '../src/client/polymarket.js';

function makeTokenService(): TokenService {
  return new TokenService(new DataApiClient({ enabled: false }));
}

function makePolymarketService(): PolymarketService {
  return new PolymarketService(new PolymarketClient({ enabled: false }));
}

function makeVolatilityService(): VolatilityService {
  return new VolatilityService(new DataApiClient({ enabled: false }));
}

function makeWalletService(): WalletService {
  return new WalletService(new DataApiClient({ enabled: false }), new RpcClient({ enabled: false }));
}

describe('PolygonFlowAgent', () => {
  const agent = new PolygonFlowAgent(makeTokenService());

  it('instantiates without throwing', () => {
    expect(agent).toBeDefined();
    expect(agent.name).toBe('PolygonFlowAgent');
  });

  it('getDefinition returns a valid SubagentDefinition', () => {
    const def = agent.getDefinition();
    expect(typeof def.name).toBe('string');
    expect(typeof def.description).toBe('string');
    expect(def.description.length).toBeGreaterThan(10);
    expect(typeof def.version).toBe('string');
    expect(typeof def.inputSchema).toBe('object');
    expect(typeof def.outputSchema).toBe('object');
  });

  it('run() resolves without throwing (no addresses)', async () => {
    const output = await agent.run({ addresses: [] });
    expect(output.agentName).toBe('PolygonFlowAgent');
    expect(typeof output.success).toBe('boolean');
    expect(typeof output.computedAt).toBe('string');
  });

  it('run() data has flowSignals, largeTransferCount, netFlowUsd', async () => {
    const output = await agent.run({});
    const data = output.data as Record<string, unknown>;
    expect(Array.isArray(data['flowSignals'])).toBe(true);
    expect(typeof data['largeTransferCount']).toBe('number');
    expect(typeof data['netFlowUsd']).toBe('number');
  });
});

describe('PolymarketSignalAgent', () => {
  const agent = new PolymarketSignalAgent(makePolymarketService());

  it('instantiates without throwing', () => {
    expect(agent).toBeDefined();
    expect(agent.name).toBe('PolymarketSignalAgent');
  });

  it('getDefinition returns a valid SubagentDefinition', () => {
    const def = agent.getDefinition();
    expect(def.name).toBe('PolymarketSignalAgent');
    expect(def.description.length).toBeGreaterThan(10);
  });

  it('run() resolves and returns structured output', async () => {
    const output = await agent.run({});
    expect(output.agentName).toBe('PolymarketSignalAgent');
    expect(typeof output.success).toBe('boolean');
    const data = output.data as Record<string, unknown>;
    expect(Array.isArray(data['marketSignals'])).toBe(true);
    expect(typeof data['highConvictionCount']).toBe('number');
  });
});

describe('VolatilityWindowAgent', () => {
  const agent = new VolatilityWindowAgent(makeVolatilityService());

  it('instantiates without throwing', () => {
    expect(agent).toBeDefined();
    expect(agent.name).toBe('VolatilityWindowAgent');
  });

  it('getDefinition has correct schema shape', () => {
    const def = agent.getDefinition();
    expect(def.name).toBe('VolatilityWindowAgent');
    expect(typeof def.inputSchema['window']).toBe('object');
    expect(typeof def.outputSchema['report']).toBe('object');
  });

  it('run() resolves with regime and regimeChanged', async () => {
    const output = await agent.run({ window: '1h' });
    expect(output.agentName).toBe('VolatilityWindowAgent');
    const data = output.data as Record<string, unknown>;
    expect(typeof data['regimeChanged']).toBe('boolean');
    expect(data['report']).toBeDefined();
  });
});

describe('WhaleScoutAgent', () => {
  const agent = new WhaleScoutAgent(makeWalletService());

  it('instantiates without throwing', () => {
    expect(agent).toBeDefined();
    expect(agent.name).toBe('WhaleScoutAgent');
  });

  it('getDefinition has expected fields', () => {
    const def = agent.getDefinition();
    expect(def.name).toBe('WhaleScoutAgent');
    expect(def.version).toBe('0.1.0');
    expect(typeof def.inputSchema['addresses']).toBe('object');
  });

  it('run() with no addresses returns empty whaleActivity', async () => {
    const output = await agent.run({ addresses: [] });
    const data = output.data as Record<string, unknown>;
    expect(Array.isArray(data['whaleActivity'])).toBe(true);
    expect(data['whaleActivity']).toHaveLength(0);
    expect(data['totalNetFlowUsd']).toBe(0);
  });
});
