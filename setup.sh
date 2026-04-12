#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# setup.sh  —  Jelly-Claude first-time setup wizard (Mac / Linux)
# Run once after cloning: bash setup.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

JELLY_HOME="$HOME/.jelly-claude"
WALLETS_DIR="$JELLY_HOME/wallets"
KEYS_FILE="$JELLY_HOME/.keys"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

banner() {
  echo ""
  echo -e "${CYAN}  ╔══════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}  ║         Jelly-Claude Setup Wizard                ║${NC}"
  echo -e "${CYAN}  ║   Multi-Chain AI Agent — github.com/jelly-chain  ║${NC}"
  echo -e "${CYAN}  ╚══════════════════════════════════════════════════╝${NC}"
  echo ""
}

step() { echo -e "${CYAN}  ▶ $1${NC}"; }
ok()   { echo -e "${GREEN}  ✓ $1${NC}"; }
warn() { echo -e "${YELLOW}  ⚠ $1${NC}"; }
err()  { echo -e "${RED}  ✗ $1${NC}"; }

banner

# ── 1. Check Node.js ─────────────────────────────────────────────────────────
step "Checking Node.js..."
if ! command -v node &>/dev/null; then
  err "Node.js not found."
  echo "  Install from https://nodejs.org (v18 or later recommended)"
  exit 1
fi
NODE_VERSION=$(node --version)
ok "Node.js $NODE_VERSION found"

# ── 2. Check npm ─────────────────────────────────────────────────────────────
step "Checking npm..."
if ! command -v npm &>/dev/null; then
  err "npm not found. Re-install Node.js from https://nodejs.org"
  exit 1
fi
ok "npm $(npm --version) found"

# ── 3. Check git ─────────────────────────────────────────────────────────────
step "Checking git..."
if ! command -v git &>/dev/null; then
  err "git not found. Install from https://git-scm.com"
  exit 1
fi
ok "git $(git --version | awk '{print $3}') found"

# ── 4. Install Claude Code ───────────────────────────────────────────────────
step "Installing Claude Code CLI..."
if command -v claude &>/dev/null; then
  ok "Claude Code already installed ($(claude --version 2>/dev/null | head -1 || echo 'installed'))"
else
  npm install -g @anthropic-ai/claude-code
  ok "Claude Code installed"
fi

# ── 5. Create .env if needed ─────────────────────────────────────────────────
step "Setting up .env..."
if [[ ! -f "$SCRIPT_DIR/.env" ]]; then
  cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
  warn ".env created from .env.example — add your API key before running jelly-claude.sh"
else
  ok ".env already exists"
fi

# ── 5b. Check for API key (non-blocking warning) ─────────────────────────────
ENV_HAS_KEY=false
if [[ -f "$SCRIPT_DIR/.env" ]]; then
  if grep -qE '^(ANTHROPIC_API_KEY|OPENROUTER_API_KEY)=.+' "$SCRIPT_DIR/.env" 2>/dev/null; then
    ENV_HAS_KEY=true
  fi
fi
if [[ "$ENV_HAS_KEY" == "false" ]]; then
  warn "No API key found in .env yet."
  warn "Add ANTHROPIC_API_KEY or OPENROUTER_API_KEY before running jelly-claude.sh."
  warn "(Without a key, jelly-claude.sh will fall through to Claude's built-in login.)"
fi

# ── 6. Create wallet directory ───────────────────────────────────────────────
step "Creating wallet directory..."
mkdir -p "$WALLETS_DIR"
chmod 700 "$JELLY_HOME"
chmod 700 "$WALLETS_DIR"
ok "Wallet directory: $WALLETS_DIR"

# ── 7. Generate Solana wallet ────────────────────────────────────────────────
step "Generating Solana wallet..."
SOLANA_KEY="$WALLETS_DIR/solana.json"
SOLANA_PUB="$WALLETS_DIR/solana.pub"
if [[ -f "$SOLANA_KEY" ]]; then
  ok "Solana wallet already exists: $(cat "$SOLANA_PUB" 2>/dev/null || echo 'see solana.json')"
else
  if command -v solana-keygen &>/dev/null; then
    solana-keygen new --outfile "$SOLANA_KEY" --no-bip39-passphrase --silent
    solana-keygen pubkey "$SOLANA_KEY" > "$SOLANA_PUB"
    chmod 600 "$SOLANA_KEY"
    ok "Solana wallet generated: $(cat "$SOLANA_PUB")"
  else
    # Fallback: generate Ed25519 keypair in Node.js
    node - <<NODESCRIPT
