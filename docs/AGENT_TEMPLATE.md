# AI Agent Template

This document describes the pattern for creating AI agent implementations in the Jelly ecosystem.

## Agent Structure

Each AI agent resides in `ai-agents/[agent-name].js`.

### Basic Pattern

```javascript
import { coreFunction } from '../core/some-module.mjs';
import { createLogger } from '../core/logger.mjs';

const log = createLogger('[agent-name]');

export class [AgentName] {
  constructor(opts = {}) {
    this._chains = opts.chains ?? ['solana', 'bnb', 'polygon', 'base'];
    this._profile = opts.profile ?? 'balanced';
    // Initialize other options
  }

  /**
   * Main execution method
   * @param {Object} input - Input data
   * @param {Object} memory - Memory object for persistence
   * @returns {Promise<Object>} Result object
   */
  async execute(input, memory) {
    const t = metrics.startTimer('[agent-name].execute');
    metrics.incMetric('[agent-name].calls');

    try {
      // Implement agent logic here
      const result = await this._process(input);

      // Store in memory if provided
      if (memory) {
        await memory.set('lastResult', result);
        memory.history.push({ type: '[agent-name]', ...result });
      }

      // Audit the execution
      audit.agentCall({ agent: '[agent-name]', input, result });

      log.info('[AgentName].execute', { ok: result.ok, keyMetrics });
      return result;
    } catch (err) {
      metrics.incMetric('[agent-name].errors');
      audit.error({ agent: '[agent-name]', error: err.message });
      throw err;
    } finally {
      t.end({ agent: '[agent-name]' });
    }
  }

  /**
   * Batch execution for multiple inputs
   */
  async batchExecute(inputs, memory) {
    return Promise.all(inputs.map(i => this.execute(i, memory)));
  }

  /**
   * Internal processing method
   */
  async _process(input) {
    // Implement the core logic
    // Use core utilities as needed
    throw new Error('Not implemented');
  }
}

export default [AgentName];
```

## Core Utilities

- **Logger**: `createLogger(agentName)` - Structured logging
- **Metrics**: `incMetric`, `startTimer` - Performance monitoring
- **Audit**: `audit.agentCall`, `audit.error` - Audit logging
- **Memory**: `createMemory()` - Persistent memory
- **Cache**: `getCache()` - Caching utility
- **Circuit Breaker**: `getBreaker()` - Failure protection

## Error Handling

- Use try-catch blocks
- Log errors appropriately
- Return meaningful error messages
- Use circuit breakers for external calls

## Input Validation

Validate all input parameters and handle missing/invalid inputs gracefully.

## Metrics and Audit

- Use `incMetric` to track function calls
- Use `startTimer` to measure performance
- Use `audit.agentCall` to log successful executions
- Use `audit.error` to log errors

## Memory Management

Use the memory object to store persistent data across executions. The memory is automatically managed by the core system.

## Example Agent

See existing agents in `ai-agents/` for examples.