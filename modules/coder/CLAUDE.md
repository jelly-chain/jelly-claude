# coder — Code Assistant

Provides code generation, refactoring, debugging, and code review capabilities. Currently returns mock/simulated responses.

## Tools

| Tool | Description |
|------|-------------|
| `generate` | Generate code from a `--prompt` in a `--language`. Returns generated code |
| `refactor` | Refactor a `--file`. Returns change summary |
| `debug` | Debug a `--file`. Returns found issues |
| `review` | Review a `--file`. Returns review comments |

## Usage

```bash
node modules/coder/run.mjs generate --language python --prompt "fibonacci function"
node modules/coder/run.mjs refactor --file src/main.mjs
node modules/coder/run.mjs debug --file src/main.mjs
node modules/coder/run.mjs review --file src/main.mjs
```

## Notes

- Currently returns mock data — LLM-based code generation not yet integrated
- Uses caching (60s TTL)
