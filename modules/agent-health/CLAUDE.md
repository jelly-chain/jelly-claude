# agent-health — System Health Monitor

Monitors system resources (CPU, memory, disk), wallet file existence, API key availability, and agent health status. Provides continuous monitoring with configurable alerting thresholds.

## Tools

| Tool | Description |
|------|-------------|
| `check` | Full system health check — returns CPU, memory, disk usage, wallet status, API key status, and agent health |
| `status` | Alias for `check`, returns the same comprehensive health report |
| `alert` | Returns a list of active alerts based on current system state (high CPU/memory/disk, missing wallets, unhealthy agents) |
| `startMonitoring` | Starts continuous background monitoring at a configurable interval (default 30s). Caches reports and auto-checks alerts |
| `stopMonitoring` | Stops the background monitoring loop and cleans up resources |

## Alert Thresholds

- **Warning**: CPU/memory/disk > 80%
- **Critical**: CPU/memory/disk > 90%
- **Critical**: Missing Solana or EVM wallet files
- **Critical**: Missing AI API key (ANTHROPIC_API_KEY or OPENROUTER_API_KEY)
- **Critical**: Any agent failing health check

## Usage

```bash
node modules/agent-health/run.mjs check
node modules/agent-health/run.mjs alert
node modules/agent-health/run.mjs startMonitoring --intervalMs 60000
node modules/agent-health/run.mjs stopMonitoring
```

## Implementation Details

- Uses `SystemMonitor` from `core/cpu-monitor.mjs` for CPU/memory metrics
- Checks wallet files at `~/.jelly-claude/wallets/solana.json` and `~/.jelly-claude/wallets/evm.json`
- Agent health checks attempt to import and instantiate agent classes and verify they have an `execute` method
- Disk usage uses `df` command on macOS/Linux
- Caches health reports with 30s TTL via `core/cache.mjs`
