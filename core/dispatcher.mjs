// core/dispatcher.mjs
// Adaptive concurrency management based on system resources

import { SystemMonitor } from './cpu-monitor.mjs';

export class Dispatcher {
  constructor(options = {}) {
    this.options = {
      maxWorkers: options.maxWorkers || 5,
      highCpuThreshold: options.highCpuThreshold || 70,
      highMemThreshold: options.highMemThreshold || 80,
      checkInterval: options.checkInterval || 2000,
      ...options
    };
    this.activeWorkers = 0;
    this.queue = [];
    this.monitor = new SystemMonitor();
    this.isRunning = false;
  }

  start() {
    this.isRunning = true;
    this.monitor.start();
    this.processQueue();
    this.heartbeat();
  }

  stop() {
    this.isRunning = false;
    this.monitor.stop();
  }

  enqueue(task, priority = 0) {
    this.queue.push({ task, priority, timestamp: Date.now() });
    // Sort by priority (higher first) and then by time (older first)
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return a.timestamp - b.timestamp;
    });
  }

  async processQueue() {
    while (this.isRunning) {
      const metrics = this.monitor.getMetrics();
      const canAddWorker = this.activeWorkers < this.options.maxWorkers &&
                          metrics.cpuUsage < this.options.highCpuThreshold &&
                          metrics.memoryUsage < this.options.highMemThreshold;

      if (canAddWorker && this.queue.length > 0) {
        const nextTask = this.queue.shift();
        this.activeWorkers++;
        try {
          await nextTask.task();
        } catch (error) {
          console.error('Worker error:', error);
        } finally {
          this.activeWorkers--;
        }
      }

      await new Promise(resolve => setTimeout(resolve, this.options.checkInterval));
    }
  }

  heartbeat() {
    // Additional monitoring and logging
    if (this.isRunning) {
      const metrics = this.monitor.getMetrics();
      if (metrics.cpuUsage > this.options.highCpuThreshold || metrics.memoryUsage > this.options.highMemThreshold) {
        console.warn(`High resource usage detected: CPU ${metrics.cpuUsage}%, Memory ${metrics.memoryUsage}%`);
      }
      setTimeout(() => this.heartbeat(), 5000);
    }
  }

  static async runWithDispatch(tasks, options = {}) {
    const dispatcher = new Dispatcher(options);
    dispatcher.start();
    try {
      for (const task of tasks) {
        await new Promise(resolve => {
          const check = () => {
            const metrics = dispatcher.monitor.getMetrics();
            if (dispatcher.activeWorkers < dispatcher.options.maxWorkers &&
                metrics.cpuUsage < dispatcher.options.highCpuThreshold &&
                metrics.memoryUsage < dispatcher.options.highMemThreshold) {
              resolve();
            } else {
              setTimeout(check, 100);
            }
          };
          check();
        });
        dispatcher.enqueue(task);
      }
    } finally {
      dispatcher.stop();
    }
  }
}