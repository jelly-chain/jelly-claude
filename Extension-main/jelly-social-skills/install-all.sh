#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# install-all.sh  —  Install all Jelly-Social skills
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$SCRIPT_DIR/skills"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${CYAN}  Installing all Jelly-Social skills...${NC}"
echo ""

INSTALLED=0
SKIPPED=0

for skill_dir in "$SKILLS_DIR"/*/; do
  skill_name="$(basename "$skill_dir")"
  installer="$skill_dir/install.sh"

  if [[ -f "$installer" ]]; then
    echo -e "  ${CYAN}→${NC} $skill_name"
    bash "$installer" --quiet 2>/dev/null || bash "$installer"
    INSTALLED=$((INSTALLED + 1))
  else
    echo -e "  ${YELLOW}⚠${NC} $skill_name — no install.sh found, skipping"
    SKIPPED=$((SKIPPED + 1))
  fi
done

echo ""
echo -e "  ${GREEN}Done!${NC} Installed: $INSTALLED   Skipped: $SKIPPED"
echo ""
