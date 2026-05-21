# Jelly Enhancement Verification Checklist

## Introduction
This checklist helps you verify that all the enhancements to Jelly have been properly implemented and are working correctly. Follow these steps to test each feature.

## Prerequisites
Before starting, ensure:
- Node.js v18+ is installed
- npm v9+ is installed
- Git is installed
- Claude Code CLI is installed (`npm install -g @anthropic-ai/claude-code`)
- You have run `bash setup.sh` at least once
- You have added API keys to `.env` (Anthropic or OpenRouter)
- Wallets are generated (check `~/.jelly-claude/wallets/`)

## Section 1: Setup and Installation

### 1.1 One-Click Setup
- [ ] Run `bash setup.sh`
- [ ] Verify all checks pass (Node.js, npm, git, Claude Code)
- [ ] Verify `.env` file created from `.env.example`
- [ ] Verify wallet files generated:
  - `~/.jelly-claude/wallets/solana.json`
  - `~/.jelly-claude/wallets/evm.json`
- [ ] Verify skills installed:
  - `ls ~/.claude/skills/` should show 38 directories
- [ ] Verify agents installed:
  - `ls ~/.claude/agents/` should show agent files

### 1.2 Post-Setup Verification
- [ ] Launch agent: `bash jelly-claude.sh`
- [ ] Octopus Ink visual appears (ink spread animation with brand colors)
- [ ] System load indicator visible
- [ ] Model tier displayed (Opus/Sonnet/Haiku)
- [ ] Agent ready confirmation message

## Section 2: Documentation

### 2.1 CLAUDE.md
- [ ] Open `/Users/tj/Documents/jelly-claude/CLAUDE.md`
- [ ] Verify documentation for all 12 modules present
- [ ] Check CPU-aware auto-dispatching section
- [ ] Verify Jelly terminal command documentation
- [ ] Check Octopus Ink visual description
- [ ] Verify one-click setup instructions
- [ ] Check prediction-focused architecture section
- [ ] Verify additional features listed (10+)

### 2.2 README.md
- [ ] Open `/Users/tj/Documents/jelly-claude/README.md`
- [ ] Verify project overview
- [ ] Check quick start instructions
- [ ] Verify API key configuration
- [ ] Check enhanced modules section with usage examples
- [ ] Verify CPU-aware dispatching section
- [ ] Check Jelly terminal command section
- [ ] Verify Octopus Ink visual description
- [ ] Check one-click setup section
- [ ] Verify prediction-focused architecture
- [ ] Check additional features list

### 2.3 PLAN.md
- [ ] Open `/Users/tj/Documents/jelly-claude/PLAN.md`
- [ ] Verify comprehensive implementation plan
- [ ] Check completed sections
- [ ] Verify technical architecture
- [ ] Check future roadmap

### 2.4 TEST_PLAN.md
- [ ] Open `/Users/tj/Documents/jelly-claude/TEST_PLAN.md`
- [ ] Verify comprehensive test coverage
- [ ] Check all module tests listed
- [ ] Verify performance tests
- [ ] Check security tests

## Section 3: Module Functionality

### 3.1 Market Module
- [ ] Run: `node modules/market/run.mjs predict --text "Test prediction" --chain solana`
  - Verify JSON output with `jellyScore` (0-100)
  - Verify `suggestion` with position sizing
- [ ] Run: `node modules/market/run.mjs batchPredict --inputs '[{"text":"Test 1","chain":"solana"}]'`
  - Verify batch processing works
- [ ] Run: `node modules/market/run.mjs scoreMarket --question "Test market?" --chain solana`
  - Verify market scoring functionality

### 3.2 Portfolio Module
- [ ] Run: `node modules/portfolio/run.mjs snapshot --solana <your-address>`
  - Verify portfolio snapshot with balances
- [ ] Run: `node modules/portfolio/run.mjs pnl`
  - Verify P&L calculation works

### 3.3 Scanner Module
- [ ] Run: `node modules/scanner/run.mjs newTokens --chain solana`
  - Verify new token discovery
