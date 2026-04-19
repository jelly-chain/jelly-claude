# Jelly-Claude — Troubleshooting Guide

Common errors and fixes across all supported chains and protocols.

---

## General / Setup

### `claude: command not found`
Claude Code is not installed or not on your PATH.
```bash
npm install -g @anthropic-ai/claude-code
# Then restart your terminal or run:
export PATH="$PATH:$(npm root -g)/.bin"
```

### `.env: No such file or directory`
The `.env` file was not created by setup.
```bash
cp .env.example .env
nano .env   # Add your ANTHROPIC_API_KEY or OPENROUTER_API_KEY
```

### `No API key found — falling through to Claude's built-in login`
Your `.env` exists but is missing a key, or the key line is commented out.
- Check `.env` for `ANTHROPIC_API_KEY=sk-ant-...` or `OPENROUTER_API_KEY=sk-or-...`
- Make sure there are no leading spaces and the `=` has no spaces around it

### Skills not found after install
The skills installer looks for `~/.claude/skills/` — if Claude Code is installed differently, the path may differ.
```bash
ls ~/.claude/skills/   # Should show skill directories
# If empty, re-run:
bash ../jelly-claude-skills/install-all.sh
```

---

## Solana

### `Error: 0x1` (Insufficient funds)
Your wallet doesn't have enough SOL for gas, or not enough of the token you're trying to send.
- Check balance: use `solana-wallet-skill` to query your SOL balance
- Top up at least 0.01 SOL for typical transaction fees; 0.05+ SOL for complex transactions

### `Transaction simulation failed: Error processing Instruction`
The on-chain instruction failed in simulation — usually one of:
- **Wrong account order** — check that accounts are passed in the order the program expects
- **Account not initialised** — the target account (e.g., associated token account) doesn't exist yet; create it first
- **Insufficient compute** — add a `setComputeUnitLimit` instruction; start with 400,000 and adjust

### `Blockhash not found` / `Transaction too old`
The transaction took too long to submit after the blockhash was fetched.
- Fetch a fresh blockhash immediately before signing and sending
- Use `commitment: "confirmed"` when fetching the blockhash for faster finality
- Consider using durable nonces for long-running operations

### `AccountNotFound` for an associated token account
The ATA for that token doesn't exist on the wallet yet.
```typescript
// Create the ATA before transferring:
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
const ata = await getAssociatedTokenAddress(mint, owner);
// Add createAssociatedTokenAccountInstruction to your transaction
```

### Helius RPC 429 (rate limit)
You've exceeded the Helius free-tier rate limit.
- Add delays between batch requests (`await sleep(100)`)
- Upgrade to a paid Helius plan for higher limits
- Use the public RPC `https://api.mainnet-beta.solana.com` as fallback (slower, rate limited too)

### Jupiter swap fails with `Price impact too high`
The trade size is too large relative to available liquidity.
- Reduce trade size or split into multiple smaller swaps
- Increase slippage tolerance carefully (max 3–5% for volatile tokens)
- Use `onlyDirectRoutes: false` to allow multi-hop routing

---

## BNB Chain

### `insufficient funds for gas`
Your EVM wallet has no BNB or not enough BNB for gas.
- Send BNB to your wallet address from a CEX or bridge
- Typical gas cost: 0.001–0.005 BNB per transaction; approve/swap interactions: ~0.005 BNB

### PancakeSwap: `INSUFFICIENT_OUTPUT_AMOUNT`
Slippage tolerance is too low — the price moved during the transaction.
- Increase slippage to 1% for stable pairs, 3–5% for volatile tokens
- Try again during lower volatility

### `execution reverted` on BNB Chain
Generic revert — can mean:
- **Allowance too low**: call `approve()` for the token before the swap
- **Wrong function parameters**: double-check ABI and call parameters
- **Contract paused**: the contract may be in an emergency pause state

### EVM private key not loading from `.keys`
The `.keys` file uses `EVM_PRIVATE_KEY` but your code may look for a different name.
```javascript
// Check which key name your skill expects:
const keys = loadKeys(); // from ~/.jelly-claude/.keys
const pk = keys.EVM_PRIVATE_KEY || keys.PRIVATE_KEY;
```
Ensure `setup.sh` wrote `EVM_WALLET_PATH` and the wallet file is readable.

