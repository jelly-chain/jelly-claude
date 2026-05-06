import { describe, it, expect } from 'vitest';
import { getToolDefinitions, ToolDefinition } from '../src/tools/index.js';

describe('Jelly-Alchemy Tools', () => {
  const tools: ToolDefinition[] = getToolDefinitions();

  it('returns exactly 19 tools', () => {
    expect(tools).toHaveLength(19);
  });

  it('every tool has a name, description, and input_schema', () => {
    for (const tool of tools) {
      expect(typeof tool.name).toBe('string');
      expect(tool.name.length).toBeGreaterThan(0);
      expect(typeof tool.description).toBe('string');
      expect(tool.description.length).toBeGreaterThan(0);
      expect(tool.input_schema).toBeDefined();
      expect(tool.input_schema.type).toBe('object');
      expect(typeof tool.input_schema.properties).toBe('object');
    }
  });

  it('all tool names are unique', () => {
    const names = tools.map((t) => t.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  const expectedNames = [
    'get-wallet-balance',
    'get-token-balances',
    'get-wallet-transfers',
    'get-wallet-portfolio',
    'get-token-price',
    'get-nfts-by-owner',
    'get-nft-metadata',
    'get-contract-state',
    'get-transaction-details',
    'simulate-transaction',
    'watch-address',
    'get-gas-data',
    'resolve-token',
    'get-block-data',
    'get-logs',
    'trace-transaction',
    'debug-transaction',
    'solana-get-assets-by-owner',
    'solana-get-asset',
  ];

  it('all expected tool names are present', () => {
    const names = tools.map((t) => t.name);
    for (const expected of expectedNames) {
      expect(names).toContain(expected);
    }
  });

  it('each tool input_schema has at least one property', () => {
    for (const tool of tools) {
      const propCount = Object.keys(tool.input_schema.properties).length;
      expect(propCount).toBeGreaterThan(0);
    }
  });
});
