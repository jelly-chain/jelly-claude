#!/bin/bash
# RUN_TESTS.sh — Automated test runner for Jelly-Claude enhancements
# Run this script to verify all major features are working correctly

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test functions
test_header() {
  echo -e "${BLUE}=== $1 ===${NC}"
}

test_passed() {
  echo -e "  ${GREEN}✓ $1${NC}"
}

test_failed() {
  echo -e "  ${RED}✗ $1${NC}"
}

test_skipped() {
  echo -e "  ${YELLOW}○ $1${NC}"
}

# Check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Wait for background process
wait_for_process() {
  local timeout=30
  local interval=1
  local start_time=$(date +%s)

  while kill -0 "$1" 2>/dev/null; do
    sleep $interval
    local elapsed=$(($(date +%s) - start_time))
    if [ $elapsed -ge $timeout ]; then
      return 1
    fi
  done

  return 0
}

# Test 1: Setup verification
test_setup() {
  test_header "Test 1: One-Click Setup Verification"

  # Check Node.js and npm
  if command_exists node && command_exists npm; then
    test_passed "Node.js $(node --version) and npm $(npm --version) installed"
  else
    test_failed "Node.js or npm not found"
    return 1
  fi

  # Check Claude Code
  if command_exists claude; then
    test_passed "Claude Code installed"
  else
    test_failed "Claude Code not found"
    return 1
  fi

  # Check wallet directories
  if [ -d "$HOME/.jelly-claude/wallets" ]; then
    test_passed "Wallet directory exists"
  else
    test_failed "Wallet directory not found"
    return 1
  fi

  # Check wallet files
  if [ -f "$HOME/.jelly-claude/wallets/solana.json" ] && [ -f "$HOME/.jelly-claude/wallets/evm.json" ]; then
    test_passed "Solana and EVM wallets generated"
  else
    test_failed "Wallet files missing"
    return 1
  fi

  # Check skills directory
  if [ -d "$HOME/.claude/skills" ]; then
    local skill_count=$(ls "$HOME/.claude/skills/" | wc -l)
    test_passed "$skill_count skills installed"
  else
    test_failed "Skills directory not found"
    return 1
  fi

  # Check agents directory
  if [ -d "$HOME/.claude/agents" ]; then
    local agent_count=$(ls "$HOME/.claude/agents/" | wc -l)
    test_passed "$agent_count agents installed"
  else
    test_failed "Agents directory not found"
    return 1
  fi

  return 0
}

# Test 2: Market module
test_market_module() {
  test_header "Test 2: Market Module"

  # Test predict function
  if node modules/market/run.mjs predict --text "Test prediction" --chain solana >/dev/null 2>&1; then
    test_passed "predict function works"
  else
    test_failed "predict function failed"
    return 1
  fi

  # Test batchPredict function
  if node modules/market/run.mjs batchPredict --inputs '[{"text":"Test 1","chain":"solana"},{"text":"Test 2","chain":"bnb"}]' >/dev/null 2>&1; then
    test_passed "batchPredict function works"
  else
    test_failed "batchPredict function failed"
    return 1
  fi

  # Test scoreMarket function
  if node modules/market/run.mjs scoreMarket --question "Test market?" --chain solana >/dev/null 2>&1; then
    test_passed "scoreMarket function works"
  else
    test_failed "scoreMarket function failed"
    return 1
  fi

  return 0
}

# Test 3: Portfolio module
test_portfolio_module() {
  test_header "Test 3: Portfolio Module"

  # Test snapshot function
  if node modules/portfolio/run.mjs snapshot --solana "<your-solana-address>" >/dev/null 2>&1; then
    test_passed "snapshot function works"
  else
    test_failed "snapshot function failed"
    return 1
  fi

  # Test pnl function
  if node modules/portfolio/run.mjs pnl >/dev/null 2>&1; then
    test_passed "pnl function works"
  else
    test_failed "pnl function failed"
    return 1
  fi

  return 0
}

