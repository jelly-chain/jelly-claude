#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# jelly-social.sh  —  Jelly-Social AI agent launcher (Mac / Linux)
# GitHub: https://github.com/jelly-chain/jelly-social
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

if [[ -f "$SCRIPT_DIR/../proxy.mjs" ]]; then
  PROXY_FILE="$(cd "$SCRIPT_DIR/.." && pwd)/proxy.mjs"
elif [[ -f "$SCRIPT_DIR/proxy.mjs" ]]; then
  PROXY_FILE="$SCRIPT_DIR/proxy.mjs"
else
  PROXY_FILE=""
fi

if [[ -f "$ENV_FILE" ]]; then
  set -o allexport
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +o allexport
fi

if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
  echo ""
  echo "  ✅  Anthropic API key detected — launching with Claude paid models."
  echo ""
  exec claude "$@"

elif [[ -n "${OPENROUTER_API_KEY:-}" ]]; then
  echo ""
  echo "  ✅  OpenRouter API key detected — starting proxy and launching with free model tiers."
  echo ""

  if [[ -z "$PROXY_FILE" ]]; then
    echo "  ❌  proxy.mjs not found. Copy it from jelly-claude/ or set ANTHROPIC_API_KEY instead."
    exit 1
  fi

  node "$PROXY_FILE" &
  PROXY_PID=$!
  trap 'kill "$PROXY_PID" 2>/dev/null || true' EXIT INT TERM

  READY=0
  for i in $(seq 1 20); do
    if node -e "
const net = require('net');
const s = net.createConnection(7788, '127.0.0.1');
s.on('connect', () => { s.destroy(); process.exit(0); });
s.on('error',   () => { s.destroy(); process.exit(1); });
" 2>/dev/null; then
      READY=1; break
    fi
    sleep 0.5
  done

  if [[ "$READY" -eq 0 ]]; then
    echo "  ❌  Proxy did not start on port 7788 — aborting."
    kill "$PROXY_PID" 2>/dev/null || true
    exit 1
  fi

  export ANTHROPIC_API_KEY="$OPENROUTER_API_KEY"
  export ANTHROPIC_BASE_URL="http://127.0.0.1:7788"
  export ANTHROPIC_DEFAULT_OPUS_MODEL="deepseek/deepseek-r1:free"
  export ANTHROPIC_DEFAULT_SONNET_MODEL="deepseek/deepseek-chat:free"
  export ANTHROPIC_DEFAULT_HAIKU_MODEL="meta-llama/llama-3.3-70b-instruct:free"
  export CLAUDE_CODE_SUBAGENT_MODEL="google/gemma-2-9b-it:free"

  claude "$@"

else
  echo ""
  echo "  ℹ️  No API key found — falling through to Claude's built-in login."
  echo ""
  echo "  To use free OpenRouter models, add to .env:"
  echo "    OPENROUTER_API_KEY=<key>   — get one at https://openrouter.ai/keys"
  echo ""
  echo "  To use paid Claude models, add:"
  echo "    ANTHROPIC_API_KEY=<key>    — get one at https://console.anthropic.com"
  echo ""
  exec claude "$@"
fi
