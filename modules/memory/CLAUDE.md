# memory — Memory Module (Placeholder)

Placeholder module for persistent memory management. Currently has no standalone tools — the core memory functionality is provided by `core/memory`.

## Status

- **Not yet implemented** as a standalone module — tools/index.mjs exports a default function only
- Core memory functionality lives in `core/memory/index.js` and is used by many other modules

## Usage

```bash
node modules/memory/run.mjs
```

## Related

- `core/memory/index.js` — Core memory implementation used by agents and modules
- `context` — Key-value context store (functional)
