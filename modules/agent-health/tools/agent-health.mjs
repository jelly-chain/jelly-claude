import { SystemMonitor } from '../../../core/cpu-monitor.mjs';
import { createLogger } from '../../../core/logger.mjs';
import { getCache } from '../../../core/cache.mjs';
import { createMemory } from '../../../memory/index.js';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';

const log = createLogger('agent-health');
const cache = getCache('agent-health', { defaultTtlMs: 30_000 });
const memory = createMemory();
const JELLY_HOME = `${homedir()}/.jelly-claude`;

class AgentHealthMonitor {
  constructor() {
    this.monitor = new SystemMonitor();
    this.agentStatuses = {};
    this.lastCheck = 0;
    this.checkInterval = null;
    this.WARN_THRESHOLD = 0.8; // 80% CPU/memory warning
    this.ALERT_THRESHOLD = 0.9; // 90% CPU/memory alert
  }

  async checkSystem() {
    const now = Date.now();
    const metrics = this.monitor.getMetrics();

    // Check disk usage
    const diskUsage = await this.checkDiskUsage();

    // Check wallet files
    const solanaWalletExists = existsSync(`${JELLY_HOME}/wallets/solana.json`);
    const evmWalletExists = existsSync(`${JELLY_HOME}/wallets/evm.json`);

    // Check API keys
    const hasAiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENROUTER_API_KEY;

    return {
      ok: true,
      timestamp: now,
      system: {
        cpuUsage: metrics.cpuUsage,
        memoryUsage: metrics.memoryUsage,
        diskUsage: diskUsage,
        lastChecked: this.lastCheck,
        upTime: now - this.lastCheck,
      },
      wallets: {
        solana: solanaWalletExists,
        evm: evmWalletExists,
      },
      api: {
        hasAiKey,
        // Check other API availability if needed
      },
      agents: await this.checkAgents(),
    };
  }

  async checkAgents() {
    // Check status of key agents
    const agents = [
      { name: 'predictor', path: '../../../ai-agents/predictor.js' },
      { name: 'scanner', path: '../../../ai-agents/scanner.js' },
      { name: 'portfolio', path: '../../../ai-agents/portfolio.js' },
      // Add more agents as needed
    ];

    const results = [];

    for (const agent of agents) {
      try {
        // Try to import and instantiate the agent
        let AgentClass;
        try {
          const agentModule = await import(agent.path);
          AgentClass = agentModule.default || agentModule;
        } catch (err) {
          // Agent file might not exist or have errors
          results.push({ name: agent.name, status: 'error', error: err.message });
          continue;
        }

        const agentInstance = new AgentClass();
        // Simple health check: can the agent execute a basic operation?
        // We'll just check if the class can be instantiated and has expected methods
        if (agentInstance.execute && typeof agentInstance.execute === 'function') {
          results.push({ name: agent.name, status: 'healthy', checkedAt: Date.now() });
        } else {
          results.push({ name: agent.name, status: 'unhealthy', error: 'Missing execute method' });
        }
      } catch (err) {
        results.push({ name: agent.name, status: 'error', error: err.message });
      }
    }

    return results;
  }

  async checkDiskUsage() {
    // Estimate disk usage percentage
    // This is a simplified check; could be enhanced with actual disk stats
    try {
      const { execSync } = require('node:child_process');
      if (process.platform === 'darwin') {
        const output = execSync('df -h / | tail -1 | awk \'{print $5}\'').toString();
        const match = output.match(/(\d+)%/);
        return match ? parseFloat(match[1]) : 0;
      } else if (process.platform === 'linux') {
        const output = execSync('df -h . | tail -1 | awk \'{print $5}\'').toString();
        const match = output.match(/(\d+)%/);
        return match ? parseFloat(match[1]) : 0;
      } else {
        // Fallback for other platforms
        return 0;
      }
    } catch {
      return 0;
    }
  }

  startMonitoring(intervalMs = 30000) {
    if (this.checkInterval) clearInterval(this.checkInterval);
    this.checkInterval = setInterval(() => {
      this.check().then(report => {
        cache.set('lastHealthReport', report, intervalMs);
        this.checkAlerts(report);
      }).catch(log.error);
    }, intervalMs);
    this.monitor.start();
    log.info('Agent health monitoring started');
  }

  stopMonitoring() {
    if (this.checkInterval) clearInterval(this.checkInterval);
    this.monitor.stop();
    log.info('Agent health monitoring stopped');
  }

  checkAlerts(report) {
    const alerts = [];

    // Check CPU usage
    if (report.system.cpuUsage > this.ALERT_THRESHOLD) {
      alerts.push({ agent: 'system', issue: 'high_cpu', value: report.system.cpuUsage, level: 'critical' });
    } else if (report.system.cpuUsage > this.WARN_THRESHOLD) {
      alerts.push({ agent: 'system', issue: 'high_cpu', value: report.system.cpuUsage, level: 'warning' });
    }

    // Check memory usage
    if (report.system.memoryUsage > this.ALERT_THRESHOLD) {
      alerts.push({ agent: 'system', issue: 'high_memory', value: report.system.memoryUsage, level: 'critical' });
    } else if (report.system.memoryUsage > this.WARN_THRESHOLD) {
      alerts.push({ agent: 'system', issue: 'high_memory', value: report.system.memoryUsage, level: 'warning' });
    }

    // Check disk usage
    if (report.system.diskUsage > this.ALERT_THRESHOLD) {
      alerts.push({ agent: 'system', issue: 'high_disk', value: report.system.diskUsage, level: 'critical' });
    } else if (report.system.diskUsage > this.WARN_THRESHOLD) {
      alerts.push({ agent: 'system', issue: 'high_disk', value: report.system.diskUsage, level: 'warning' });
    }

    // Check agent health
    for (const agentStatus of report.agents) {
      if (agentStatus.status === 'error' || agentStatus.status === 'unhealthy') {
        alerts.push({ agent: agentStatus.name, issue: 'unhealthy', value: agentStatus.error || true, level: 'critical' });
      }
    }

    // Check wallet existence
    if (!report.wallets.solana) alerts.push({ agent: 'wallet', issue: 'missing_solana', level: 'critical' });
    if (!report.wallets.evm) alerts.push({ agent: 'wallet', issue: 'missing_evm', level: 'critical' });

    // Check API key
    if (!report.api.hasAiKey) alerts.push({ agent: 'api', issue: 'missing_ai_key', level: 'critical' });

    return alerts;
  }

  async getAlerts() {
    const report = await this.check();
    return this.checkAlerts(report);
  }
}

let healthMonitor = null;

export async function check(args = {}) {
  if (!healthMonitor) healthMonitor = new AgentHealthMonitor();
  const report = await healthMonitor.checkSystem();
  return { ok: true, report };
}

export async function status(args = {}) {
  if (!healthMonitor) healthMonitor = new AgentHealthMonitor();
  const report = await healthMonitor.checkSystem();
  return { ok: true, ...report };
}

export async function alert(args = {}) {
  if (!healthMonitor) healthMonitor = new AgentHealthMonitor();
  const alerts = await healthMonitor.getAlerts();
  return { ok: true, alerts };
}

export async function startMonitoring(args = {}) {
  if (!healthMonitor) healthMonitor = new AgentHealthMonitor();
  healthMonitor.startMonitoring(args.intervalMs || 30000);
  return { ok: true, message: 'Monitoring started' };
}

export async function stopMonitoring(args = {}) {
  if (healthMonitor) {
    healthMonitor.stopMonitoring();
    healthMonitor = null;
  }
  return { ok: true, message: 'Monitoring stopped' };
}