- [ ] Run: `node modules/scanner/run.mjs volumeSpike --chain solana --minVolume 100000`
  - Verify volume spike detection

### 3.4 Prediction Markets Module
- [ ] Run: `node modules/prediction-markets/run.mjs polymarkets --limit 5`
  - Verify Polymarket integration with Jelly Scores
- [ ] Run: `node modules/prediction-markets/run.mjs arbitrage --query "BTC"`
  - Verify arbitrage detection

### 3.5 DeFi Module
- [ ] Run: `node modules/defi/run.mjs yields --chain solana --minApy 20`
  - Verify yield comparison
- [ ] Run: `node modules/defi/run.mjs liquidity --mintA <SOL-address> --mintB <USDC-address>`
  - Verify liquidity analysis

### 3.6 Bridge Module
- [ ] Run: `node modules/bridge/run.mjs routes --fromChain 1 --toChain 56 --fromToken 0x... --toToken 0x... --fromAmount 100000000`
  - Verify bridge route discovery
- [ ] Run: `node modules/bridge/run.mjs compareBridges --fromChain 1 --toChain 56 --fromAmount 100000000`
  - Verify bridge comparison

## Section 4: CPU-Aware Auto-Dispatching

### 4.1 Parallel Execution
- [ ] Run: `node modules/market/run.mjs predict --text "Test" --chain solana & node modules/scanner/run.mjs newTokens --chain solana & node modules/portfolio/run.mjs snapshot --solana <address> & wait`
- [ ] Verify all modules complete successfully
- [ ] Monitor system resources (CPU/memory usage should be reasonable)
- [ ] Verify no system overload or crashes

### 4.2 Adaptive Scaling
- [ ] Run multiple parallel operations
- [ ] Observe system scaling behavior
- [ ] Verify performance under load

## Section 5: Jelly Terminal Command

### 5.1 Basic Commands
- [ ] Run: `<Jelly> agents`
  - Verify list of 47 agents displayed
- [ ] Run: `<Jelly> skills`
  - Verify list of 38 skills displayed
- [ ] Run: `<Jelly> status`
  - Verify system status with resource usage
- [ ] Run: `<Jelly> predict "Solana TVL surge" solana`
  - Verify quick prediction works

### 5.2 Module Execution
- [ ] Run: `<Jelly> run modules/market/predict --text "Test" --chain solana`
  - Verify module execution via terminal command

### 5.3 Scanner Queries
- [ ] Run: `<Jelly> scan newTokens --chain bnb`
  - Verify scanner module execution

## Section 6: Jelly Octopus Ink Visual

### 6.1 Splash Screen
- [ ] Launch: `bash jelly-claude.sh`
- [ ] Verify ink spread animation appears
- [ ] Verify color gradients with brand colors
- [ ] Verify system load indicator visible
- [ ] Verify model tier displayed (Opus/Sonnet/Haiku)
- [ ] Verify agent ready confirmation

### 6.2 Disable Splash
- [ ] Run: `JELLY_NO_SPLASH=1 bash jelly-claude.sh`
- [ ] Verify no splash screen
- [ ] Verify agent launches directly

## Section 7: One-Click Setup

### 7.1 Setup Wizard
- [ ] Run: `bash setup.sh`
- [ ] Verify all checks pass
- [ ] Verify .env created
- [ ] Verify wallets generated
- [ ] Verify skills and agents installed

### 7.2 Reset Functionality
- [ ] Run: `npm run reset -- --logs-only`
  - Verify logs cleared
- [ ] Run: `npm run reset -- --full`
  - Verify clean state (only .env remains)

## Section 8: Prediction Architecture

### 8.1 Jelly Score Framework
- [ ] Run prediction: `node modules/market/run.mjs predict --text "Test" --chain solana`
- [ ] Verify `jellyScore` in range 0-100
- [ ] Verify position sizing suggestion:
  - 80-100: Full position
  - 60-79: Half position
  - 0-59: No trade

