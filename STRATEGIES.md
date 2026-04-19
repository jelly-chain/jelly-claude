# Jelly-Claude — Trading Strategy Playbooks

Step-by-step strategies that combine multiple agents and skills.  
Each playbook shows exactly which agents to invoke and in what order.

---

## Strategy 1: On-Chain Signal → predict.fun Trade

**Goal:** Use live jellychain.fun data to find a mispriced predict.fun market and trade it.

**Agents:** `jelly-predictions-agent` → `predict-fun-trader`

**Steps:**
1. Start `jelly-predictions-agent` and ask: *"Pull current jellychain.fun TVL for all major protocols. Are there any predict.fun markets related to TVL, volume, or protocol dominance?"*
2. The agent fetches live TVL/volume from jellychain.fun and searches predict.fun for related markets.
3. For any market found, calculate the Jelly Score (conviction 0–100) using the prediction-skill framework.
4. If Jelly Score ≥ 60, switch to `predict-fun-trader`.
5. The trader agent fetches the orderbook and checks liquidity.
6. Size the position using the 5% rule (never more than 5% of USDT balance per trade).
7. Place a LIMIT order — always confirm details before submitting.

**Key rules:**
- Jelly Score 80–100: full size; 60–79: half size; below 60: no trade
- Always read the market's `resolutionSource` before trading
- Start on BNB Testnet if you haven't traded predict.fun before

---

## Strategy 2: New Token Launch → Prediction Market Hedge

**Goal:** Launch or buy a pump.fun token and hedge with a prediction market on the same narrative.

**Agents:** `pump-launcher` → `dexscreener-scanner` → `polymarket-trader` or `predict-fun-trader`

**Steps:**
1. Launch or buy into a token using `pump-launcher` on pump.fun.
2. Use `dexscreener-scanner` to monitor the token's bonding curve progress and volume.
3. If the token is part of a larger narrative (e.g., a political event, BTC price milestone), search for related prediction market positions.
4. Use `polymarket-trader` or `predict-fun-trader` to open a hedging position — e.g., buy NO on a market that would harm your token's narrative if it resolves YES.
5. Monitor both positions together. The prediction market hedge reduces your directional exposure.

**Key rules:**
- Keep the hedge position ≤ 20% of the token position value
- Close the hedge before the prediction market resolves if the narrative has already played out in price

---

## Strategy 3: Solana DEX Snipe → Quick Exit

**Goal:** Snipe a new Solana token launch and exit into prediction market cash if liquidity thins.

**Agents:** `dexscreener-scanner` → `jupiter-trader` → `token-security-auditor`

**Steps:**
1. Run `dexscreener-scanner` monitoring Solana pairs launched in the last 10 minutes with volume > $50K.
2. For any candidate, immediately run `token-security-auditor` — check mint authority, freeze authority, top-10 holder concentration, and liquidity lock.
3. Only proceed if: mint authority revoked OR locked, no freeze authority, top-10 holders < 30%, liquidity locked ≥ 6 months.
4. Use `jupiter-trader` to buy via Jupiter with a max price impact of 2%.
5. Set a take-profit limit order at 2–3× entry (Jupiter limit orders).
6. Set a stop-loss at 40% of entry price.

**Key rules:**
- Never skip the security audit
- Never invest more than 1 SOL per snipe without explicit intent
- Use slippage ≤ 3% on entry

---

## Strategy 4: Hyperliquid Perp + Kalshi Binary Hedge

**Goal:** Open a directional crypto perp on Hyperliquid and hedge the macro outcome with a Kalshi contract.

**Agents:** `hyperliquid-trader` → `kalshi-trader`

**Steps:**
1. Use `hyperliquid-trader` to open a position — e.g., 2× long BTC-PERP for $500 USDC.
2. Note the key risk events (Fed meeting, CPI data release, etc.) that could hurt the position.
3. Use `kalshi-trader` to find a Kalshi contract related to that risk — e.g., "Will the Fed cut rates at the next meeting?"
4. Buy the Kalshi outcome that profits if the macro risk materialises (e.g., buy NO on a rate cut if you think no cut = bad for BTC).
5. Size the Kalshi hedge at ~10–15% of the Hyperliquid position notional.

**Key rules:**
- Kalshi is fiat-only (USD), no crypto wallet needed — just a Kalshi account
- Close the Kalshi position after the event resolves regardless of P&L
- Check funding rates on Hyperliquid — sustained negative funding eats into profits

---

## Strategy 5: Cross-Market Prediction Arbitrage

**Goal:** Find the same event priced differently across Polymarket, Kalshi, and predict.fun.

