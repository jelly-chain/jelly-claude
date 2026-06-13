/** Subagent registry — exports SubagentDefinition and all subagent classes. */

export interface SubagentDefinition {
  name: string;
  description: string;
  version: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
}

export interface AgentInput {
  blockNumber?: number;
  addresses?: string[];
  conditionIds?: string[];
  window?: string;
  options?: Record<string, unknown>;
}

export interface AgentOutput {
  agentName: string;
  success: boolean;
  data: unknown;
  error?: string;
  computedAt: string;
}

export { PolygonFlowAgent } from './polygon-flow-agent.js';
export { PolymarketSignalAgent } from './polymarket-signal-agent.js';
export { VolatilityWindowAgent } from './volatility-window-agent.js';
export { WhaleScoutAgent } from './whale-scout-agent.js';