### 8.2 Edge Score
- [ ] Verify `edgeScore` in prediction output
- [ ] Verify probability advantage calculation

### 8.3 Market Divergence
- [ ] Run: `node modules/prediction-markets/run.mjs compareMarkets --query "BTC"`
- [ ] Verify cross-platform price comparison
- [ ] Verify arbitrage opportunities detection (>3% spread)

### 8.4 Sentiment Integration
- [ ] Run prediction with sentiment: `node modules/market/run.mjs predict --text "Positive news about Solana" --chain solana`
- [ ] Verify sentiment affects Jelly Score

## Section 9: Additional Features

### 9.1 Model Selection
- [ ] Test with ANTHROPIC_API_KEY: `ANTHROPIC_API_KEY=sk-... bash jelly-claude.sh --version`
  - Verify Opus/Sonnet/Haiku models
- [ ] Test with OPENROUTER_API_KEY: `OPENROUTER_API_KEY=sk-... bash jelly-claude.sh --version`
  - Verify free model tiers

### 9.2 Caching
- [ ] Run same prediction twice: `node modules/market/run.mjs predict --text "Test" --chain solana`
- [ ] Verify second execution faster (cache hit)

### 9.3 Circuit Breakers
- [ ] Simulate API failure (block endpoint)
- [ ] Verify circuit breaker trips
- [ ] Verify graceful error message

### 9.4 Parallel Execution
- [ ] Already tested in Section 4

### 9.5 Advanced Caching
- [ ] Verify TTL-based caching in modules
- [ ] Verify cache invalidation

### 9.6 Memory System
- [ ] Set value: `node modules/market/run.mjs setTestValue --key test --value 123`
- [ ] Get value: `node modules/market/run.mjs getTestValue --key test`
- [ ] Verify persistence across sessions

### 9.7 Telegram Integration
- [ ] Launch with Telegram: `TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=... bash jelly-claude.sh --telegram`
- [ ] Verify Telegram bridge starts
- [ ] Test commands from Telegram

### 9.8 Voice Interface
- [ ] Launch with voice: `bash jelly-claude.sh --voice`
- [ ] Verify voice interface active
- [ ] Test voice commands

### 9.9 Extension System
- [ ] Create extension: `mkdir -p ~/.claude/extensions/my-extension`
- [ ] Add extension files
- [ ] Verify extension loaded

## Section 10: Performance and Security

### 10.1 Performance
- [ ] Run load test: `for i in {1..100}; do node modules/market/run.mjs predict --text "Test $i" --chain solana & done; wait`
- [ ] Verify system stability
- [ ] Verify reasonable completion time

### 10.2 Security
- [ ] Verify no private keys in output: `node modules/market/run.mjs predict --text "Test" --chain solana 2>&1 | grep -i "private"`
- [ ] Verify wallet file permissions: `ls -la ~/.jelly-claude/wallets/solana.json`
  - Should be 600 (owner read/write only)
- [ ] Test input validation: `node modules/market/run.mjs predict --text "; rm -rf /" --chain solana`
  - Should not execute malicious commands

## Section 11: Documentation

### 11.1 Documentation Completeness
- [ ] Read CLAUDE.md — verify all modules documented
- [ ] Read README.md — verify features and usage
- [ ] Read PLAN.md — verify implementation plan
- [ ] Read TEST_PLAN.md — verify test coverage

## Conclusion

If all checks pass, the Jelly enhancement implementation is complete and working correctly. The system is ready for production use, community contribution, and further development.

## Troubleshooting

### Common Issues
- **Missing wallets**: Run `bash setup.sh` again
- **Skills/agents not installed**: Run `npm run install-skills` and `npm run install-agents`
- **API failures**: Check `.env` configuration and API keys
- **Permission issues**: Ensure `~/.jelly-claude/` has proper permissions (700)

### Support
For issues and questions, refer to:
- TROUBLESHOOTING.md in the project directory
- GitHub Issues: github.com/jelly-chain/jelly-claude/issues
- Discord: discord.gg/jellychain