import { getCache } from '../../../core/cache.mjs';

const cache = getCache('dashboard', { defaultTtlMs: 60_000 });

export async function overview(args = {}) {
  // Mock dashboard overview
  return {
    ok: true,
    metrics: {
      agentCount: 12,
      activeModules: 8,
      systemHealth: 'good',
      cpuUsage: 0.4,
      memoryUsage: 0.6,
    },
    recentActivity: [
      { type: 'trade', message: 'Buy 1 ETH on Uniswap', timestamp: Date.now() - 3600000 },
      { type: 'alert', message: 'Price alert triggered', timestamp: Date.now() - 7200000 },
    ],
  };
}

export async function metrics(args = {}) {
  // Mock metrics data
  return {
    ok: true,
    cpu: { usage: 0.4, history: [0.3, 0.45, 0.38, 0.42] },
    memory: { usage: 0.6, history: [0.55, 0.62, 0.58, 0.6] },
    network: { in: 1024, out: 2048 },
  };
}

export async function agents(args = {}) {
  // Mock agent list
  return {
    ok: true,
    agents: [
      { id: 'agent1', name: 'Trader Bot', status: 'active', lastSeen: Date.now() },
      { id: 'agent2', name: 'Scanner', status: 'idle', lastSeen: Date.now() - 3600000 },
    ],
  };
}

export async function modules(args = {}) {
  // Mock module status
  return {
    ok: true,
    modules: [
      { name: 'wallet', status: 'active', version: '1.0.0' },
      { name: 'defi', status: 'active', version: '1.0.0' },
      { name: 'bridge', status: 'active', version: '1.0.0' },
    ],
  };
}