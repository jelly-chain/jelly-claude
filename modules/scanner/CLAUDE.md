# scanner — Token Scanner & Analyzer

Scans for new tokens, trending tokens, volume spikes, and performs rug checks and holder analysis. Uses the `ScannerAgent` for on-chain scanning operations.

## Tools

| Tool | Description |
|------|-------------|
| `scan` | General scan with optional `--chain` (default: solana) and `--query` |
| `newTokens` | Find new tokens on a `--chain` younger than `--maxAge` minutes (default: 30) |
| `trending` | Get trending tokens on a `--chain` |
| `search` | Search tokens by `--query` on a `--chain` |
| `volumeSpike` | Find tokens with volume spikes above `--minVolume` USD (default: 100000) |
| `rugCheck` | Analyze token risk for an `--address` on a `--chain`. Returns risk score and issues |
| `topHolders` | Get top holders for a token `--address`. `--limit` controls count (default: 10) |
| `tokenMetadata` | Get metadata for a token `--address` on a `--chain` |

## Usage

```bash
node modules/scanner/run.mjs scan --chain solana
node modules/scanner/run.mjs newTokens --chain solana --maxAge 60
node modules/scanner/run.mjs trending --chain bnb
node modules/scanner/run.mjs search --query "PEPE" --chain ethereum
node modules/scanner/run.mjs volumeSpike --chain solana --minVolume 500000
node modules/scanner/run.mjs rugCheck --address <token_address> --chain solana
node modules/scanner/run.mjs topHolders --address <token_address> --chain solana --limit 20
node modules/scanner/run.mjs tokenMetadata --address <token_address> --chain solana
```

## Notes

- Uses `ScannerAgent` from `ai-agents/scanner.js`
- Default chain is Solana
- Rug check returns a risk score and list of issues found
- All results are cached in memory
