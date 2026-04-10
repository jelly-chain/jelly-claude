#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# jelly-claude.sh  —  Jelly-Chain AI coding agent launcher (Mac / Linux)
# GitHub: https://github.com/jelly-chain/jelly-claude
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

# ── Load .env ────────────────────────────────────────────────────────────────
if [[ -f "$ENV_FILE" ]]; then
  set -o allexport
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +o allexport
else
  echo ""
  echo "  ⚠️  No .env file found."
  echo "  Copy .env.example to .env and fill in at least one API key."
  echo "  Run: cp .env.example .env"
  echo ""
  exit 1
fi

# ── Check which key is available ─────────────────────────────────────────────
if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
  echo ""
  echo "  ✅  Anthropic API key detected — launching with Claude paid models."
  echo ""
  exec claude "$@"

elif [[ -n "${OPENROUTER_API_KEY:-}" ]]; then
  echo ""
  echo "  ✅  OpenRouter API key detected — launching with OpenRouter model tiers."
  echo ""

  # ── Model tiers ──────────────────────────────────────────────────────────
  export ANTHROPIC_API_KEY="$OPENROUTER_API_KEY"
  export ANTHROPIC_BASE_URL="https://openrouter.ai/api/v1"
  export ANTHROPIC_DEFAULT_OPUS_MODEL="google/gemma-4-31b-it:free"
  export ANTHROPIC_DEFAULT_SONNET_MODEL="arcee-ai/trinity-large-preview:free"
  export ANTHROPIC_DEFAULT_HAIKU_MODEL="nvidia/nemotron-3-super-120b-a12b"
  export CLAUDE_CODE_SUBAGENT_MODEL="nvidia/nemotron-3-super-120b-a12b:free"

  exec claude "$@"

else
  echo ""
  echo "  ❌  No API key found."
  echo ""
  echo "  You need either:"
  echo "    ANTHROPIC_API_KEY   — get one at https://console.anthropic.com"
  echo "    OPENROUTER_API_KEY  — get one at https://openrouter.ai/keys"
  echo ""
  echo "  Add the key to your .env file and try again."
  echo ""
  exit 1
fi
