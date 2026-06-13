# Jelly-Claude — Agents Reference (37 agents)

Agents are installed at `~/.claude/agents/<agent-name>.md`.  
Invoke with `/agent <agent-name>`.

---

## airdrop-hunter
**Purpose:** Finds and claims Solana airdrops — checks eligibility across active airdrop campaigns, tracks claim windows, and helps execute claims.  
**Required skills:** `solana-wallet-skill`, `helius-skill`  
**Required keys:** Solana wallet  
**Example prompts:**
- "Check if my wallet is eligible for any current Solana airdrops"
- "Claim the JTO airdrop for my wallet"
- "What airdrops are active right now?"

---

## auto-hedge-suggester
**Purpose:** Suggests hedging trades — opposite positions on correlated markets or DeFi-based hedges — to reduce net portfolio delta exposure below a configurable threshold (default: 3% of portfolio).  
**Required skills:** `polymarket-skill`, `kalshi-skill`, `predict-fun-skill`, `prediction-skill`, `jupiter-skill`, `solana-wallet-skill`  
**Required keys:** `POLYMARKET_API_KEY`, `KALSHI_API_KEY`, `PREDICT_API_KEY`, `EVM_PRIVATE_KEY`, Solana wallet  
**Example prompts:**
- "Suggest hedges for my current Polymarket and Kalshi positions"
- "My net delta on BTC price markets is too high — how do I hedge it cheaply?"
- "Find the most cost-effective way to reduce my exposure to the Fed rate decision market"
- "Run a full hedge analysis and propose the minimum trades to bring all deltas below 3%"

---

## base-dex-trader
**Purpose:** Swaps and liquidity on Base chain — Aerodrome (ve(3,3)) and Uniswap V3 concentrated liquidity positions.  
**Required skills:** `base-skill`, `bnb-wallet-skill`  
**Required keys:** `EVM_PRIVATE_KEY`  
**Example prompts:**
- "Swap 0.1 ETH for USDC on Aerodrome"
- "Show me the best Base DEX route for ETH → cbBTC"
- "Add liquidity to the ETH/USDC pool on Aerodrome"

---

## birdeye-analyst
**Purpose:** Token analytics and signal generation using the Birdeye API — price trends, holder analysis, top traders, volume anomalies.  
**Required skills:** `birdeye-skill`, `dexscreener-skill`  
**Required keys:** `BIRDEYE_API_KEY`  
**Example prompts:**
- "Analyse the top holders and recent whale activity for JUP"
- "Show me tokens with unusual volume spikes in the last hour on Solana"
- "What's the Birdeye trend score for this token: <address>"

---

## bnb-data-fetcher
**Purpose:** On-chain data queries for BNB Chain — wallet balances, transaction history, token holdings, BSC contract data.  
**Required skills:** `bnb-wallet-skill`, `bnbchain-mcp-skill`  
**Required keys:** `EVM_PRIVATE_KEY`, `BNBCHAIN_API_KEY`  
**Example prompts:**
- "Show me the last 20 transactions for my BNB wallet"
- "What tokens do I hold on BNB Chain?"
- "Fetch the current BNB price and my wallet's USD value"

---

## bnb-dex-trader
**Purpose:** Token swaps on BNB Chain — PancakeSwap V2/V3 routing, slippage management, best execution.  
**Required skills:** `bnb-trading-skill`, `bnb-wallet-skill`  
**Required keys:** `EVM_PRIVATE_KEY`  
**Example prompts:**
- "Swap 10 USDT for BNB on PancakeSwap"
- "What's the best route to swap CAKE for ETH on BNB Chain?"
- "Show me the current price impact for buying 500 USDT of TOKEN"

---

## cross-chain-bridge
**Purpose:** Bridges assets between chains — finds the best bridge route, estimates fees, and guides execution via Stargate, deBridge, or comparable protocols.  
**Required skills:** `bnb-wallet-skill`, `solana-wallet-skill`  
**Required keys:** `EVM_PRIVATE_KEY`, Solana wallet  
**Example prompts:**
- "Bridge 100 USDC from Polygon to BNB Chain"
- "What's the cheapest way to move ETH from Ethereum to Base?"
- "Bridge my SOL to BNB Chain"

---