const crypto = require('crypto');
const fs = require('fs');
const walletDir = '$WALLETS_DIR';
const keyPath   = walletDir + '/solana.json';
const pubPath   = walletDir + '/solana.pub';
if (!fs.existsSync(keyPath)) {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519', {
    privateKeyEncoding: { type: 'pkcs8', format: 'der' },
    publicKeyEncoding:  { type: 'spki', format: 'der' },
  });
  const priv32 = privateKey.slice(-32);
  const pub32  = publicKey.slice(-32);
  fs.writeFileSync(keyPath, JSON.stringify(Array.from(Buffer.concat([priv32, pub32]))));
  fs.chmodSync(keyPath, 0o600);
  // Base58-encode the pubkey
  const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let n = BigInt('0x' + pub32.toString('hex'));
  let addr = '';
  while (n > 0n) { addr = B58[Number(n % 58n)] + addr; n /= 58n; }
  for (let i = 0; i < pub32.length && pub32[i] === 0; i++) addr = '1' + addr;
  fs.writeFileSync(pubPath, addr);
  process.stdout.write(addr + '\n');
}
NODESCRIPT
    SOLANA_ADDRESS=$(cat "$SOLANA_PUB" 2>/dev/null || echo "see $SOLANA_KEY")
    ok "Solana wallet generated: $SOLANA_ADDRESS"
    warn "Install Solana CLI for full tooling: https://docs.solana.com/cli/install-solana-cli-tools"
  fi
fi

# ── 8. Generate EVM wallet (BNB + Polygon) — real address using ethers.js ───
step "Generating EVM wallet (BNB + Polygon)..."
EVM_KEY="$WALLETS_DIR/evm.json"
EVM_PUB="$WALLETS_DIR/evm.pub"
if [[ -f "$EVM_KEY" ]]; then
  ok "EVM wallet already exists: $(cat "$EVM_PUB" 2>/dev/null || echo 'see evm.json')"
else
  # Install ethers temporarily to derive the real address
  ETHERS_TMP="$(mktemp -d)"
  step "Installing ethers.js for wallet derivation (temp install)..."
  npm install --prefix "$ETHERS_TMP" ethers --silent 2>/dev/null
  node - <<NODESCRIPT
const crypto = require('crypto');
const fs     = require('fs');
const { ethers } = require('$ETHERS_TMP/node_modules/ethers');
const walletDir  = '$WALLETS_DIR';
const keyPath    = walletDir + '/evm.json';
const pubPath    = walletDir + '/evm.pub';
if (!fs.existsSync(keyPath)) {
  const wallet = ethers.Wallet.createRandom();
  fs.writeFileSync(keyPath, JSON.stringify({
    address:    wallet.address,
    privateKey: wallet.privateKey,
    mnemonic:   wallet.mnemonic ? wallet.mnemonic.phrase : null,
  }));
  fs.chmodSync(keyPath, 0o600);
  fs.writeFileSync(pubPath, wallet.address);
  process.stdout.write('EVM address: ' + wallet.address + '\n');
}
NODESCRIPT
  rm -rf "$ETHERS_TMP"
  EVM_ADDRESS=$(cat "$EVM_PUB" 2>/dev/null || echo "error — check $EVM_KEY")
  ok "EVM wallet generated: $EVM_ADDRESS"
fi

# ── 9. Optional: Prediction market API keys ──────────────────────────────────
step "Optional: Prediction market & service API keys"
echo ""
echo "  Polymarket (prediction markets on Polygon)"
echo "  Get keys at: https://app.polymarket.com (Settings > API)"
read -r -p "  POLYMARKET_API_KEY (Enter to skip): " PM_KEY
read -r -p "  POLYMARKET_SECRET (Enter to skip): " PM_SECRET
read -r -p "  POLYMARKET_PASSPHRASE (Enter to skip): " PM_PASS

echo ""
echo "  Kalshi (regulated US prediction markets)"
echo "  Get keys at: https://kalshi.com (Account > API Access)"
read -r -p "  KALSHI_API_KEY (Enter to skip): " KA_KEY
read -r -p "  KALSHI_API_SECRET (Enter to skip): " KA_SECRET

echo ""
echo "  Helius — Solana RPC and DAS API"
echo "  Get key at: https://helius.xyz"
read -r -p "  HELIUS_API_KEY (Enter to skip): " HELIUS_KEY

echo ""
read -r -p "  BNBCHAIN_API_KEY (Enter to skip): " BNB_KEY

