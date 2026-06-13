# ─────────────────────────────────────────────────────────────────────────────
# setup.ps1  —  Jelly-Claude first-time setup wizard (Windows PowerShell)
# Run once after cloning: .\setup.ps1
# ─────────────────────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"

# ── Execution policy check ────────────────────────────────────────────────────
$policy = Get-ExecutionPolicy -Scope CurrentUser
if ($policy -eq "Restricted" -or $policy -eq "Undefined") {
    Write-Host ""
    Write-Host "  Your PowerShell execution policy is '$policy'." -ForegroundColor Yellow
    Write-Host "  setup.ps1 needs to set it to RemoteSigned for the current user only." -ForegroundColor Yellow
    $consent = Read-Host "  Apply 'Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned'? [Y/n]"
    if ($consent -eq '' -or $consent -match '^[Yy]') {
        try {
            Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
            Write-Host "  + Execution policy updated to RemoteSigned." -ForegroundColor Green
        } catch {
            Write-Host "  X Could not set execution policy: $_" -ForegroundColor Red
            Write-Host "    Run manually: Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned"
            exit 1
        }
    } else {
        Write-Host "  Skipped. You may need to set it manually before scripts can run." -ForegroundColor Yellow
    }
    Write-Host ""
}

$JellyHome  = Join-Path $env:USERPROFILE ".jelly-claude"
$WalletsDir = Join-Path $JellyHome "wallets"
$KeysFile   = Join-Path $JellyHome ".keys"
$ScriptDir  = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
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

# ── 4b. Install local dependencies (node-pty, ink, etc.) ────────────────────
Step "Installing Jelly dependencies..."
if (Test-Path (Join-Path $ScriptDir "package.json")) {
    Push-Location $ScriptDir
    try {
        npm install --silent 2>$null
        if ($LASTEXITCODE -ne 0) { npm install }
        if (Test-Path (Join-Path $ScriptDir "node_modules\node-pty")) {
            npm rebuild node-pty 2>$null
        }
        Ok "Dependencies installed"
    } finally {
        Pop-Location
    }
} else {
    Warn "package.json not found — skipping npm install"
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
    $solScriptContent = @"
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
    $solTmpFile = Join-Path $env:TEMP "jelly-sol-$(Get-Random).cjs"
    try {
        Set-Content -Path $solTmpFile -Value $solScriptContent -Encoding UTF8
        $solAddr = & node $solTmpFile
        Ok "Solana wallet generated: $solAddr"
    } finally {
        Remove-Item -Force $solTmpFile -ErrorAction SilentlyContinue
    }
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
    $evmScriptContent = @"
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
    $evmTmpFile = Join-Path $env:TEMP "jelly-evm-$(Get-Random).cjs"
    try {
        Set-Content -Path $evmTmpFile -Value $evmScriptContent -Encoding UTF8
        $evmAddr = & node $evmTmpFile
        Ok "EVM wallet generated: $evmAddr"
    } finally {
        Remove-Item -Force $evmTmpFile -ErrorAction SilentlyContinue
        Remove-Item -Recurse -Force $ethersTmp -ErrorAction SilentlyContinue
    }
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
Write-Host ""
Write-Host "  predict.fun — https://discord.gg/predictdotfun (open a support ticket)"
$predictKey = Read-Host "  PREDICT_API_KEY (Enter to skip)"

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

PREDICT_API_KEY=$predictKey
PREDICT_BASE_URL=https://api.predict.fun
BNB_RPC_URL=https://bsc-dataseed.binance.org

HELIUS_API_KEY=$helius
BNBCHAIN_API_KEY=$bnbKey
"@
New-Item -ItemType Directory -Force -Path $JellyHome | Out-Null
Set-Content -Path $KeysFile -Value $keysContent
Ok "Keys saved to $KeysFile"

# ── 10. Clone & install skills ───────────────────────────────────────────────
# install-skills.mjs handles clone → bundled fallback internally; always run it.
Step "Installing skills (clone or bundled fallback)..."
& node (Join-Path $ScriptDir "scripts\install-skills.mjs")
if ($LASTEXITCODE -ne 0) {
    Write-Host "  X install-skills.mjs failed (exit code $LASTEXITCODE)" -ForegroundColor Red
    exit $LASTEXITCODE
}
Ok "Skills install complete"

# ── 11. Clone & install agent templates ──────────────────────────────────────
# install-agents.mjs handles clone → bundled fallback internally; always run it.
Step "Installing agent templates (clone or bundled fallback)..."
& node (Join-Path $ScriptDir "scripts\install-agents.mjs")
if ($LASTEXITCODE -ne 0) {
    Write-Host "  X install-agents.mjs failed (exit code $LASTEXITCODE)" -ForegroundColor Red
    exit $LASTEXITCODE
}
Ok "Agent templates install complete"

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
