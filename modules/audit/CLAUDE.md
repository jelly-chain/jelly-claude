# audit — Audit Logging System

Provides audit trail logging for tracking actions, querying logs, and checking log statistics. All logs are stored in cache (in-memory, 60s TTL).

## Tools

| Tool | Description |
|------|-------------|
| `log` | Record an audit entry with `--action`, optional `--user`, and optional `--details` |
| `query` | Query audit logs with filters: `--action`, `--user`, `--start`, `--end` |
| `check` | Get audit log statistics — total count and most recent entry |

## Log Entry Schema

```json
{
  "timestamp": 1700000000000,
  "action": "trade_executed",
  "user": "agent_123",
  "details": { "token": "SOL", "amount": 1.5 }
}
```

## Usage

```bash
node modules/audit/run.mjs log --action trade_executed --user agent_123
node modules/audit/run.mjs query --action trade_executed
node modules/audit/run.mjs check
```
