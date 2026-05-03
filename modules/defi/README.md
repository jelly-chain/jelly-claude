# defi module

DeFi operations — yield comparison, pool discovery, Jupiter quotes, and token prices.

## Usage

```bash
node modules/defi/run.mjs yields --chain solana --minApy 20 --limit 5
node modules/defi/run.mjs yields --token "SOL/USDC"
node modules/defi/run.mjs jupiterQuote --inputMint So11... --outputMint EPjFW... --amount 1000000000
node modules/defi/run.mjs price --ids "SOL,JUP,BONK"
```