## cross-market-arb-hunter
**Purpose:** Monitors the same event simultaneously across Polymarket, Kalshi, and predict.fun. Flags price divergences above a configurable threshold and suggests the highest-EV trade direction, computing net spread after all platform fees.  
**Required skills:** `polymarket-skill`, `kalshi-skill`, `predict-fun-skill`, `prediction-skill`  
**Required keys:** `POLYMARKET_API_KEY`, `KALSHI_API_KEY`, `PREDICT_API_KEY`, `EVM_PRIVATE_KEY`  
**Example prompts:**
- "Find arb opportunities between Polymarket and Kalshi on the next Fed rate decision"
- "Scan all three platforms for BTC price markets expiring this month"
- "Alert me when any market pair has a net spread above 4%"
- "Is there a profitable arb on the 2026 US election markets?"

---

## defi-tvl-predictor
**Purpose:** Tracks DeFiLlama TVL changes on key protocols and uses TVL momentum as a leading indicator for "DeFi ecosystem" prediction markets on Polymarket and Kalshi.  
**Required skills:** `jelly-skill`, `prediction-skill`, `polymarket-skill`, `kalshi-skill`  
**Required keys:** `POLYMARKET_API_KEY`, `KALSHI_API_KEY`  
**Example prompts:**
- "What's the TVL momentum for Solana this week and how does it affect Polymarket markets?"
- "Check if Aave TVL is bullish and overlay on any Kalshi DeFi markets"
- "Show me protocols with the highest TVL gains in 24h and map them to prediction markets"

---

## dexscreener-scanner
**Purpose:** New token pair discovery and screening — recently launched pairs, volume surges, trending tokens, rug indicators.  
**Required skills:** `dexscreener-skill`  
**Required keys:** None  
**Example prompts:**
- "Show me the newest token launches on Solana in the last 30 minutes"
- "Find pairs on BNB Chain with volume over $500K in the last hour"
- "Scan for trending new tokens and flag any with honeypot risk"

---

## event-risk-scorer
**Purpose:** Given any upcoming event (election, Fed meeting, sports match, protocol upgrade), enumerates risk factors and produces a structured risk report with a Jelly Risk Score (0–100). Designed to precede any prediction market trade.  
**Required skills:** `prediction-skill`, `polymarket-skill`, `kalshi-skill`, `jelly-skill`  
**Required keys:** `POLYMARKET_API_KEY`, `KALSHI_API_KEY`  
**Example prompts:**
- "Score the risk for betting on the next Fed rate decision"
- "Risk report for the next US election prediction market"
- "How risky is the BTC $100K market on Kalshi before I trade?"

---

## four-meme-launcher
**Purpose:** Launches meme tokens on four.meme (BSC) — token creation, bonding curve management, graduation monitoring.  
**Required skills:** `bnb-trading-skill`, `bnb-wallet-skill`  
**Required keys:** `EVM_PRIVATE_KEY`  
**Example prompts:**
- "Launch a new meme token on four.meme called JELLYBEAN"
- "Check the bonding curve progress for my four.meme token"
- "Buy 0.1 BNB worth of a new four.meme launch"

---

## hyperliquid-trader
**Purpose:** Perpetuals trading on Hyperliquid — market and limit orders, leverage management, position monitoring, funding rate analysis.  
**Required skills:** `hyperliquid-skill`  
**Required keys:** `EVM_PRIVATE_KEY`  
**Example prompts:**
- "Open a 2x long on BTC-PERP for $500 on Hyperliquid"
- "Show my current Hyperliquid positions and P&L"
- "What's the current funding rate on ETH-PERP?"

---

## jelly-predictions-agent
**Purpose:** Cross-references jellychain.fun on-chain data (TVL, volume, protocol metrics) with prediction market prices on Polymarket and Kalshi to find mispriced markets.  
**Required skills:** `jelly-skill`, `polymarket-skill`, `kalshi-skill`, `prediction-skill`  
**Required keys:** `POLYMARKET_API_KEY`, `KALSHI_API_KEY`  
**Example prompts:**
- "Find Polymarket markets about Solana TVL and check current jellychain.fun TVL data"
- "Is there a Kalshi market mispriced relative to current DeFi data?"
- "Give me the Jelly Score for betting YES on a Solana ecosystem market"

---

## jelly-score-optimizer
**Purpose:** Takes a market question and runs it through the full JellyScore pipeline: keyword scoring, on-chain volume check, cross-market price comparison, risk assessment. Returns a structured YES/NO recommendation with Jelly Score (0–100) and confidence tier.  
**Required skills:** `prediction-skill`, `polymarket-skill`, `kalshi-skill`, `jelly-skill`  
**Required keys:** `POLYMARKET_API_KEY`, `KALSHI_API_KEY`  
**Example prompts:**
- "Score this market: Will ETH reach $5,000 by end of 2025?"
- "Run a Jelly Score on the Fed rate cut market on Kalshi"
- "Analyze Polymarket market ID 0xabc123 and give me a full conviction report"
- "Is there arbitrage between Polymarket and Kalshi on the BTC price market?"

