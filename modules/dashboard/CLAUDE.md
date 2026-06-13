# dashboard — System Dashboard

Provides a system overview dashboard with metrics, agent status, and module information. Currently returns mock data.

## Tools

| Tool | Description |
|------|-------------|
| `overview` | System overview — agent count, active modules, system health, CPU/memory usage, recent activity |
| `metrics` | Detailed metrics — CPU, memory, and network usage with history |
| `agents` | List agents with their status and last seen timestamps |
| `modules` | List modules with their status and version |

## Usage

```bash
node modules/dashboard/run.mjs overview
node modules/dashboard/run.mjs metrics
node modules/dashboard/run.mjs agents
node modules/dashboard/run.mjs modules
```

## Notes

- Currently returns mock data
- Uses caching (60s TTL)
- Intended as a system status overview for the operator
