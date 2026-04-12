#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# torq.sh  —  Jelly-Claude TORQ mode launcher (Mac / Linux)
# Token-optimised launch using high-performance OpenRouter models.
# GitHub: https://github.com/jelly-chain/jelly-claude
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

# proxy.mjs sits next to this script (or one directory up if cloned standalone)
if [[ -f "$SCRIPT_DIR/proxy.mjs" ]]; then
  PROXY_FILE="$SCRIPT_DIR/proxy.mjs"
elif [[ -f "$SCRIPT_DIR/../proxy.mjs" ]]; then
  PROXY_FILE="$(cd "$SCRIPT_DIR/.." && pwd)/proxy.mjs"
else
  PROXY_FILE=""
fi

# ── Load .env ────────────────────────────────────────────────────────────────
if [[ -f "$ENV_FILE" ]]; then
  set -o allexport
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +o allexport
fi

# ── TORQ banner ───────────────────────────────────────────────────────────────
echo ""
echo "  ⚡  TORQ MODE — high-performance token-optimised models"
echo ""

# ── If Anthropic key present — no proxy needed, launch directly ──────────────
if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
  echo "  ✅  Anthropic API key detected — launching with paid Claude models."
  echo ""
  exec claude "$@"
fi

# ── OpenRouter path ───────────────────────────────────────────────────────────
if [[ -z "${OPENROUTER_API_KEY:-}" ]]; then
  echo "  ℹ️  No API key found — falling through to Claude's built-in login."
  echo ""
  echo "  For TORQ mode, add your OpenRouter key to .env:"
  echo "    OPENROUTER_API_KEY=<your key>   — get one at https://openrouter.ai/keys"
  echo ""
  exec claude "$@"
fi

echo "  ✅  OpenRouter key detected — starting proxy with TORQ model tiers."
echo ""

# ── Start proxy ───────────────────────────────────────────────────────────────
if [[ -z "$PROXY_FILE" ]]; then
  echo "  ❌  proxy.mjs not found (looked in $SCRIPT_DIR and parent directory)"
  exit 1
fi

node "$PROXY_FILE" &
PROXY_PID=$!
trap 'kill "$PROXY_PID" 2>/dev/null || true' EXIT INT TERM

# Wait for port 7788 to be ready (up to 10 s)
READY=0
for i in $(seq 1 20); do
  if node -e "
const net = require('net');
const s = net.createConnection(7788, '127.0.0.1');
s.on('connect', () => { s.destroy(); process.exit(0); });
s.on('error', () => { s.destroy(); process.exit(1); });
" 2>/dev/null; then
    READY=1
    break
  fi
  sleep 0.5
done

if [[ "$READY" -eq 0 ]]; then
  echo "  ❌  Proxy did not start on port 7788 within 10 seconds — aborting."
  kill "$PROXY_PID" 2>/dev/null || true
  exit 1
fi

# ── TORQ model tiers — read TORQ_* overrides from .env, fall back to defaults ─
_OPUS="${TORQ_OPUS_MODEL:-qwen/qwen3.6-plus}"
_SONNET="${TORQ_SONNET_MODEL:-nvidia/nemotron-3-super-120b-a12b}"
_HAIKU="${TORQ_HAIKU_MODEL:-z-ai/glm-5.1}"
_SUBAGENT="${TORQ_SUBAGENT_MODEL:-google/gemma-4-26b-a4b-it}"

export ANTHROPIC_API_KEY="$OPENROUTER_API_KEY"
export ANTHROPIC_BASE_URL="http://127.0.0.1:7788"
export ANTHROPIC_DEFAULT_OPUS_MODEL="$_OPUS"
export ANTHROPIC_DEFAULT_SONNET_MODEL="$_SONNET"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="$_HAIKU"
export CLAUDE_CODE_SUBAGENT_MODEL="$_SUBAGENT"

echo "  Models:"
echo "    Opus     → $_OPUS"
echo "    Sonnet   → $_SONNET"
echo "    Haiku    → $_HAIKU"
echo "    Subagent → $_SUBAGENT"
echo ""

claude "$@"
