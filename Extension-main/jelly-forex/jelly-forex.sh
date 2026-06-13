#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# jelly-forex.sh  —  Launch Claude Code with jelly-forex skills loaded
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KEYS_FILE="$HOME/.jelly-forex/.keys"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}  Jelly-Forex — Traditional Finance AI Agent${NC}"
echo ""

# ── Load keys ────────────────────────────────────────────────────────────────
if [[ -f "$KEYS_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$KEYS_FILE"
  set +a
  echo -e "${GREEN}  ✓ Keys loaded from $KEYS_FILE${NC}"
else
  echo -e "${YELLOW}  ⚠ No keys file found at $KEYS_FILE${NC}"
  echo -e "${YELLOW}    Run bash setup.sh first.${NC}"
fi

# ── Check for Claude Code ─────────────────────────────────────────────────────
if ! command -v claude &>/dev/null; then
  echo -e "${RED}  ✗ Claude Code not found. Run: npm install -g @anthropic-ai/claude-code${NC}"
  exit 1
fi

# ── Paper/practice mode reminder ─────────────────────────────────────────────
echo ""
echo -e "${YELLOW}  Paper trading and practice forex mode are active by default.${NC}"
echo -e "${YELLOW}  Confirm live trading intent explicitly before using real money.${NC}"
echo ""

# ── Start Claude Code ─────────────────────────────────────────────────────────
echo -e "${CYAN}  Starting Claude Code...${NC}"
echo ""
cd "$SCRIPT_DIR"
exec claude
