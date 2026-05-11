# Jelly-Claude — Skills Reference (38 skills)

Skills are installed at `~/.claude/skills/<skill-name>/SKILL.md`.  
After `setup.sh` / `install-all.sh` runs, all 38 are available automatically.

---

## 1inch-skill
**Chain:** Multi-chain EVM (ETH, BNB, Polygon, Arbitrum, Base, Avalanche, zkSync)
**Purpose:** Best-rate DEX aggregation across 300+ liquidity sources — swap quotes, approval management, and on-chain swap execution.  
**Required keys:** `ONEINCH_API_KEY` (portal.1inch.dev), `EVM_PRIVATE_KEY`  
**Use when:** Swapping any EVM token at the best rate, finding DEX price gaps, or routing large swaps to minimize slippage.

---

## aave-skill
**Chain:** Ethereum, Base, Arbitrum, Polygon, Avalanche (Aave V3)  
**Purpose:** Lending, borrowing, flash loans, interest rate strategies, and account health monitoring on Aave V3.  
**Required keys:** `EVM_PRIVATE_KEY`, `ETH_RPC_URL`  
**Use when:** Supplying collateral, borrowing assets, executing flash loans, or checking liquidation risk on Aave.

---

## base-skill
**Chain:** Base  
**Purpose:** DEX trading on Base — Aerodrome (ve(3,3) model) and Uniswap V3 concentrated liquidity.  
**Required keys:** `EVM_PRIVATE_KEY` (from `evm.json`)  
**Use when:** Swapping tokens, providing liquidity, or farming on Base chain.

---

## binance-skills-hub
**Chain:** Binance CEX / BNB Chain  
**Purpose:** Binance market data, spot trading, token security audits, and on-chain analysis — public endpoints require no key; trading requires a Binance API key.  
**Required keys:** `BINANCE_API_KEY`, `BINANCE_SECRET_KEY` (trading only; public data is keyless)  
**Use when:** Fetching Binance price data or K-lines, executing spot trades on Binance, auditing BSC token contracts, or checking your Binance account balance and order history.

---

## birdeye-skill
**Chain:** Multi-chain (Solana, ETH, BNB)  
**Purpose:** Token analytics via the Birdeye API — price, volume, holders, top traders, trending tokens.  
**Required keys:** `BIRDEYE_API_KEY`  
**Use when:** Researching a token's on-chain metrics, finding trending coins, or checking whale activity.

---

## bnb-trading-skill
**Chain:** BNB Chain (BSC)  
**Purpose:** DEX trading on BNB Chain — PancakeSwap V2/V3, routing, slippage management.  
**Required keys:** `EVM_PRIVATE_KEY`, `BNBCHAIN_API_KEY` (optional, for BSCScan queries)  
**Use when:** Swapping tokens on BSC, checking PancakeSwap pools, or executing BNB Chain trades.

---

## bnb-wallet-skill
**Chain:** BNB Chain (BSC)  
**Purpose:** EVM wallet operations on BNB Chain — balance checks, USDT/BNB transfers, gas estimation, transaction history.  
**Required keys:** `EVM_PRIVATE_KEY`  
**Use when:** Checking BNB or token balances, sending funds, or inspecting wallet transaction history on BSC.

---

## bnbchain-mcp-skill
**Chain:** BNB Chain (BSC)  
**Purpose:** BNB Chain MCP (Model Context Protocol) server integration — structured on-chain queries via the BNB Chain MCP server.  
**Required keys:** `BNBCHAIN_API_KEY`  
**Use when:** Using MCP-based tooling to query BNB Chain state, contracts, or token data programmatically.

---

## chainlink-skill
**Chain:** Multi-chain EVM (Ethereum, BNB, Polygon, Base, Arbitrum, Avalanche)  
**Purpose:** On-chain price feeds (all major pairs), VRF verifiable randomness, Automation (keepers), CCIP cross-chain messaging, and Data Streams.  
**Required keys:** `ETH_RPC_URL`, `CHAINLINK_STREAMS_KEY` (optional — Data Streams only)  
**Use when:** Reading tamper-resistant on-chain prices, integrating VRF, automating contracts, or bridging data cross-chain.

---

## coingecko-skill
**Chain:** Multi-chain (all)  
**Purpose:** Token prices, market caps, OHLCV history, trending coins, exchange data, and global market stats via the CoinGecko API.  
**Required keys:** `COINGECKO_API_KEY` (optional — free tier works without a key, 30 req/min)  
**Use when:** Looking up token prices, market caps, 24h volume, trending coins, or historical OHLCV data.

---

## defillama-skill
**Chain:** Multi-chain (all)  
**Purpose:** Protocol TVL, chain rankings, DeFi yield pools, stablecoin metrics, DEX volumes, bridge flows — free, no API key required.  
**Required keys:** None  
**Use when:** Comparing protocol TVL, finding highest yield pools, checking stablecoin health, or analyzing DeFi volume.

---

## dexscreener-skill
**Chain:** Multi-chain  
**Purpose:** New token pair discovery via the DexScreener API — recently launched pairs, volume surges, trending tokens across all chains.  
**Required keys:** None (public API)  
**Use when:** Finding new token launches, spotting volume spikes, or screening pairs across Solana, BNB, ETH, and more.