---

## predict.fun

### `Invalid API key` (401)
Your `PREDICT_API_KEY` is missing or incorrect.
- Mainnet requires an API key — get one via Discord: discord.gg/predictdotfun
- Testnet does NOT need an API key — remove it from headers when testing
- Check: `PREDICT_API_KEY` in `~/.jelly-claude/.keys`

### `401 Unauthorized` on order endpoints
Your JWT token has expired (valid for ~1 hour).
Re-authenticate:
```typescript
// 1. GET /v1/auth/message
// 2. Sign the message with your EOA wallet
// 3. POST /v1/auth to get a new JWT
```

### `Insufficient allowance` on first trade
You haven't set ERC-20/ERC-1155 approvals yet.
```typescript
const result = await builder.setApprovals();
// This only needs to be done ONCE per wallet
```

### Orders not filling (stuck as OPEN)
- Your LIMIT order price may not match any resting orders — check the orderbook
- The market may be suspended: check `market.tradingStatus === "active"`
- Try a tighter price or use a MARKET order on liquid markets

### WebSocket drops after ~15 seconds
You must respond to heartbeat messages or the server closes the connection.
```typescript
if (msg.type === "M" && msg.topic === "heartbeat") {
  ws.send(JSON.stringify({ method: "heartbeat", timestamp: msg.timestamp }));
}
```

### `approval transactions failed` in `setApprovals()`
You don't have enough BNB for gas.
- Need ~0.01–0.02 BNB to cover the 4 approval transactions
- Check BNB balance with `bnb-wallet-skill` before running approvals

---

## Polymarket

### `Proxy wallet not approved`
Your Polygon wallet hasn't been approved as a trading proxy on Polymarket.
- Use the `polymarket-trader` agent and ask it to set up the proxy wallet
- This is a one-time on-chain approval on Polygon

### `Invalid signature` on order submission
- The `POLYMARKET_PASSPHRASE` may be wrong — regenerate your API key at app.polymarket.com
- Ensure `POLYMARKET_API_KEY`, `POLYMARKET_SECRET`, and `POLYMARKET_PASSPHRASE` are all set correctly in `.keys`

### `Insufficient USDC balance`
- Bridge USDC to Polygon or buy on a CEX and withdraw to your Polygon wallet address
- Your Polygon wallet address is the same as your EVM wallet (`evm.json`)

---

## Kalshi

### `401 Unauthorized` on Kalshi API
- Check that `KALSHI_API_KEY` and `KALSHI_API_SECRET` are correctly set in `.keys`
- Kalshi API keys have an expiry — regenerate at kalshi.com → Account → API Access

### `Insufficient balance`
- Deposit USD at kalshi.com (bank transfer only — no crypto)
- Kalshi is fully fiat-based; no crypto wallet is involved

### `Market not found` or `Market closed`
- Markets can close with little warning — check `market.status === "open"` before trading
- Use the Kalshi market search to find active alternatives

---

## Hyperliquid

### `Insufficient margin`
- Your USDC margin on Hyperliquid is too low for the position size requested
- Deposit more USDC via the Hyperliquid bridge, or reduce position size/leverage

### `Max leverage exceeded`
- Hyperliquid has per-asset leverage caps (e.g., BTC max 40×, some alts lower)
- Reduce leverage to within the asset's allowed range

### Position liquidated unexpectedly
- Check the liquidation price before opening any position
- Funding rates accumulate over time — very negative funding on longs can erode margin faster than expected
- Use `hyperliquid-trader` to check current funding before opening

---

## OpenRouter proxy issues

### `Proxy did not start on port 7788`
`proxy.mjs` failed to start — check Node.js is v18+ and there's no port conflict.
```bash
node --version   # Should be v18+
lsof -i :7788    # Check if port is in use
```

### Models returning empty responses
Some free OpenRouter models may be temporarily unavailable or have token limits.
- Switch to a different model tier in `.env` (see comments in `.env.example`)
- Use `torq.sh` for the curated high-performance free model selection

### `Rate limit exceeded` on OpenRouter
Free tier models have strict rate limits.
- Add delays between requests
- Upgrade to a paid OpenRouter plan
- Switch to `ANTHROPIC_API_KEY` for unlimited-rate paid access