---

## jupiter-trader
**Purpose:** Token swaps, DCA, and limit orders on Solana via Jupiter aggregator — best route execution, price impact checks.  
**Required skills:** `jupiter-skill`, `solana-wallet-skill`  
**Required keys:** Solana wallet keypair  
**Example prompts:**
- "Swap 1 SOL for USDC via Jupiter"
- "Set up a DCA to buy $50 of JUP every day for 30 days"
- "Place a limit order to buy SOL at $120"

---

## kalshi-polymarket-spreader
**Purpose:** Specialised cross-market arbitrage agent for Kalshi ↔ Polymarket pairs. Handles different collateral types (USD vs USDC) and fee structures to compute true net arbitrage after all costs.  
**Required skills:** `kalshi-skill`, `polymarket-skill`, `prediction-skill`  
**Required keys:** `KALSHI_API_KEY`, `KALSHI_API_SECRET`, `POLYMARKET_API_KEY`, `POLYMARKET_SECRET`, `POLYMARKET_PASSPHRASE`, `EVM_PRIVATE_KEY`  
**Example prompts:**
- "Find Kalshi↔Polymarket arb on the Fed rate decision next month"
- "Is there a profitable spread between Kalshi and Polymarket on the 2026 election?"
- "Show me all Kalshi markets with a Polymarket equivalent and net spread > 3%"

---

## kalshi-trader
**Purpose:** Binary prediction market trading on Kalshi — browse events, place yes/no bets, manage open positions, check account balance.  
**Required skills:** `kalshi-skill`, `prediction-skill`  
**Required keys:** `KALSHI_API_KEY`, `KALSHI_API_SECRET`  
**Example prompts:**
- "Show me the top-volume Kalshi markets right now"
- "Buy YES on the Fed rate cut market for $100"
- "What are my open Kalshi positions?"

---

## meteora-launcher
**Purpose:** DLMM liquidity provisioning on Meteora — create and manage concentrated liquidity positions with dynamic fees.  
**Required skills:** `meteora-skill`, `solana-wallet-skill`  
**Required keys:** Solana wallet, `HELIUS_API_KEY`  
**Example prompts:**
- "Add liquidity to the SOL/USDC Meteora DLMM pool with a tight range"
- "Show me the fees I've earned from my Meteora positions"
- "Remove my liquidity from the BONK/SOL pool"

---

## mev-arbitrage
**Purpose:** Solana MEV and arbitrage — identifies price discrepancies across DEXes, constructs arbitrage transactions, manages priority fees.  
**Required skills:** `jupiter-skill`, `raydium-skill`, `solana-trading-skill`  
**Required keys:** Solana wallet, `HELIUS_API_KEY`  
**Example prompts:**
- "Find current arbitrage opportunities between Raydium and Orca for SOL/USDC"
- "What's the current Jito tip cost for priority transactions?"
- "Construct an arb transaction for the price gap on TOKEN/USDC"

---

## multi-chain-risk-dashboard
**Purpose:** Aggregates all open prediction market positions (Polymarket, Kalshi, predict.fun) and DeFi positions (Raydium, Meteora, Orca) into a single risk dashboard showing total exposure, VaR estimate, and concentration warnings.  
**Required skills:** `polymarket-skill`, `kalshi-skill`, `predict-fun-skill`, `solana-wallet-skill`, `bnb-wallet-skill`, `birdeye-skill`, `prediction-skill`  
**Required keys:** `POLYMARKET_API_KEY`, `KALSHI_API_KEY`, `PREDICT_API_KEY`, `HELIUS_API_KEY`, `BIRDEYE_API_KEY`, `EVM_PRIVATE_KEY`, Solana wallet  
**Example prompts:**
- "Show me my full risk dashboard across all prediction and DeFi platforms"
- "What's my total exposure right now and am I over the concentration limits?"
- "Which of my positions are correlated with each other?"

---

## multisig-manager
**Purpose:** Solana multisig management via Squads Protocol — create vaults, propose transactions, approve/execute multisig ops.  
**Required skills:** `solana-wallet-skill`, `helius-skill`  
**Required keys:** Solana wallet  
**Example prompts:**
- "Create a 2-of-3 multisig vault with these three public keys"
- "Propose a SOL transfer from our Squads vault"
- "Show me pending transactions waiting for approval in our multisig"

---

