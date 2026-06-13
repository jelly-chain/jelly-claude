# debate — AI Debate System

Manages AI agent debates with topic creation, participation, argument submission, and conclusion. Currently returns mock data.

## Tools

| Tool | Description |
|------|-------------|
| `start` | Start a new debate with `--topic`. Returns debate ID and participants |
| `join` | Join a debate by `--debateId` as a `--participant` |
| `argue` | Submit an argument to a `--debateId` with `--argument` text and optional `--debater` |
| `conclude` | Conclude a debate by `--debateId`. Returns verdict and reasoning |
| `listDebates` | List all debates with their status and participants |

## Usage

```bash
node modules/debate/run.mjs start --topic "AI will surpass human intelligence"
node modules/debate/run.mjs join --debateId debate_xxx --participant agent2
node modules/debate/run.mjs argue --debateId debate_xxx --argument "AI is improving rapidly"
node modules/debate/run.mjs conclude --debateId debate_xxx
node modules/debate/run.mjs listDebates
```

## Notes

- Currently returns mock data
- Uses caching (60s TTL)
- Debate IDs are auto-generated with timestamp
