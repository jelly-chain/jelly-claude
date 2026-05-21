import { getCache } from '../../../core/cache.mjs';
import { createMemory } from '../../../memory/index.js';

const cache = getCache('agent-health', { defaultTtlMs: 60_000 });
const memory = createMemory();

export async function check(args = {}) {
  const agents = await memory.get('agents') || [];
  const health = {
    agents: agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      status: agent.status || 'unknown',
      uptime: agent.uptime || 0,
      lastSeen: agent.lastSeen,
      cpuUsage: agent.cpuUsage || 0,
      memoryUsage: agent.memoryUsage || 0,
    })),
    timestamp: Date.now(),
  };
  await memory.set('agentHealth', health);
  return { ok: true, health };
}

export async function status(args = {}) {
  const health = await memory.get('agentHealth') || {};
  return { ok: true, ...health };
}

export async function alert(args = {}) {
  const health = await memory.get('agentHealth');
  if (!health) return { ok: false, error: 'No health data available' };
  const alerts = [];
  for (const agent of health.agents) {
    if (agent.cpuUsage > 0.8) {
      alerts.push({ agent: agent.id, issue: 'high_cpu', value: agent.cpuUsage });
    }
    if (agent.memoryUsage > 0.8) {
      alerts.push({ agent: agent.id, issue: 'high_memory', value: agent.memoryUsage });
    }
  }
  return { ok: true, alerts };
}