---

## etherscan-skill
**Chain:** Ethereum, BNB Chain, Polygon, Base, Arbitrum, Optimism (Etherscan-family)  
**Purpose:** On-chain data — transaction history, ERC-20 transfers, token balances, contract ABIs, source code verification, gas tracker, event logs.  
**Required keys:** `ETHERSCAN_API_KEY`, `BSCSCAN_API_KEY` (chain-dependent)  
**Use when:** Looking up on-chain transactions, wallet balances, contract code, or event history on any EVM chain.

---

## gmx-skill
**Chain:** Arbitrum, Avalanche (GMX V2)  
**Purpose:** Perpetual futures trading, GM token liquidity provision, market data, open interest, and funding rates on GMX V2.  
**Required keys:** `EVM_PRIVATE_KEY`, `ARB_RPC_URL`  
**Use when:** Opening/closing perp positions on GMX, providing liquidity to GM markets, or checking market stats and funding rates.

---

## helius-skill
**Chain:** Solana  
**Purpose:** Premium Solana RPC, webhooks, and Digital Asset Standard (DAS) API via Helius — fast RPC, NFT metadata, token accounts, transaction parsing.  
**Required keys:** `HELIUS_API_KEY`  
**Use when:** Querying Solana on-chain data at speed, setting up real-time webhooks, or fetching NFT/token metadata.

---

## hyperliquid-skill
**Chain:** Hyperliquid L1  
**Purpose:** Perpetuals trading on Hyperliquid — place orders, manage positions, check funding rates, set leverage.  
**Required keys:** `EVM_PRIVATE_KEY` (Hyperliquid uses EVM signing)  
**Use when:** Opening/closing perp positions, checking open interest, or monitoring funding rates on Hyperliquid.

---

## jelly-skill
**Chain:** Multi-chain  
**Purpose:** Live DeFi data from jellychain.fun — TVL by protocol, DEX volume, chain metrics, and ecosystem-level analytics.  
**Required keys:** None (public API)  
**Use when:** Cross-referencing prediction market theses with live on-chain TVL and volume data.

---

## jupiter-skill
**Chain:** Solana  
**Purpose:** Token swaps, DCA (dollar-cost averaging), and limit orders via Jupiter — the leading Solana swap aggregator.  
**Required keys:** Solana wallet keypair (from `solana.json`)  
**Use when:** Swapping any SPL token on Solana, setting up recurring DCA orders, or placing limit orders.

---

## kalshi-skill
**Chain:** Off-chain (fiat USD)  
**Purpose:** Trading on Kalshi — regulated US binary prediction markets settled in USD, no crypto wallet required.  
**Required keys:** `KALSHI_API_KEY`, `KALSHI_API_SECRET`  
**Use when:** Betting on regulated US events (elections, economic indicators, sports) via Kalshi's fiat-based API.

---

## metaplex-skill
**Chain:** Solana  
**Purpose:** NFT minting and management via Metaplex — create NFTs, update metadata, mint collections, use Candy Machine.  
**Required keys:** Solana wallet keypair (from `solana.json`)  
**Use when:** Launching NFT collections, minting individual NFTs, or managing Metaplex-based assets.

---

## meteora-skill
**Chain:** Solana  
**Purpose:** DLMM (Dynamic Liquidity Market Maker) liquidity provisioning on Meteora — concentrated liquidity with dynamic fee tiers.  
**Required keys:** Solana wallet keypair, `HELIUS_API_KEY` (recommended)  
**Use when:** Adding or removing liquidity from Meteora DLMM pools, rebalancing positions, or setting fee strategies.

---

## okx-skill
**Chain:** CEX (OKX) + Multi-chain EVM (OKX DEX)  
**Purpose:** OKX spot trading, perpetual futures, market data, account management, and DEX aggregation across Ethereum, BNB, Polygon, and Arbitrum.  
**Required keys:** `OKX_API_KEY`, `OKX_SECRET_KEY`, `OKX_PASSPHRASE`  
**Use when:** Trading on OKX (spot or perps), fetching price data, managing OKX balances, or getting best on-chain swap quotes via OKX DEX.

---

## opensea-skill
**Chain:** Ethereum, Polygon, Base, Arbitrum, Optimism, Solana (OpenSea V2)  
**Purpose:** NFT data — collections, listings, offers, sales history, trait filters, and on-chain NFT purchase execution via Seaport.  
**Required keys:** `OPENSEA_API_KEY`, `EVM_PRIVATE_KEY`  
**Use when:** Researching NFT collections, finding cheap listings, tracking sales, checking offers, or buying/selling NFTs on-chain.

---

## polymarket-skill
**Chain:** Polygon  
**Purpose:** Trading on Polymarket — decentralised CLOB prediction markets settled in USDC on Polygon.  
**Required keys:** `POLYMARKET_API_KEY`, `POLYMARKET_SECRET`, `POLYMARKET_PASSPHRASE`, EVM wallet (Polygon)  
**Use when:** Browsing, trading, and managing positions on Polymarket prediction markets.

