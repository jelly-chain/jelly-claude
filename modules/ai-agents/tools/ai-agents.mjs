import { createMemory } from '../../../memory/index.js';

const memory = createMemory();

export async function create(args = {}) {
  if (!args.name) return { ok: false, error: 'Missing --name' };
  const agent = {
    id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: args.name,
    type: args.type || 'generic',
    status: 'created',
    createdAt: Date.now(),
    config: args.config || {},
  };
  const agents = await memory.get('agents') || [];
  agents.push(agent);
  await memory.set('agents', agents);
  return { ok: true, agent };
}

export async function list(args = {}) {
  const agents = await memory.get('agents') || [];
  return { ok: true, count: agents.length, agents };
}

export async function get(args = {}) {
  if (!args.id) return { ok: false, error: 'Missing --id' };
  const agents = await memory.get('agents') || [];
  const agent = agents.find(a => a.id === args.id);
  if (!agent) return { ok: false, error: 'Agent not found' };
  return { ok: true, agent };
}

export async function update(args = {}) {
  if (!args.id) return { ok: false, error: 'Missing --id' };
  const agents = await memory.get('agents') || [];
  const index = agents.findIndex(a => a.id === args.id);
  if (index === -1) return { ok: false, error: 'Agent not found' };
  agents[index] = { ...agents[index], ...args.updates };
  await memory.set('agents', agents);
  return { ok: true, agent: agents[index] };
}

export async function deleteAgent(args = {}) {
  if (!args.id) return { ok: false, error: 'Missing --id' };
  const agents = await memory.get('agents') || [];
  const initialLength = agents.length;
  agents = agents.filter(a => a.id !== args.id);
  if (agents.length === initialLength) return { ok: false, error: 'Agent not found' };
  await memory.set('agents', agents);
  return { ok: true, message: 'Agent deleted' };
}

export async function execute(args = {}) {
  if (!args.id) return { ok: false, error: 'Missing --id' };
  const agents = await memory.get('agents') || [];
  const agent = agents.find(a => a.id === args.id);
  if (!agent) return { ok: false, error: 'Agent not found' };
  // Simulate execution
  return { ok: true, agent, result: { message: `Agent ${agent.name} executed successfully` } };
}