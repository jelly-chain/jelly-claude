import { describe, it, expect } from 'vitest';
import { getToolDefinitions, ToolDefinition, ToolName } from '../src/tools/index.js';

const EXPECTED_TOOLS: ToolName[] = [
  'poly-get-wallet-overview',
  'poly-get-token-flows',
  'poly-get-market-signals',
  'poly-get-polymarket-markets',
  'poly-get-polymarket-orderflow',
  'poly-get-polymarket-resolutions',
  'poly-get-liquidity-events',
  'poly-get-volatility-window',
  'poly-watch-address',
  'poly-get-block-snapshots',
  'poly-simulate-transaction',
];

describe('getToolDefinitions', () => {
  it('returns exactly 11 tools', () => {
    const defs = getToolDefinitions();
    expect(defs).toHaveLength(11);
  });

  it('contains all required tool names', () => {
    const defs = getToolDefinitions();
    const names = defs.map((d) => d.name);
    for (const expected of EXPECTED_TOOLS) {
      expect(names).toContain(expected);
    }
  });

  it('each tool has a non-empty description', () => {
    for (const def of getToolDefinitions()) {
      expect(def.description.length).toBeGreaterThan(10);
    }
  });

  it('each tool has an object input_schema', () => {
    for (const def of getToolDefinitions()) {
      expect(def.input_schema.type).toBe('object');
      expect(typeof def.input_schema.properties).toBe('object');
    }
  });

  it('all tools have at least one property in input_schema', () => {
    const noPropsAllowed: ToolName[] = [
      'poly-get-market-signals',
      'poly-get-volatility-window',
      'poly-get-polymarket-markets',
      'poly-get-polymarket-resolutions',
      'poly-get-block-snapshots',
    ];
    for (const def of getToolDefinitions()) {
      if (!noPropsAllowed.includes(def.name)) {
        expect(Object.keys(def.input_schema.properties).length).toBeGreaterThan(0);
      }
    }
  });

  it('required fields are a subset of properties', () => {
    for (const def of getToolDefinitions()) {
      const required = def.input_schema.required ?? [];
      for (const field of required) {
        expect(def.input_schema.properties).toHaveProperty(field);
      }
    }
  });

  it('poly-get-wallet-overview requires address', () => {
    const def = getToolDefinitions().find((d) => d.name === 'poly-get-wallet-overview');
    expect(def?.input_schema.required).toContain('address');
  });

  it('poly-get-polymarket-orderflow requires conditionId', () => {
    const def = getToolDefinitions().find((d) => d.name === 'poly-get-polymarket-orderflow');
    expect(def?.input_schema.required).toContain('conditionId');
  });

  it('poly-watch-address requires address and callbackUrl', () => {
    const def = getToolDefinitions().find((d) => d.name === 'poly-watch-address');
    expect(def?.input_schema.required).toContain('address');
    expect(def?.input_schema.required).toContain('callbackUrl');
  });

  it('poly-simulate-transaction requires from, to, data', () => {
    const def = getToolDefinitions().find((d) => d.name === 'poly-simulate-transaction');
    expect(def?.input_schema.required).toContain('from');
    expect(def?.input_schema.required).toContain('to');
    expect(def?.input_schema.required).toContain('data');
  });

  it('returns ToolDefinition[] not object[]', () => {
    const defs: ToolDefinition[] = getToolDefinitions();
    expect(Array.isArray(defs)).toBe(true);
  });
});
