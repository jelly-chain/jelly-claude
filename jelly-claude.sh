#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# jelly-claude.sh  —  Jelly launcher (Mac / Linux)
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
  node "$SCRIPT_DIR/core/ink-ui/main.mjs" 2>/dev/null || true
}

# proxy.mjs sits next to this script (or one directory up if cloned standalone)
if [[ -f "$SCRIPT_DIR/proxy.mjs" ]]; then
  PROXY_FILE="$SCRIPT_DIR/proxy.mjs"
elif [[ -f "$SCRIPT_DIR/../proxy.mjs" ]]; then
  PROXY_FILE="$(cd "$SCRIPT_DIR/..' && pwd)/proxy.mjs"
else
  PROXY_FILE=""
fi

# ── Load .env (optional — missing .env does not block; env vars may be set in shell) ─
if [[ -f "$ENV_FILE" ]]; then
  set -o allexport
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +o allexport
else
  echo ""
  echo "  ℹ️  No .env file found — checking environment variables."
  echo "  To configure keys for next time, run: cp .env.example .env"
  echo ""
fi

# ── Telegram bridge mode — delegate entirely to jelly-claude.mjs ─────────────
# jelly-claude.mjs handles proxy setup + TG bridge in a single Node.js process.
for _arg in "$@"; do
  if [[ "$_arg" == "--telegram" ]]; then
    exec node "$SCRIPT_DIR/jelly-claude.mjs" "$@"
  fi
done
unset _arg

# ── Check which key is available ─────────────────────────────────────────────
if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
  _jelly_splash "anthropic"
  echo ""
  echo "  ✅  Anthropic API key detected — launching with Claude paid models."
  echo ""
  exec node -r "$SCRIPT_DIR/core/extensions.mjs" claude "$@"

elif [[ -n "${OPENROUTER_API_KEY:-}" ]]; then
  # Set model env vars before splash so helper picks them up
  export ANTHROPIC_DEFAULT_OPUS_MODEL="deepseek/deepseek-v4-pro"
  export ANTHROPIC_DEFAULT_SONNET_MODEL="x-ai/grok-4.3"
  export ANTHROPIC_DEFAULT_HAIKU_MODEL="nvidia/nemotron-3-nano-30b-a3b:exacto"
  _jelly_splash "openrouter"
  echo ""
  echo "  ✅  OpenRouter API key detected — starting proxy and launching with free model tiers."
  echo ""

  # ── Start OpenRouter proxy ────────────────────────────────────────────────
  if [[ -z "$PROXY_FILE" ]]; then
    echo "  ❌  proxy.mjs not found (looked in $SCRIPT_DIR and parent directory)"
    exit 1
  fi

  # ── Pre-spawn preflight: ensure port 7788 is free (kills stale proxy) ───────
  if ! node "$SCRIPT_DIR/scripts/proxy-preflight.mjs"; then
    echo "  ❌  Port 7788 could not be freed — aborting."
    exit 1
  fi

  node "$PROXY_FILE" &
  PROXY_PID=$!
  trap 'kill "$PROXY_PID" 2>/dev/null || true' EXIT INT TERM

  # Wait for port 7788 to be ready (up to 10 s, 20 × 0.5 s)
  # Also verify our spawned PROXY_PID is the one that owns the port.
  READY=0
  for i in $(seq 1 20); do
    # Check our proxy process is still alive
    if ! kill -0 "$PROXY_PID" 2>/dev/null; then
      echo "  ❌  Proxy process exited unexpectedly — aborting."
      exit 1
    fi
    # Check port is accepting connections
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

  # Final ownership check: our spawned PID must still be alive
  if ! kill -0 "$PROXY_PID" 2>/dev/null; then
    echo "  ❌  Proxy process died after port became ready — another process may own port 7788."
    exit 1
  fi

  # ── Model tiers ──────────────────────────────────────────────────────────
  export ANTHROPIC_API_KEY="$OPENROUTER_API_KEY"
  export ANTHROPIC_BASE_URL="http://127.0.0.1:7788"
  export ANTHROPIC_DEFAULT_OPUS_MODEL="deepseek/deepseek-v4-pro"
  export ANTHROPIC_DEFAULT_SONNET_MODEL="x-ai/grok-4.3"
  export ANTHROPIC_DEFAULT_HAIKU_MODEL="nvidia/nemotron-3-nano-30b-a3b:exacto"
  export CLAUDE_CODE_SUBAGENT_MODEL="qwen/qwen3-next-80b-a3b-thinking"

  # Run claude as a child process (not exec) so the EXIT trap fires on completion
  # and reliably kills the proxy regardless of how claude exits.
  exec node -r "$SCRIPT_DIR/core/extensions.mjs" claude "$@"

else
  _jelly_splash "none"
  echo ""
  echo "  ℹ️  No API key found — falling through to Claude's built-in login."
  echo ""
  echo "  To use free OpenRouter models instead, add to your .env:"
  echo "    OPENROUTER_API_KEY=<your key>   — get one at https://openrouter.ai/keys"
  echo ""
  echo "  To use paid Claude models, add:"
  echo "    ANTHROPIC_API_KEY=<your key>    — get one at https://console.anthropic.com"
  echo ""
  exec node -r "$SCRIPT_DIR/core/extensions.mjs" claude "$@"
fi