---

## predict-fun-skill
**Chain:** BNB Chain (BSC)  
**Purpose:** Full CLOB prediction market trading on predict.fun v2 — orderbook reads, limit/market orders, positions, timeseries, OAuth-connected accounts, TS + Python auth.  
**Required keys:** `PREDICT_API_KEY` (mainnet only; testnet is free), `EVM_PRIVATE_KEY`  
**Use when:** Browsing and trading predict.fun markets, placing LIMIT/MARKET orders, monitoring positions, or building automated market-making strategies.

---

## prediction-skill
**Chain:** Multi-chain  
**Purpose:** Prediction market meta-patterns — the Jelly Score conviction framework (0–100), position sizing rules (5% rule), and cross-market signal analysis.  
**Required keys:** None  
**Use when:** Evaluating whether an on-chain signal justifies a prediction market trade, sizing positions, or comparing markets across Polymarket/Kalshi/predict.fun.

---

## pumpfun-skill
**Chain:** Solana  
**Purpose:** Launching meme tokens on pump.fun via the bonding curve mechanism — create tokens, monitor graduation status, buy/sell on the curve.  
**Required keys:** Solana wallet keypair (from `solana.json`)  
**Use when:** Launching a new token on pump.fun, buying into early launches, or monitoring bonding curve progress.

---

## raydium-skill
**Chain:** Solana  
**Purpose:** Liquidity provisioning on Raydium — AMM (Standard) and CLMM (Concentrated) pools, including CPMM creation.  
**Required keys:** Solana wallet keypair, `HELIUS_API_KEY` (recommended)  
**Use when:** Creating liquidity pools, adding/removing liquidity on Raydium, or farming Raydium rewards.

---

## solana-common-errors
**Chain:** Solana  
**Purpose:** Reference for frequent Solana errors — `0x1` (insufficient funds), `AccountNotFound`, blockhash expiry, compute budget errors, and their fixes.  
**Required keys:** None  
**Use when:** Debugging a Solana transaction failure or program error.

---

## solana-compatibility-matrix
**Chain:** Solana  
**Purpose:** Package version compatibility matrix for Solana development — `@solana/web3.js`, `@coral-xyz/anchor`, `@solana/kit`, and related packages.  
**Required keys:** None  
**Use when:** Setting up a new Solana project or resolving dependency version conflicts.

---

## solana-confidential-transfers
**Chain:** Solana  
**Purpose:** Token-2022 confidential transfer extension — encrypted balances, proof generation, transfer with audit compliance.  
**Required keys:** Solana wallet keypair  
**Use when:** Building privacy-preserving token transfers using the Token-2022 program.

---

## solana-frontend-kit
**Chain:** Solana  
**Purpose:** Solana wallet UI integration patterns — wallet-adapter, wallet-standard, connect buttons, balance display, transaction signing in React.  
**Required keys:** None (frontend library)  
**Use when:** Building a web interface that connects to Solana wallets (Phantom, Backpack, etc.).

---

## solana-idl-codegen
**Chain:** Solana  
**Purpose:** Anchor IDL client generation — Codama, `@coral-xyz/anchor` client generation, TypeScript type-safe program clients.  
**Required keys:** None  
**Use when:** Generating a typed TypeScript client from an Anchor program's IDL.

---

## solana-security-checklist
**Chain:** Solana  
**Purpose:** Security audit checklist for Solana programs — signer validation, owner checks, arithmetic overflow, PDA seed collisions, re-entrancy.  
**Required keys:** None  
**Use when:** Auditing or self-reviewing a Solana program before deployment.

---

## solana-testing-strategy
**Chain:** Solana  
**Purpose:** Testing patterns for Solana programs — LiteSVM unit tests, Mollusk harness, Bankrun integration tests, test fixture patterns.  
**Required keys:** None  
**Use when:** Writing tests for a Solana program or setting up a testing pipeline.

---

## solana-trading-skill
**Chain:** Solana  
**Purpose:** General Solana trading patterns — transaction construction, priority fees, compute budget, versioned transactions, lookup tables.  
**Required keys:** Solana wallet keypair  
**Use when:** Building custom Solana trading scripts that interact with multiple DEX programs.

---

## solana-wallet-skill
**Chain:** Solana  
**Purpose:** Solana wallet operations — SOL balance, SPL token accounts, token transfers, associated token accounts, close empty accounts.  
**Required keys:** Solana wallet keypair (from `solana.json`)  
**Use when:** Checking balances, sending SOL or SPL tokens, managing token accounts.

---

## uniswap-skill
**Chain:** Ethereum, Base, Arbitrum, Polygon, Optimism (Uniswap V3 / V4)  
**Purpose:** Token swaps, pool quotes, concentrated liquidity position management, fee tier selection, and on-chain swap execution via Uniswap V3/V4.  
**Required keys:** `EVM_PRIVATE_KEY`, `ETH_RPC_URL`  
**Use when:** Swapping ERC-20 tokens on Uniswap, providing concentrated liquidity, checking pool prices and depth, or building LP strategies.
