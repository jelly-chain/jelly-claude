# dev-env — Development Environment Setup

Manages development environment setup, dependency installation, and server lifecycle. Currently returns mock data.

## Tools

| Tool | Description |
|------|-------------|
| `setup` | Set up a development environment. Optional `--path` for project directory |
| `installDeps` | Install dependencies. Optional `--path` for project directory |
| `startServer` | Start a development server. Optional `--port` |
| `stopServer` | Stop the development server |

## Usage

```bash
node modules/dev-env/run.mjs setup --path /workspace/my-project
node modules/dev-env/run.mjs installDeps --path /workspace/my-project
node modules/dev-env/run.mjs startServer --port 3000
node modules/dev-env/run.mjs stopServer
```

## Notes

- Currently returns mock data
- Uses caching (60s TTL)
