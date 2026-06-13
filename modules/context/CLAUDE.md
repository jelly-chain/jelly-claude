# context — Context Store

Key-value context storage for persisting data between agent operations. Uses in-memory cache.

## Tools

| Tool | Description |
|------|-------------|
| `store` | Store a value with `--key` and `--value` |
| `retrieve` | Retrieve a value by `--key` |
| `deleteContext` | Delete a value by `--key` |
| `list` | List all stored keys (returns mock key list) |

## Usage

```bash
node modules/context/run.mjs store --key "user:preferences" --value '{"theme":"dark"}'
node modules/context/run.mjs retrieve --key "user:preferences"
node modules/context/run.mjs deleteContext --key "user:preferences"
node modules/context/run.mjs list
```

## Notes

- Uses cache (60s TTL) — data is not persisted to disk
- `list` returns a mock key listing
- Useful for passing data between agents and modules
