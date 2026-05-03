export class TaskQueue {
  constructor(opts = {}) {
    this._items = [];
    this._concurrency = opts.concurrency ?? 1;
    this._running = 0;
    this._processed = 0;
    this._failed = 0;
    this._dlq = [];
    this._maxRetries = opts.maxRetries ?? 3;
    this._paused = false;
  }

  enqueue(task, priority = 0) {
    const item = {
      id:       task.id ?? `task-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      task,
      priority,
      retries:  0,
      enqueuedAt: Date.now(),
    };
    this._items.push(item);
    this._items.sort((a, b) => b.priority - a.priority);
    return item.id;
  }

  dequeue() {
    return this._items.shift() ?? null;
  }

  peek() {
    return this._items[0] ?? null;
  }

  async drain(executor) {
    const results = [];
    while (this._items.length > 0) {
      const item = this.dequeue();
      try {
        const result = await executor(item.task);
        this._processed++;
        results.push({ ok: true, id: item.id, result });
      } catch (err) {
        item.retries++;
        if (item.retries < this._maxRetries) {
          this._items.unshift(item);
        } else {
          this._failed++;
          this._dlq.push({ ...item, error: err.message, failedAt: Date.now() });
          results.push({ ok: false, id: item.id, error: err.message });
        }
      }
    }
    return results;
  }

  pause()  { this._paused = true; }
  resume() { this._paused = false; }

  deadLetterQueue() { return [...this._dlq]; }
  clearDLQ()       { this._dlq = []; }

  stats() {
    return {
      pending:   this._items.length,
      processed: this._processed,
      failed:    this._failed,
      dlqSize:   this._dlq.length,
      paused:    this._paused,
    };
  }

  clear() { this._items = []; }
}

export class RetryQueue {
  constructor(fn, opts = {}) {
    this._fn       = fn;
    this._retries  = opts.retries  ?? 3;
    this._baseMs   = opts.baseMs   ?? 500;
    this._retryOn  = opts.retryOn  ?? [429, 500, 502, 503, 504];
    this._jitter   = opts.jitter   ?? true;
  }

  async run(...args) {
    let lastErr;
    for (let attempt = 0; attempt <= this._retries; attempt++) {
      try {
        return await this._fn(...args);
      } catch (err) {
        lastErr = err;
        const status = err?.status ?? err?.statusCode ?? err?.code;
        const isRetryable = this._retryOn.includes(status);
        if (attempt === this._retries || !isRetryable) break;
        const delay = this._baseMs * 2 ** attempt + (this._jitter ? Math.random() * 200 : 0);
        await new Promise(r => setTimeout(r, delay));
      }
    }
    throw lastErr;
  }
}

export default { TaskQueue, RetryQueue };
