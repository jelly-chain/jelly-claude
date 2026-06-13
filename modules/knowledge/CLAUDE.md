# knowledge — Semantic Search Engine

Provides semantic search over repositories and documentation. Embeds repo files for vector search and supports searching both code and docs.

## Tools

| Tool | Description |
|------|-------------|
| `index-repo` | Embed repository files for semantic search. Requires `--path` to repo directory |
| `search-code` | Semantic code search. Requires `--query` search string |
| `search-docs` | Search documentation and README files. Requires `--query` |
| `list-indexes` | List all indexed repositories |

## Usage

```bash
node modules/knowledge/run.mjs index-repo --path /workspace/my-project
node modules/knowledge/run.mjs search-code --query "authentication middleware"
node modules/knowledge/run.mjs search-docs --query "setup instructions"
node modules/knowledge/run.mjs list-indexes
```

## Notes

- Uses embedding-based semantic search (not keyword matching)
- Indexes are stored for fast retrieval
- Can index any text-based repository files
- The knowledge module's CLAUDE.md is one of the few pre-populated module docs
