export async function bootstrapMVP() {
  const { createMemory } = await import('../memory/index.js');
  const { createPlanner } = await import('../planner/index.js');
  const { EchoAgent } = await import('../ai-agents/echo.js');
  const memory = createMemory();
  const planner = createPlanner(memory);
  const agent = new EchoAgent();
  const task = { id: 'task-1', input: 'Hello Buddy MVP' };
  await memory.set('lastInput', task.input);
  planner.enqueue(task);
  const next = planner.dequeue?.();
  let result = null;
  if (next) {
    result = await agent.execute(next.input, memory);
    await memory.set('lastResult', result);
  }
  const snapshot = {
    lastInput: await memory.get?.('lastInput'),
    lastResult: result,
    memoryEntries: await (async () => {
      const list = await memory.list?.();
      return list ?? [];
    })()
  };
  return { snapshot };
}
export default { bootstrapMVP };