**Agents:** `prediction-market-monitor` → `polymarket-trader` or `kalshi-trader` or `predict-fun-trader`

**Steps:**
1. Run `prediction-market-monitor` and ask: *"Find the same underlying event on Polymarket, Kalshi, and predict.fun and compare YES prices."*
2. The agent searches across all three platforms for matching markets (e.g., "BTC above $100K by December").
3. If the same event is priced differently — e.g., Polymarket YES = 0.62, predict.fun YES = 0.57 — there may be an arbitrage.
4. Note the collateral differences (USDC vs USDT vs USD fiat) and resolution oracle differences before trading.
5. Buy YES on the cheaper platform, sell (or buy NO) on the more expensive one.
6. Hold until both markets resolve at the same outcome.

**Key rules:**
- Resolution criteria must be identical for true arbitrage — read both market descriptions carefully
- Account for fees on both sides (typically 1–2% per market)
- Regulatory differences: Kalshi requires US eligibility; Polymarket and predict.fun are open globally
- Currency risk: Polymarket uses USDC, predict.fun uses USDT — both are stablecoins but different issuers

---

## Strategy 6: pump.fun Launch + Meteora DLMM LP

**Goal:** Launch a token on pump.fun, let it graduate to Raydium, then migrate liquidity to Meteora for higher fee capture.

**Agents:** `pump-launcher` → `raydium-lp` → `meteora-launcher`

**Steps:**
1. Launch a token using `pump-launcher`. Monitor the bonding curve — graduation triggers when the curve fills (~85 SOL raised).
2. On graduation, the token automatically gets a Raydium AMM pool. Use `raydium-lp` to inspect the initial pool and add more liquidity if desired.
3. Once the token has stable volume (typically 48–72h after graduation), evaluate migrating to Meteora DLMM for concentrated liquidity and dynamic fees.
4. Use `meteora-launcher` to create a DLMM pool — set a tight initial range around the current price (±20%).
5. Monitor and rebalance the DLMM range weekly or when price moves out of range.

**Key rules:**
- Keep at least 10% of supply as a team reserve before launch
- Meteora DLMM requires active management — set calendar reminders to check ranges
- DLMM out-of-range positions earn zero fees — rebalance promptly

---

## Strategy 7: Whale Wallet Copy Trade (Solana)

**Goal:** Monitor a high-performing whale wallet and mirror their trades with a small position size.

**Agents:** `wallet-watcher` → `birdeye-analyst` → `jupiter-trader`

**Steps:**
1. Use `wallet-watcher` to identify and track a target wallet — either a known alpha wallet or one identified via `on-chain-analyst` for strong historical performance.
2. Set up monitoring: *"Alert me every time this wallet makes a swap > $5K on any Solana DEX."*
3. When an alert fires, use `birdeye-analyst` to quickly check the target token's momentum, holder count, and volume trend.
4. If the token passes a basic safety check (no freeze authority, adequate liquidity), use `jupiter-trader` to mirror the trade at 10–20% of the whale's size.
5. Set a take-profit at 50% gain and stop-loss at 25% loss using Jupiter limit orders.

**Key rules:**
- Mirror no more than 5 wallets at once or it becomes unmanageable
- Whales move faster than you — use Jupiter's `--skip-user-accounts-rpc-calls` for speed
- Past performance doesn't guarantee future results — review the target wallet's history for at least 30 days of data before copying

---

## Strategy 8: BNB Chain Yield Farming Rotation

**Goal:** Maximise yield on idle USDT/BNB by rotating between PancakeSwap, predict.fun market-making, and four.meme launches.

**Agents:** `bnb-dex-trader` → `predict-fun-trader` → `four-meme-launcher` (rotate based on opportunity)

**Steps:**
1. Start with `bnb-dex-trader` to check current PancakeSwap pool APYs for USDT/BNB and USDT/CAKE pairs.
2. Run `predict-fun-trader` and check if there are high-volume predict.fun markets with wide bid-ask spreads (market-making opportunity).
3. For market-making on predict.fun: place LIMIT orders on both YES and NO sides near the midpoint and collect the spread as trades fill.
4. Monitor for new four.meme launches — if a strong launch appears with verified developer history, allocate a small BNB position.
5. Review allocation weekly: move capital to wherever current APY/opportunity is best.

**Key rules:**
- Keep at least 30% of BNB Chain funds in a stable USDT position at all times
- predict.fun market-making is only profitable on liquid markets (orderbook depth > $10K each side)
- four.meme launches are high-risk — cap total exposure to 10% of BNB Chain allocation