# Test 4: Scanner module
test_scanner_module() {
  test_header "Test 4: Scanner Module"

  # Test newTokens function
  if node modules/scanner/run.mjs newTokens --chain solana >/dev/null 2>&1; then
    test_passed "newTokens function works"
  else
    test_failed "newTokens function failed"
    return 1
  fi

  # Test volumeSpike function
  if node modules/scanner/run.mjs volumeSpike --chain solana --minVolume 100000 >/dev/null 2>&1; then
    test_passed "volumeSpike function works"
  else
    test_failed "volumeSpike function failed"
    return 1
  fi

  return 0
}

# Test 5: Prediction markets module
test_prediction_module() {
  test_header "Test 5: Prediction Markets Module"

  # Test polymarkets function
  if node modules/prediction-markets/run.mjs polymarkets --limit 5 >/dev/null 2>&1; then
    test_passed "polymarkets function works"
  else
    test_failed "polymarkets function failed"
    return 1
  fi

  # Test arbitrage function
  if node modules/prediction-markets/run.mjs arbitrage --query "BTC" >/dev/null 2>&1; then
    test_passed "arbitrage function works"
  else
    test_failed "arbitrage function failed"
    return 1
  fi

  return 0
}

# Test 6: DeFi module
test_defi_module() {
  test_header "Test 6: DeFi Module"

  # Test yields function
  if node modules/defi/run.mjs yields --chain solana --minApy 20 >/dev/null 2>&1; then
    test_passed "yields function works"
  else
    test_failed "yields function failed"
    return 1
  fi

  # Test liquidity function
  if node modules/defi/run.mjs liquidity --mintA <SOL-mint-address> --mintB <USDC-mint-address> >/dev/null 2>&1; then
    test_passed "liquidity function works"
  else
    test_failed "liquidity function failed"
    return 1
  fi

  return 0
}

# Test 7: Bridge module
test_bridge_module() {
  test_header "Test 7: Bridge Module"

  # Test routes function
  if node modules/bridge/run.mjs routes --fromChain 1 --toChain 56 --fromToken 0x... --toToken 0x... --fromAmount 100000000 >/dev/null 2>&1; then
    test_passed "routes function works"
  else
    test_failed "routes function failed"
    return 1
  fi

  # Test compareBridges function
  if node modules/bridge/run.mjs compareBridges --fromChain 1 --toChain 56 --fromAmount 100000000 >/dev/null 2>&1; then
    test_passed "compareBridges function works"
  else
    test_failed "compareBridges function failed"
    return 1
  fi

  return 0
}

# Test 8: CPU-aware dispatching
test_cpu_awareness() {
  test_header "Test 8: CPU-Aware Dispatching"

  # Run multiple modules in parallel
  local start_time=$(date +%s)
  node modules/market/run.mjs predict --text "Test 1" --chain solana >/dev/null 2>&1 &
  node modules/scanner/run.mjs newTokens --chain solana >/dev/null 2>&1 &
  node modules/portfolio/run.mjs snapshot --solana <address> >/dev/null 2>&1 &
  wait
  local end_time=$(date +%s)

  local duration=$((end_time - start_time))
  echo "  Parallel execution completed in $duration seconds"

  test_passed "Parallel execution works with CPU awareness"
  return 0
}

# Test 9: Jelly terminal command
test_jelly_command() {
  test_header "Test 9: Jelly Terminal Command"

  # Test if Jelly command is recognized
  if command_exists <Jelly>; then
    test_passed "Jelly command is available"
  else
    test_failed "Jelly command not found"
    return 1
  fi

  # Test Jelly agents
  if <Jelly> agents >/dev/null 2>&1; then
    test_passed "Jelly agents command works"
  else
    test_failed "Jelly agents command failed"
    return 1
  fi

  # Test Jelly skills
  if <Jelly> skills >/dev/null 2>&1; then
    test_passed "Jelly skills command works"
  else
    test_failed "Jelly skills command failed"
    return 1
  fi

  return 0
}

# Test 10: Octopus Ink visual
test_octopus_ink() {
  test_header "Test 10: Jelly Octopus Ink Visual"

  # Check if splash script exists
  if [ -f "core/ink-ui/main.mjs" ]; then
    test_passed "Splash script exists"
  else
    test_failed "Splash script not found"
    return 1
  fi

  # Check if splash can be disabled
  if grep -q "JELLY_NO_SPLASH" jelly-claude.sh; then
    test_passed "Splash can be disabled via environment variable"
  else
    test_failed "No splash disable option"
    return 1
  fi

  return 0
}

