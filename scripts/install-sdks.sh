#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# install-sdks.sh — Install all SDKs from SDK-main into JellyClaude
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JELLY_DIR="$(dirname "$SCRIPT_DIR")"
SDK_DIR="${1:-$JELLY_DIR/../SDK-main}"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}  ╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}  ║         SDK Installation Wizard                  ║${NC}"
echo -e "${CYAN}  ║   Installing 15+ SDKs for JellyOS                ║${NC}"
echo -e "${CYAN}  ╚══════════════════════════════════════════════════╝${NC}"
echo ""

# Check SDK directory
if [[ ! -d "$SDK_DIR" ]]; then
  echo -e "${RED}  ✗ SDK directory not found: $SDK_DIR${NC}"
  echo "  Clone SDK repo: git clone https://github.com/jelly-chain/SDK $SDK_DIR"
  exit 1
fi

echo -e "${CYAN}  ▶ Scanning SDK directory: $SDK_DIR${NC}"

# Install each SDK
INSTALLED=0
SKIPPED=0
FAILED=0

for sdk_dir in "$SDK_DIR"/*/; do
  if [[ ! -f "$sdk_dir/package.json" ]]; then
    continue
  fi
  
  sdk_name=$(basename "$sdk_dir")
  
  # Skip deprecated SDK
  if [[ "$sdk_name" == "market-prediction-sdk-main" ]]; then
    echo -e "${YELLOW}  ⏭ $sdk_name (deprecated)${NC}"
    ((SKIPPED++))
    continue
  fi
  
  echo -e "${CYAN}  ▶ Installing $sdk_name...${NC}"
  
  cd "$sdk_dir"
  
  # Install dependencies
  if npm install --silent 2>/dev/null; then
    echo -e "${GREEN}  ✓ $sdk_name installed${NC}"
    ((INSTALLED++))
  else
    echo -e "${RED}  ✗ $sdk_name failed${NC}"
    ((FAILED++))
  fi
done

# Register SDKs
echo -e "\n${CYAN}  ▶ Registering SDKs...${NC}"
if [[ -f "$SCRIPT_DIR/register-sdks.mjs" ]]; then
  node "$SCRIPT_DIR/register-sdks.mjs" "$SDK_DIR"
  echo -e "${GREEN}  ✓ SDKs registered${NC}"
fi

# Install SDK skills
echo -e "\n${CYAN}  ▶ Installing SDK skills...${NC}"
SKILLS_DIR="$HOME/.claude/skills"
mkdir -p "$SKILLS_DIR"

for sdk_dir in "$SDK_DIR"/*/; do
  skills_subdir="$sdk_dir/skills"
  if [[ ! -d "$skills_subdir" ]]; then
    continue
  fi
  
  for skill_dir in "$skills_subdir"/*/; do
    if [[ ! -f "$skill_dir/SKILL.md" ]]; then
      continue
    fi
    
    skill_name=$(basename "$skill_dir")
    target_dir="$SKILLS_DIR/$skill_name"
    
    if [[ ! -d "$target_dir" ]]; then
      mkdir -p "$target_dir"
      cp "$skill_dir/SKILL.md" "$target_dir/"
      if [[ -f "$skill_dir/skill.metadata.json" ]]; then
        cp "$skill_dir/skill.metadata.json" "$target_dir/"
      fi
      echo -e "${GREEN}  ✓ Skill installed: $skill_name${NC}"
    fi
  done
done

# Summary
echo ""
echo -e "${GREEN}  ╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}  ║         Installation Complete                    ║${NC}"
echo -e "${GREEN}  ╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Installed: ${GREEN}$INSTALLED${NC} SDKs"
echo -e "  Skipped:   ${YELLOW}$SKIPPED${NC} SDKs"
echo -e "  Failed:    ${RED}$FAILED${NC} SDKs"
echo ""
echo -e "  ${CYAN}Next steps:${NC}"
echo "  1. Add API keys to .env"
echo "  2. Run: bash jelly-claude.sh"
