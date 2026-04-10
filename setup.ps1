# ─────────────────────────────────────────────────────────────────────────────
# setup.ps1  —  Jelly-Claude first-time setup wizard (Windows PowerShell)
# Run once after cloning: .\setup.ps1
# ─────────────────────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"

$JellyHome  = Join-Path $env:USERPROFILE ".jelly-claude"
$WalletsDir = Join-Path $JellyHome "wallets"
$KeysFile   = Join-Path $JellyHome ".keys"
$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$ParentDir  = Split-Path -Parent $ScriptDir

function Step($msg)  { Write-Host "  > $msg" -ForegroundColor Cyan }
function Ok($msg)    { Write-Host "  + $msg" -ForegroundColor Green }
function Warn($msg)  { Write-Host "  ! $msg" -ForegroundColor Yellow }
function Err($msg)   { Write-Host "  X $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║         Jelly-Claude Setup Wizard                ║" -ForegroundColor Cyan
Write-Host "  ║   Multi-Chain AI Agent — github.com/jelly-chain  ║" -ForegroundColor Cyan
Write-Host "  ╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── 1. Check Node.js ─────────────────────────────────────────────────────────
Step "Checking Node.js..."
try { $nodeVer = node --version; Ok "Node.js $nodeVer found" }
catch { Err "Node.js not found. Install from https://nodejs.org (v18+)"; exit 1 }

# ── 2. Check npm ─────────────────────────────────────────────────────────────
Step "Checking npm..."
try { $npmVer = npm --version; Ok "npm $npmVer found" }
catch { Err "npm not found. Re-install Node.js"; exit 1 }

# ── 3. Check git ─────────────────────────────────────────────────────────────
Step "Checking git..."
try { $gitVer = git --version; Ok "$gitVer" }
catch { Err "git not found. Install from https://git-scm.com"; exit 1 }

# ── 4. Install Claude Code ───────────────────────────────────────────────────
Step "Installing Claude Code CLI..."
$claudeExists = Get-Command claude -ErrorAction SilentlyContinue
if ($claudeExists) {
    Ok "Claude Code already installed"
} else {
    npm install -g @anthropic-ai/claude-code
    Ok "Claude Code installed"
}

# ── 5. Setup .env ────────────────────────────────────────────────────────────
Step "Setting up .env..."
$envPath = Join-Path $ScriptDir ".env"
if (-not (Test-Path $envPath)) {
    Copy-Item (Join-Path $ScriptDir ".env.example") $envPath
    Warn ".env created — add your API key before running jelly-claude.ps1"
} else {
    Ok ".env already exists"
}

# ── 6. Create wallet directory ───────────────────────────────────────────────
Step "Creating wallet directory..."
New-Item -ItemType Directory -Force -Path $WalletsDir | Out-Null
Ok "Wallet directory: $WalletsDir"

# ── 7. Generate Solana wallet ────────────────────────────────────────────────
Step "Generating Solana wallet..."
$solKeyPath = Join-Path $WalletsDir "solana.json"
$solPubPath = Join-Path $WalletsDir "solana.pub"

if (Test-Path $solKeyPath) {
    $solAddr = Get-Content $solPubPath -ErrorAction SilentlyContinue
    Ok "Solana wallet already exists: $solAddr"
} else {
    $walletDirEsc = $WalletsDir.Replace("\", "\\")
    $solScript = @"
const crypto = require('crypto');
const fs = require('fs');
const walletDir = '$walletDirEsc';
const keyPath = walletDir + '/solana.json';
const pubPath = walletDir + '/solana.pub';
const kp = crypto.generateKeyPairSync('ed25519', {
  privateKeyEncoding: { type: 'pkcs8', format: 'der' },
  publicKeyEncoding:  { type: 'spki', format: 'der' },
});
const priv32 = kp.privateKey.slice(-32);
const pub32  = kp.publicKey.slice(-32);
fs.writeFileSync(keyPath, JSON.stringify(Array.from(Buffer.concat([priv32, pub32]))));
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
let n = BigInt('0x' + pub32.toString('hex'));
let addr = '';
while (n > 0n) { addr = B58[Number(n % 58n)] + addr; n /= 58n; }
for (let i = 0; i < pub32.length && pub32[i] === 0; i++) addr = '1' + addr;
fs.writeFileSync(pubPath, addr);
console.log(addr);
"@
    $solAddr = node -e $solScript
    Ok "Solana wallet generated: $solAddr"
}

# ── 8. Generate EVM wallet with real address via ethers.js ───────────────────
Step "Generating EVM wallet (BNB + Polygon)..."
$evmKeyPath = Join-Path $WalletsDir "evm.json"
$evmPubPath = Join-Path $WalletsDir "evm.pub"

if (Test-Path $evmKeyPath) {
    $evmAddr = Get-Content $evmPubPath -ErrorAction SilentlyContinue
    Ok "EVM wallet already exists: $evmAddr"
} else {
    Step "Installing ethers.js for wallet derivation (temp)..."
    $ethersTmp = Join-Path $env:TEMP "jelly-ethers-$(Get-Random)"
    New-Item -ItemType Directory -Force -Path $ethersTmp | Out-Null
    npm install --prefix $ethersTmp ethers --silent 2>&1 | Out-Null

    $walletDirEsc = $WalletsDir.Replace("\", "\\")
    $ethersTmpEsc = $ethersTmp.Replace("\", "\\")
    $evmScript = @"
const { ethers } = require('$ethersTmpEsc/node_modules/ethers');
const fs = require('fs');
const walletDir = '$walletDirEsc';
const wallet = ethers.Wallet.createRandom();
fs.writeFileSync(walletDir + '/evm.json', JSON.stringify({
  address: wallet.address,
  privateKey: wallet.privateKey,
  mnemonic: wallet.mnemonic ? wallet.mnemonic.phrase : null,
}));
fs.writeFileSync(walletDir + '/evm.pub', wallet.address);
console.log(wallet.address);
"@
    $evmAddr = node -e $evmScript
    Remove-Item -Recurse -Force $ethersTmp -ErrorAction SilentlyContinue
    Ok "EVM wallet generated: $evmAddr"
}

# ── 9. Optional API keys ─────────────────────────────────────────────────────
Step "Optional: Prediction market & service API keys"
Write-Host ""
Write-Host "  Polymarket — https://app.polymarket.com (Settings > API)"
$pmKey  = Read-Host "  POLYMARKET_API_KEY (Enter to skip)"
$pmSec  = Read-Host "  POLYMARKET_SECRET (Enter to skip)"
$pmPass = Read-Host "  POLYMARKET_PASSPHRASE (Enter to skip)"
Write-Host ""
Write-Host "  Kalshi — https://kalshi.com (Account > API Access)"
$kaKey = Read-Host "  KALSHI_API_KEY (Enter to skip)"
$kaSec = Read-Host "  KALSHI_API_SECRET (Enter to skip)"
Write-Host ""
Write-Host "  Helius — https://helius.xyz"
$helius = Read-Host "  HELIUS_API_KEY (Enter to skip)"
Write-Host ""
$bnbKey = Read-Host "  BNBCHAIN_API_KEY (Enter to skip)"

$solAddr = Get-Content $solPubPath -ErrorAction SilentlyContinue
$evmAddr = Get-Content $evmPubPath -ErrorAction SilentlyContinue

$keysContent = @"
# Jelly-Claude keys - DO NOT commit this file

SOLANA_WALLET_PATH=$WalletsDir\solana.json
SOLANA_ADDRESS=$solAddr
EVM_WALLET_PATH=$WalletsDir\evm.json
EVM_ADDRESS=$evmAddr

POLYMARKET_API_KEY=$pmKey
POLYMARKET_SECRET=$pmSec
POLYMARKET_PASSPHRASE=$pmPass
POLYGON_RPC_URL=https://polygon-rpc.com

KALSHI_API_KEY=$kaKey
KALSHI_API_SECRET=$kaSec
KALSHI_BASE_URL=https://trading-api.kalshi.com/trade-api/v2

HELIUS_API_KEY=$helius
BNBCHAIN_API_KEY=$bnbKey
"@
New-Item -ItemType Directory -Force -Path $JellyHome | Out-Null
Set-Content -Path $KeysFile -Value $keysContent
Ok "Keys saved to $KeysFile"

# ── 10. Clone & install skills ───────────────────────────────────────────────
Step "Setting up jelly-claude-skills..."
$skillsRepo = Join-Path $ParentDir "jelly-claude-skills"
if (Test-Path (Join-Path $skillsRepo ".git")) {
    Ok "jelly-claude-skills already cloned — pulling latest..."
    git -C $skillsRepo pull --quiet 2>&1 | Out-Null
} elseif (Test-Path $skillsRepo) {
    Ok "jelly-claude-skills directory found (using as-is)"
} else {
    git clone https://github.com/jelly-chain/jelly-claude-skills.git $skillsRepo
    Ok "jelly-claude-skills cloned"
}
Step "Installing all skills..."
& (Join-Path $skillsRepo "install-all.ps1")
Ok "All skills installed"

# ── 11. Clone & install agent templates ──────────────────────────────────────
Step "Setting up jelly-claude-agents..."
$agentsRepo = Join-Path $ParentDir "jelly-claude-agents"
if (Test-Path (Join-Path $agentsRepo ".git")) {
    Ok "jelly-claude-agents already cloned — pulling latest..."
    git -C $agentsRepo pull --quiet 2>&1 | Out-Null
} elseif (Test-Path $agentsRepo) {
    Ok "jelly-claude-agents directory found (using as-is)"
} else {
    git clone https://github.com/jelly-chain/jelly-claude-agents.git $agentsRepo
    Ok "jelly-claude-agents cloned"
}
Step "Installing all agent templates..."
& (Join-Path $agentsRepo "install-all.ps1")
Ok "All agent templates installed"

# ── Summary ──────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "  Wallets:"
Write-Host "    Solana:  $(Get-Content $solPubPath -ErrorAction SilentlyContinue)"
Write-Host "    EVM/BNB: $(Get-Content $evmPubPath -ErrorAction SilentlyContinue)"
Write-Host ""
Write-Host "  Next steps:"
Write-Host "    1. Add your API key to: $envPath"
Write-Host "    2. Fund your Solana wallet with SOL"
Write-Host "    3. Fund your EVM wallet with BNB (on BSC) or USDC (on Polygon)"
Write-Host "    4. For Polymarket: deposit USDC on Polygon"
Write-Host "    5. For Kalshi: deposit USD at https://kalshi.com"
Write-Host "    6. Start: .\jelly-claude.ps1"
Write-Host ""
