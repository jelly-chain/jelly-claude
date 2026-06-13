# clipboard-watch — Clipboard Monitor

Monitors system clipboard for content changes. Can detect crypto addresses and other patterns. Currently returns mock responses.

## Tools

| Tool | Description |
|------|-------------|
| `watch` | Start watching the clipboard for changes |
| `stop` | Stop watching the clipboard |
| `check` | Check current clipboard content and detect content type (e.g., crypto address) |

## Usage

```bash
node modules/clipboard-watch/run.mjs watch
node modules/clipboard-watch/run.mjs check
node modules/clipboard-watch/run.mjs stop
```

## Notes

- Currently returns mock data
- Cache TTL: 5 seconds (frequent polling expected)
- Expected to integrate with macOS `pbpaste` or a clipboard library
- Can detect crypto addresses from clipboard content
