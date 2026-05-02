#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# install-all.sh  —  Install all Jelly-Social agent templates
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENTS_DIR="$SCRIPT_DIR/agents"
DEST_DIR="$HOME/.claude/agents"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

mkdir -p "$DEST_DIR"

echo ""
echo -e "${CYAN}  Installing all Jelly-Social agent templates...${NC}"
echo ""

INSTALLED=0
SKIPPED=0

for agent_dir in "$AGENTS_DIR"/*/; do
  agent_name="$(basename "$agent_dir")"
  agent_file="$agent_dir/agent.md"

  if [[ -f "$agent_file" ]]; then
    cp "$agent_file" "$DEST_DIR/$agent_name.md"
    echo -e "  ${CYAN}→${NC} $agent_name"
    INSTALLED=$((INSTALLED + 1))
  else
    echo -e "  ${YELLOW}⚠${NC} $agent_name — no agent.md found, skipping"
    SKIPPED=$((SKIPPED + 1))
  fi
done

echo ""
echo -e "  ${GREEN}Done!${NC} Installed: $INSTALLED   Skipped: $SKIPPED"
echo ""
echo "  Use agents inside Claude Code with: /agent <agent-name>"
echo ""
