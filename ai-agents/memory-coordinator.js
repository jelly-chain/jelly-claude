import { metrics }      from '../core/metrics.mjs';
import { audit }        from '../core/audit.mjs';
import { createLogger } from '../core/logger.mjs';

const log = createLogger('memory-coordinator');

export class MemoryCoordinatorAgent {
  constructor(opts = {}) {
    this._ttl = opts.ttl ?? 3600000;
    this._cache = new Map();
  }

  async execute(input, memory) {
    const t = metrics.startTimer('memory-coordinator.execute');
    metrics.incMetric('memory_coordinator.calls');

    const { action, key, value, maxEntries = 100 } = input;

    switch (action) {
      case 'compress':
        return this.compressContext(input.text, memory);
      case 'checkpoint':
        return this.checkpoint(memory);
      case 'restore':
        return this.restore(input.checkpointId, memory);
      case 'cache':
        return this.cache(key, value);
      case 'retrieve':
        return this.retrieve(key);
      case 'clear':
        return this.clear();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  async compressContext(text, memory) {
    const summary = text.length > 1000 ? `${text.slice(0, 200)}...[truncated]` : text;
    const result = { summary, originalLength: text.length, compressedLength: summary.length };

    if (memory) {
      await memory.set('lastCompression', result);
    }

    log.info('MemoryCoordinatorAgent: context compressed', { ratio: result.compressedLength / result.originalLength });
    return result;
  }

  async checkpoint(memory) {
    const checkpointId = `ckpt_${Date.now()}`;
    const state = {
      timestamp: Date.now(),
      history: memory?.history || [],
      lastPrediction: memory?.lastPrediction,
      lastTrade: memory?.lastTrade,
    };

    this._cache.set(checkpointId, state);
    audit.write({ type: 'memory_checkpoint', checkpointId });

    return { checkpointId, stored: true };
  }

  async restore(checkpointId, memory) {
    const state = this._cache.get(checkpointId);
    if (!state) {
      throw new Error(`Checkpoint ${checkpointId} not found`);
    }

    if (memory) {
      memory.history = state.history;
      await memory.set('lastPrediction', state.lastPrediction);
      await memory.set('lastTrade', state.lastTrade);
    }

    log.info('MemoryCoordinatorAgent: checkpoint restored', { checkpointId });
    return { restored: true, checkpointId };
  }

  cache(key, value) {
    this._cache.set(key, { value, timestamp: Date.now() });
    return { cached: true, key };
  }

  retrieve(key) {
    const entry = this._cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this._ttl) {
      this._cache.delete(key);
      return null;
    }

    return entry.value;
  }

  clear() {
    const count = this._cache.size;
    this._cache.clear();
    return { cleared: count };
  }
}

export default MemoryCoordinatorAgent;