# Write .keys file
mkdir -p "$(dirname "$KEYS_FILE")"
chmod 700 "$(dirname "$KEYS_FILE")"
SOLANA_ADDRESS=$(cat "$WALLETS_DIR/solana.pub" 2>/dev/null || echo '')
EVM_ADDRESS=$(cat "$WALLETS_DIR/evm.pub" 2>/dev/null || echo '')
cat > "$KEYS_FILE" << KEYSEOF
# Jelly-Claude keys — DO NOT commit this file
# Generated by setup.sh on $(date)

SOLANA_WALLET_PATH=$WALLETS_DIR/solana.json
SOLANA_ADDRESS=$SOLANA_ADDRESS
EVM_WALLET_PATH=$WALLETS_DIR/evm.json
EVM_ADDRESS=$EVM_ADDRESS

POLYMARKET_API_KEY=${PM_KEY:-}
POLYMARKET_SECRET=${PM_SECRET:-}
POLYMARKET_PASSPHRASE=${PM_PASS:-}
POLYGON_RPC_URL=https://polygon-rpc.com

KALSHI_API_KEY=${KA_KEY:-}
KALSHI_API_SECRET=${KA_SECRET:-}
KALSHI_BASE_URL=https://trading-api.kalshi.com/trade-api/v2

HELIUS_API_KEY=${HELIUS_KEY:-}
BNBCHAIN_API_KEY=${BNB_KEY:-}
KEYSEOF
chmod 600 "$KEYS_FILE"
ok "Keys saved to $KEYS_FILE"

# ── 10. Clone & install skills ───────────────────────────────────────────────
step "Cloning jelly-claude-skills..."
SKILLS_REPO_DIR="$PARENT_DIR/jelly-claude-skills"
if [[ -d "$SKILLS_REPO_DIR/.git" ]]; then
  ok "jelly-claude-skills already cloned — pulling latest..."
  git -C "$SKILLS_REPO_DIR" pull --quiet || warn "git pull failed; continuing with existing version"
elif [[ -d "$SKILLS_REPO_DIR" ]]; then
  ok "jelly-claude-skills directory found (not a git repo — using as-is)"
else
  git clone https://github.com/jelly-chain/jelly-claude-skills.git "$SKILLS_REPO_DIR"
  ok "jelly-claude-skills cloned"
fi

step "Installing all skills..."
bash "$SKILLS_REPO_DIR/install-all.sh"
ok "All skills installed"

# ── 11. Clone & install agent templates ──────────────────────────────────────
step "Cloning jelly-claude-agents..."
AGENTS_REPO_DIR="$PARENT_DIR/jelly-claude-agents"
if [[ -d "$AGENTS_REPO_DIR/.git" ]]; then
  ok "jelly-claude-agents already cloned — pulling latest..."
  git -C "$AGENTS_REPO_DIR" pull --quiet || warn "git pull failed; continuing with existing version"
elif [[ -d "$AGENTS_REPO_DIR" ]]; then
  ok "jelly-claude-agents directory found (not a git repo — using as-is)"
else
  git clone https://github.com/jelly-chain/jelly-claude-agents.git "$AGENTS_REPO_DIR"
  ok "jelly-claude-agents cloned"
fi

step "Installing all agent templates..."
bash "$AGENTS_REPO_DIR/install-all.sh"
ok "All agent templates installed"

# ── Summary ──────────────────────────────────────────────────────────────────
SOLANA_ADDRESS=$(cat "$WALLETS_DIR/solana.pub" 2>/dev/null || echo 'see ~/.jelly-claude/wallets/solana.json')
EVM_ADDRESS=$(cat "$WALLETS_DIR/evm.pub" 2>/dev/null || echo 'see ~/.jelly-claude/wallets/evm.json')

echo ""
echo -e "${CYAN}  ══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Setup complete!${NC}"
echo ""
echo "  Wallets:"
echo "    Solana:  $SOLANA_ADDRESS"
echo "    EVM/BNB: $EVM_ADDRESS"
echo ""
echo "  Next steps:"
if [[ "$ENV_HAS_KEY" == "false" ]]; then
  echo "    1. ⚠️  Add an API key to: $SCRIPT_DIR/.env"
  echo "       (ANTHROPIC_API_KEY or OPENROUTER_API_KEY)"
else
  echo "    1. ✅  API key already set in: $SCRIPT_DIR/.env"
fi
echo "    2. Fund your Solana wallet with SOL (for gas)"
echo "    3. Fund your EVM wallet with BNB (on BSC) or USDC (on Polygon)"
echo "    4. For Polymarket: deposit USDC on Polygon"
echo "    5. For Kalshi: deposit USD at https://kalshi.com"
echo ""
echo "  Start the agent:"
echo "    bash jelly-claude.sh"
echo ""
echo -e "${CYAN}  ══════════════════════════════════════════════════${NC}"
echo ""