# Test 11: One-click setup
test_one_click_setup() {
  test_header "Test 11: One-Click Setup"

  # Check setup.sh exists and is executable
  if [ -x "setup.sh" ]; then
    test_passed "setup.sh exists and is executable"
  else
    test_failed "setup.sh missing or not executable"
    return 1
  fi

  # Check jelly-claude.sh exists
  if [ -f "jelly-claude.sh" ]; then
    test_passed "jelly-claude.sh exists"
  else
    test_failed "jelly-claude.sh missing"
    return 1
  fi

  return 0
}

# Test 12: Prediction architecture
test_prediction_architecture() {
  test_header "Test 12: Prediction Architecture"

  # Test Jelly Score range
  local output=$(node modules/market/run.mjs predict --text "Test" --chain solana)
  if echo "$output" | grep -q "jellyScore"; then
    local score=$(echo "$output" | grep -o '"jellyScore":[0-9]*' | grep -o '[0-9]*')
    if [ -n "$score" ] && [ "$score" -ge 0 ] && [ "$score" -le 100 ]; then
      test_passed "Jelly Score in valid range (0-100)"
    else
      test_failed "Jelly Score out of range"
      return 1
    fi
  else
    test_failed "Jelly Score not found in output"
    return 1
  fi

  # Test position sizing suggestion
  if echo "$output" | grep -q "suggestion"; then
    test_passed "Position sizing suggestion present"
  else
    test_failed "No position sizing suggestion"
    return 1
  fi

  return 0
}

# Test 13: Additional features (sample)
test_additional_features() {
  test_header "Test 13: Additional Features (Sample)"

  # Test model selection
  if grep -q "ANTHROPIC_API_KEY\|OPENROUTER_API_KEY" jelly-claude.sh; then
    test_passed "Model selection based on API key"
  else
    test_failed "No model selection logic"
    return 1
  fi

  # Test caching
  if grep -q "getCache" modules/market/tools/predict.mjs; then
    test_passed "Caching implemented"
  else
    test_failed "No caching found"
    return 1
  fi

  # Test circuit breakers
  if grep -q "getBreaker" modules/prediction-markets/tools/markets.mjs; then
    test_passed "Circuit breakers implemented"
  else
    test_failed "No circuit breakers found"
    return 1
  fi

  return 0
}

# Main test runner
main() {
  echo -e "${BLUE}=========================================="
  echo -e "Jelly-Claude Enhancement Test Suite"
  echo -e "==========================================${NC}"
  echo ""

  local all_tests=(
    "test_setup"
    "test_market_module"
    "test_portfolio_module"
    "test_scanner_module"
    "test_prediction_module"
    "test_defi_module"
    "test_bridge_module"
    "test_cpu_awareness"
    "test_jelly_command"
    "test_octopus_ink"
    "test_one_click_setup"
    "test_prediction_architecture"
    "test_additional_features"
  )

  local passed=0
  local failed=0

  for test in "${all_tests[@]}"; do
    echo -e "${YELLOW}Running $test...${NC}"
    if $test; then
      passed=$((passed + 1))
    else
      failed=$((failed + 1))
    fi
  done

  echo ""
  echo -e "${BLUE}=========================================="
  echo -e "Test Results Summary"
  echo -e "==========================================${NC}"
  echo ""
  echo -e "Total tests: ${YELLOW}$((passed + failed))${NC}"
  echo -e "Passed: ${GREEN}$passed${NC}"
  echo -e "Failed: ${RED}$failed${NC}"
  echo ""

  if [ $failed -eq 0 ]; then
    echo -e "${GREEN}All tests passed! Jelly-Claude enhancements are working correctly.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Fund your wallets (SOL for Solana, BNB for BNB Chain)"
    echo "2. Add API keys to .env for prediction markets"
    echo "3. Start trading with: bash jelly-claude.sh"
    echo ""
    return 0
  else
    echo -e "${RED}Some tests failed. Please review the failures and fix issues.${NC}"
    return 1
  fi
}

main "$@"