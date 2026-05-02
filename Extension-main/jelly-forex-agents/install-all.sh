#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# install-all.sh  —  Install all jelly-forex agent templates
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENTS_DIR="$SCRIPT_DIR/agents"
DEST_DIR="$HOME/.claude/agents"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

ONLY=""
i=1
while [[ $i -le $# ]]; do
  if [[ "${!i}" == "--only" ]]; then
    j=$((i + 1))
    ONLY="${!j}"
    i=$((i + 2))
  else
    i=$((i + 1))
  fi
done

mkdir -p "$DEST_DIR"

echo ""
echo -e "${CYAN}  Installing jelly-forex agent templates...${NC}"
echo ""

INSTALLED=0

for agent_dir in "$AGENTS_DIR"/*/; do
  agent_name="$(basename "$agent_dir")"
  agent_md="$agent_dir/agent.md"

  [[ -n "$ONLY" && "$agent_name" != "$ONLY" ]] && continue

  if [[ -f "$agent_md" ]]; then
    cp "$agent_md" "$DEST_DIR/$agent_name.md"
    echo -e "  ${GREEN}✓${NC} $agent_name"
    INSTALLED=$((INSTALLED + 1))
  else
    echo -e "  ${YELLOW}⚠${NC} $agent_name — no agent.md found"
  fi
done

echo ""
echo -e "  ${GREEN}Done!${NC} $INSTALLED agent templates installed to $DEST_DIR"
echo ""
echo "  Use inside Claude Code:"
echo "    /agent <agent-name>"
echo ""
