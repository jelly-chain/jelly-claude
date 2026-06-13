# ai-agents — AI Agent Lifecycle Manager

Manages the creation, storage, retrieval, update, deletion, and execution of AI agents. All agent records are persisted in memory (via `core/memory`).

## Tools

| Tool | Description |
|------|-------------|
| `create` | Create a new agent with `--name`, optional `--type` (default: `generic`), and optional `--config` JSON |
| `list` | List all registered agents |
| `get` | Get a single agent by `--id` |
| `update` | Update an agent by `--id` with `--updates` (fields to merge) |
| `deleteAgent` | Delete an agent by `--id` |
| `execute` | Simulate executing an agent by `--id` |

## Agent Schema

```json
{
  "id": "agent_<timestamp>_<random>",
  "name": "my-agent",
  "type": "generic",
  "status": "created",
  "createdAt": 1700000000000,
  "config": {}
}
```

## Usage

```bash
node modules/ai-agents/run.mjs create --name predictor --type scanner
node modules/ai-agents/run.mjs list
node modules/ai-agents/run.mjs get --id agent_xxx
node modules/ai-agents/run.mjs deleteAgent --id agent_xxx
node modules/ai-agents/run.mjs execute --id agent_xxx
```

## Notes

- Agent data is stored in memory via `createMemory()` — not persisted to disk
- The `execute` tool is a simulation; real agent execution is handled by the `ai-agents` core classes
- Agent IDs are auto-generated with timestamp + random suffix
