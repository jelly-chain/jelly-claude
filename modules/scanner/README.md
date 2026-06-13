# scanner module

New token pair discovery and screening via DexScreener with volume spike detection.

## Usage

```bash
node modules/scanner/run.mjs scan --chain solana
node modules/scanner/run.mjs newTokens --chain bsc --maxAge 60
node modules/scanner/run.mjs trending --chain base
node modules/scanner/run.mjs search --query "BONK" --chain solana
```

## Tools

| Tool | Description |
|------|-------------|
| `scan` | Full scan with volume spike detection and prediction scoring |
| `newTokens` | Tokens launched within N minutes |
| `trending` | Top trending pairs on a chain |
| `search` | Search for specific token or pair |
