# alerts — Alert Dispatcher & Management

Manages alert creation, dispatching, history, and configuration. Integrates with the `AlertDispatcherAgent` and the core event bus for dispatching alerts.

## Tools

| Tool | Description |
|------|-------------|
| `status` | Show dispatcher stats and event bus stats |
| `test` | Send a test alert with configurable `--type`, `--severity`, `--token`, `--multiplier`, `--message` |
| `history` | Query audit log for recent dispatched alerts (default: last 20) |
| `config` | Configure dispatcher `--minSeverity` and `--voice` enabled/disabled |
| `add` | Add a new alert rule with `--type`, `--message`, and optional conditions |
| `remove` | Remove an alert by `--id` |
| `list` | List all configured alerts |
| `trigger` | Manually trigger a specific alert by `--id` |

## Dependencies

- `AlertDispatcherAgent` from `ai-agents/alert-dispatcher.js`
- `bus` from `core/events.mjs` for event dispatching
- `audit` from `core/audit.mjs` for alert history
- `createMemory()` for alert persistence

## Usage

```bash
node modules/alerts/run.mjs status
node modules/alerts/run.mjs test --type volume_spike --severity high --token SOL
node modules/alerts/run.mjs history --n 50
node modules/alerts/run.mjs config --minSeverity medium --voice true
node modules/alerts/run.mjs add --type price_alert --message "SOL > $200"
node modules/alerts/run.mjs list
node modules/alerts/run.mjs trigger --id alert_xxx
node modules/alerts/run.mjs remove --id alert_xxx
```
