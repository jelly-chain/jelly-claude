#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# torq.sh  —  Jelly-Claude TORQ mode launcher (Mac / Linux)
# Token-optimised launch using high-performance OpenRouter models.
# GitHub: https://github.com/jelly-chain/jelly-claude
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"

# ── Ink splash helper — forks main.mjs subprocess; silent if ink not installed ─
_jelly_splash() {
  # Respect the same gates as core/splash.mjs: non-TTY and opt-out env var
  [[ -t 1 ]] || return 0
  [[ "${JELLY_NO_SPLASH:-0}" == "1" ]] && return 0
  local mode="${1:-none}"
  JELLY_SPLASH_MODE="$mode" \
  JELLY_SPLASH_PORT="${JELLY_SPLASH_PORT:-7788}" \
  JELLY_SPLASH_OPUS="${ANTHROPIC_DEFAULT_OPUS_MODEL:-}" \
  JELLY_SPLASH_SONNET="${ANTHROPIC_DEFAULT_SONNET_MODEL:-}" \
  JELLY_SPLASH_HAIKU="${ANTHROPIC_DEFAULT_HAIKU_MODEL:-}" \
  node "$SCRIPT_DIR/core/ink-ui/main.mjs" 2>/dev/null || true
}

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

# ── If Anthropic key present — no proxy needed, launch via wrapper ──────────
if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
  _jelly_splash "anthropic"
  echo "  ✅  Anthropic API key detected — launching with Jelly (Claude backend)."
  echo ""
  exec node "$SCRIPT_DIR/core/jelly-wrapper.mjs" "$@"
fi

# ── OpenRouter path ───────────────────────────────────────────────────────────
if [[ -z "${OPENROUTER_API_KEY:-}" ]]; then
  _jelly_splash "none"
  echo "  ℹ️  No API key found — falling through to Jelly login."
  echo ""
  echo "  For TORQ mode, add your OpenRouter key to .env:"
  echo "    OPENROUTER_API_KEY=<your key>   — get one at https://openrouter.ai/keys"
  echo ""
  exec node "$SCRIPT_DIR/core/jelly-wrapper.mjs" "$@"
fi

# ── Resolve TORQ model tiers early (needed for splash display) ───────────────
_OPUS="${TORQ_OPUS_MODEL:-qwen/qwen3.6-plus}"
_SONNET="${TORQ_SONNET_MODEL:-nvidia/nemotron-3-super-120b-a12b}"
_HAIKU="${TORQ_HAIKU_MODEL:-z-ai/glm-5.1}"
_SUBAGENT="${TORQ_SUBAGENT_MODEL:-google/gemma-4-26b-a4b-it}"
export ANTHROPIC_DEFAULT_OPUS_MODEL="$_OPUS"
export ANTHROPIC_DEFAULT_SONNET_MODEL="$_SONNET"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="$_HAIKU"

_jelly_splash "openrouter"

echo "  ✅  OpenRouter key detected — starting proxy with TORQ model tiers."
echo ""

# ── Start proxy ───────────────────────────────────────────────────────────────
if [[ -z "$PROXY_FILE" ]]; then
  echo "  ❌  proxy.mjs not found (looked in $SCRIPT_DIR and parent directory)"
  exit 1
fi

# ── Pre-spawn preflight: ensure port 7788 is free (kills stale proxy) ─────────
if ! node "$SCRIPT_DIR/scripts/proxy-preflight.mjs"; then
  echo "  ❌  Port 7788 could not be freed — aborting."
  exit 1
fi

node "$PROXY_FILE" &
PROXY_PID=$!
trap 'kill "$PROXY_PID" 2>/dev/null || true' EXIT INT TERM

# Wait for port 7788 to be ready (up to 10 s)
# Also verify our spawned PROXY_PID is the one that owns the port.
READY=0
for i in $(seq 1 20); do
  if ! kill -0 "$PROXY_PID" 2>/dev/null; then
    echo "  ❌  Proxy process exited unexpectedly — aborting."
    exit 1
  fi
  if node --input-type=module -e "
import net from 'net';
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

# Final ownership check
if ! kill -0 "$PROXY_PID" 2>/dev/null; then
  echo "  ❌  Proxy process died after port became ready — another process may own port 7788."
  exit 1
fi

# ── Activate proxy routing (model vars already set above before splash) ───────
export ANTHROPIC_API_KEY="$OPENROUTER_API_KEY"
export ANTHROPIC_BASE_URL="http://127.0.0.1:7788"
export CLAUDE_CODE_SUBAGENT_MODEL="$_SUBAGENT"

echo "  Models:"
echo "    Opus     → $_OPUS"
echo "    Sonnet   → $_SONNET"
echo "    Haiku    → $_HAIKU"
echo "    Subagent → $_SUBAGENT"
echo ""

# Launch Claude via wrapper for logo transformation
exec node "$SCRIPT_DIR/core/jelly-wrapper.mjs" "$@"