## nft-minter
**Purpose:** NFT minting and collection management via Metaplex — create single NFTs, set up Candy Machines, mint collections.  
**Required skills:** `metaplex-skill`, `solana-wallet-skill`  
**Required keys:** Solana wallet  
**Example prompts:**
- "Mint an NFT with this metadata: name, image URL, attributes"
- "Set up a Candy Machine for a 1000-piece collection"
- "Update the metadata for my NFT at address <address>"

---

## on-chain-analyst
**Purpose:** Deep on-chain data analysis across chains — wallet profiling, token flow tracing, protocol TVL tracking, liquidity analysis.  
**Required skills:** `helius-skill`, `jelly-skill`, `birdeye-skill`, `dexscreener-skill`  
**Required keys:** `HELIUS_API_KEY`, `BIRDEYE_API_KEY`  
**Example prompts:**
- "Trace all token outflows from this wallet in the last 7 days"
- "Which Solana protocols gained the most TVL this week?"
- "Analyse the liquidity depth on JUP/USDC across all DEXes"

---

## orca-market-maker
**Purpose:** Market making on Orca Whirlpool — concentrated liquidity positions, fee collection, range management and rebalancing.  
**Required skills:** `solana-trading-skill`, `solana-wallet-skill`, `helius-skill`  
**Required keys:** Solana wallet, `HELIUS_API_KEY`  
**Example prompts:**
- "Open a concentrated liquidity position on the SOL/USDC Orca Whirlpool"
- "Show my current Orca positions and uncollected fees"
- "Rebalance my Orca position as price moved out of range"

---

## polymarket-trader
**Purpose:** Prediction market trading on Polymarket — browse markets, place LIMIT/MARKET orders, manage positions and proxy wallet.  
**Required skills:** `polymarket-skill`, `prediction-skill`  
**Required keys:** `POLYMARKET_API_KEY`, `POLYMARKET_SECRET`, `POLYMARKET_PASSPHRASE`, EVM wallet (Polygon/USDC)  
**Example prompts:**
- "Show me the top-volume open markets on Polymarket"
- "Buy YES on the Fed rate decision market for $50"
- "What are my current Polymarket positions and P&L?"

---

## portfolio-tracker
**Purpose:** Multi-chain portfolio view — aggregates token holdings, USD values, and recent changes across Solana, BNB Chain, Polygon, and Base.  
**Required skills:** `solana-wallet-skill`, `bnb-wallet-skill`, `birdeye-skill`  
**Required keys:** Solana wallet, `EVM_PRIVATE_KEY`, `BIRDEYE_API_KEY`  
**Example prompts:**
- "Show me my full portfolio across all chains"
- "What's my total USD value across Solana and BNB Chain?"
- "Which of my positions has performed best this week?"

---

## predict-fun-trader
**Purpose:** CLOB prediction market trading on predict.fun (BNB Chain, USDT) — browse markets, place LIMIT/MARKET orders, manage positions, redeem winnings.  
**Required skills:** `predict-fun-skill`, `bnb-wallet-skill`, `prediction-skill`, `jelly-skill`  
**Required keys:** `PREDICT_API_KEY` (mainnet), `EVM_PRIVATE_KEY`  
**Example prompts:**
- "Show me the top open markets on predict.fun by volume"
- "Buy YES on market 42 for $20 USDT at 0.65"
- "Check my open positions and P&L on predict.fun"

---

## prediction-market-monitor
**Purpose:** Monitors prediction market prices across Polymarket, Kalshi, and predict.fun — tracks price movements, alerts on threshold breaches, finds cross-market discrepancies.  
**Required skills:** `polymarket-skill`, `kalshi-skill`, `predict-fun-skill`, `prediction-skill`  
**Required keys:** `POLYMARKET_API_KEY`, `KALSHI_API_KEY`, `PREDICT_API_KEY`  
**Example prompts:**
- "Monitor the ETH price market on Polymarket and alert me if YES drops below 0.40"
- "Compare the same event across Polymarket and predict.fun — is there a pricing gap?"
- "Show me all prediction markets where YES < 0.20 (potential value)"

---

## pump-launcher
**Purpose:** Token launches on pump.fun (Solana) — creates tokens, monitors bonding curve, manages buying strategy around launch.  
**Required skills:** `pumpfun-skill`, `solana-wallet-skill`, `jupiter-skill`  
**Required keys:** Solana wallet  
**Example prompts:**
- "Launch a new token on pump.fun called MOON with this description and image"
- "Buy 0.5 SOL worth of this pump.fun token at launch"
- "Track the bonding curve progress for my token and alert me at 80% fill"

---

