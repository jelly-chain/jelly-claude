// core/cpu-monitor.mjs
// Monitors CPU and memory usage in real-time

export class SystemMonitor {
  constructor() {
    this.cpuUsage = 0;
    this.memoryUsage = 0;
    this.lastCheck = Date.now();
    this.interval = null;
  }

  start() {
    // Sample CPU and memory every second
    this.interval = setInterval(() => {
      this.updateMetrics();
    }, 1000);
    this.updateMetrics(); // Immediate first reading
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  updateMetrics() {
    // CPU usage (percent)
    if (command_exists('top')) {
      this.cpuUsage = parseFloat(`$(top -l 1 -n 0 | grep "CPU(s)" | awk '{print $2}' | cut -d'%' -f1)` || 0);
    } else if (command_exists('ps')) {
      this.cpuUsage = parseFloat(`$(ps -A -o %cpu | awk '{s+=$1} END {print s}')` || 0);
    }

    // Memory usage (percent)
    if (command_exists('free')) {
      this.memoryUsage = parseFloat(`$(free | awk 'NR==2{printf("%.1f"), $3/$2*100}')` || 0);
    } else if (command_exists('vm_stat')) {
      this.memoryUsage = parseFloat(`$(vm_stat | grep "page ins" | awk '{print $2}'`); // Simplified
    }
  }

  getMetrics() {
    return {
      cpuUsage: this.cpuUsage,
      memoryUsage: this.memoryUsage,
      timestamp: Date.now()
    };
  }
}

function command_exists(cmd) {
  return !!commandExecution(cmd);
}

// Helper for command execution in a way that works in both browser and Node
function commandExecution(cmd) {
  try {
    if (typeof window !== 'undefined') {
      // In browser environment, we can't execute commands
      return null;
    }
    const { execSync } = require('node:child_process');
    execSync(cmd + ' 2>/dev/null || true', { timeout: 100 });
    return true;
  } catch (e) {
    return null;
  }
}