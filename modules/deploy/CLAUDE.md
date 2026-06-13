# deploy — Deployment Manager

Manages container and agent deployments, rollbacks, and deployment listing. Currently returns mock data.

## Tools

| Tool | Description |
|------|-------------|
| `deployContainer` | Deploy a `--container` to an `--environment`. Returns running status |
| `deployAgent` | Deploy an `--agent` with `--config`. Returns active status |
| `rollback` | Rollback a deployment by `--deploymentId` |
| `listDeployments` | List all deployments with name, environment, and status |

## Usage

```bash
node modules/deploy/run.mjs deployContainer --container web-server --environment production
node modules/deploy/run.mjs deployAgent --agent trader-bot --config '{"strategy":"sma"}'
node modules/deploy/run.mjs rollback --deploymentId deploy1
node modules/deploy/run.mjs listDeployments
```

## Notes

- Currently returns mock data — Docker/Kubernetes integration not yet implemented
- Uses caching (60s TTL)