## raydium-lp
**Purpose:** Liquidity provisioning on Raydium — AMM pool creation, Standard AMM LP, CLMM concentrated liquidity positions.  
**Required skills:** `raydium-skill`, `solana-wallet-skill`  
**Required keys:** Solana wallet, `HELIUS_API_KEY`  
**Example prompts:**
- "Create a new Raydium AMM pool for TOKEN/SOL"
- "Add liquidity to the RAY/USDC CLMM pool in the 120-130 range"
- "Show my current Raydium LP positions and fees earned"

---

## sentiment-tracker
**Purpose:** Aggregates social signals (news, Twitter/X, Reddit) for a prediction market topic. Scores net sentiment (−100 to +100) and overlays it on current YES/NO prices to identify divergence between crowd sentiment and market price.  
**Required skills:** `prediction-skill`, `polymarket-skill`, `kalshi-skill`  
**Required keys:** `POLYMARKET_API_KEY`, `KALSHI_API_KEY`  
**Example prompts:**
- "Track sentiment for 'Federal Reserve rate cut' and overlay on Kalshi market"
- "What's the social sentiment for Solana price markets right now?"
- "Is there a sentiment divergence on the BTC ETF approval market?"

---

## solana-data-fetcher
**Purpose:** Solana on-chain data queries — account info, transaction parsing, token holder counts, program state, historical data via Helius.  
**Required skills:** `helius-skill`, `solana-wallet-skill`  
**Required keys:** `HELIUS_API_KEY`  
**Example prompts:**
- "Parse the last 10 transactions for this Solana address"
- "How many holders does this SPL token have?"
- "Fetch the current state of this Anchor program account"

---

## solana-flow-analyst
**Purpose:** Real-time token flow analysis on Solana — identifies net accumulation vs. distribution on any SPL token over a rolling window using Helius enhanced transactions API. Produces a Flow Score (0–100) used as a Jelly Score signal component.  
**Required skills:** `helius-skill`, `birdeye-skill`, `prediction-skill`, `solana-wallet-skill`  
**Required keys:** `HELIUS_API_KEY`, `BIRDEYE_API_KEY`  
**Example prompts:**
- "Analyze the last 24h flow for SOL and tell me if whales are accumulating"
- "Is JUP seeing exchange inflows right now? Is there sell pressure?"
- "Flow analysis for BONK over the last 4 hours — smart money or retail?"

---

## token-security-auditor
**Purpose:** Token security screening — checks for honeypot, mint authority, freeze authority, top holder concentration, liquidity lock status.  
**Required skills:** `birdeye-skill`, `dexscreener-skill`, `solana-wallet-skill`  
**Required keys:** `BIRDEYE_API_KEY`  
**Example prompts:**
- "Audit this Solana token address for rug-pull risk"
- "Is the mint authority revoked for this token?"
- "Check top-10 holder concentration for this BNB Chain token"

---

## wallet-watcher
**Purpose:** Whale wallet monitoring — tracks specified wallets across chains, alerts on significant token movements, DEX trades, or new positions.  
**Required skills:** `helius-skill`, `birdeye-skill`, `bnb-wallet-skill`  
**Required keys:** `HELIUS_API_KEY`, `BIRDEYE_API_KEY`  
**Example prompts:**
- "Watch this whale wallet and tell me every time they make a trade over $10K"
- "What did this wallet buy in the last 24 hours?"
- "Find the top Solana wallets holding JUP and show their recent activity"

---

## whale-signal-predictor
**Purpose:** Watches configured whale wallets via Helius; when a whale enters a large position on a token correlated with a prediction market event, fires a JellyScore re-evaluation and produces a structured signal alert.  
**Required skills:** `helius-skill`, `prediction-skill`, `birdeye-skill`, `jelly-skill`  
**Required keys:** `HELIUS_API_KEY`, `BIRDEYE_API_KEY`, Solana wallet (read-only)  
**Example prompts:**
- "Monitor these whale wallets and alert me on any SOL/JUP move over $100K"
- "Who are the top 10 most profitable Solana wallets trading JUP right now?"
- "A whale just bought $500K of SOL — which prediction markets are correlated?"

---

## yield-optimizer
**Purpose:** DeFi yield optimization — compares APY across Raydium, Meteora, Orca, Aerodrome, and other protocols to find the best yield for a given asset pair.  
**Required skills:** `raydium-skill`, `meteora-skill`, `base-skill`, `solana-wallet-skill`  
**Required keys:** Solana wallet, `EVM_PRIVATE_KEY`  
**Example prompts:**
- "Where can I get the best yield for SOL/USDC liquidity right now?"
- "Compare Meteora vs Raydium APY for the BONK/SOL pair"
- "Show me all Aerodrome pools with APY over 20% and enough liquidity"
