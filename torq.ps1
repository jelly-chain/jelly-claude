# ─────────────────────────────────────────────────────────────────────────────
# torq.ps1  —  Jelly-Claude TORQ mode launcher (Windows PowerShell)
# Token-optimised launch using high-performance OpenRouter models.
# GitHub: https://github.com/jelly-chain/jelly-claude
# ─────────────────────────────────────────────────────────────────────────────

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile = Join-Path $ScriptDir ".env"

# Locate proxy.mjs
$ProxyFile = $null
if (Test-Path (Join-Path $ScriptDir "proxy.mjs")) {
  $ProxyFile = Join-Path $ScriptDir "proxy.mjs"
} elseif (Test-Path (Join-Path (Split-Path $ScriptDir) "proxy.mjs")) {
  $ProxyFile = Join-Path (Split-Path $ScriptDir) "proxy.mjs"
}

# Load .env
if (Test-Path $EnvFile) {
  Get-Content $EnvFile | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]*)=(.*)$") {
      [System.Environment]::SetEnvironmentVariable($Matches[1].Trim(), $Matches[2].Trim(), "Process")
    }
  }
}

# TORQ banner
Write-Host ""
Write-Host "  ⚡  TORQ MODE — high-performance token-optimised models"
Write-Host ""

# If Anthropic key — no proxy needed
if ($env:ANTHROPIC_API_KEY) {
  Write-Host "  ✅  Anthropic API key detected — launching with paid Claude models."
  Write-Host ""
  claude @args
  exit
}

# OpenRouter path
if (-not $env:OPENROUTER_API_KEY) {
  Write-Host "  ℹ️  No API key found — falling through to Claude's built-in login."
  Write-Host ""
  Write-Host "  For TORQ mode, add your OpenRouter key to .env:"
  Write-Host "    OPENROUTER_API_KEY=<your key>   — get one at https://openrouter.ai/keys"
  Write-Host ""
  claude @args
  exit
}

Write-Host "  ✅  OpenRouter key detected — starting proxy with TORQ model tiers."
Write-Host ""

if (-not $ProxyFile) {
  Write-Host "  ❌  proxy.mjs not found"
  exit 1
}

# Start proxy
$ProxyProcess = Start-Process node -ArgumentList $ProxyFile -PassThru -WindowStyle Hidden

# Wait for proxy to be ready (up to 10s)
$Ready = $false
for ($i = 0; $i -lt 20; $i++) {
  try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $tcp.Connect("127.0.0.1", 7788)
    $tcp.Close()
    $Ready = $true
    break
  } catch {
    Start-Sleep -Milliseconds 500
  }
}

if (-not $Ready) {
  Write-Host "  ❌  Proxy did not start on port 7788 within 10 seconds — aborting."
  Stop-Process -Id $ProxyProcess.Id -Force -ErrorAction SilentlyContinue
  exit 1
}

# TORQ model tiers — read TORQ_* overrides from .env, fall back to defaults
$Opus    = if ($env:TORQ_OPUS_MODEL)    { $env:TORQ_OPUS_MODEL }    else { "qwen/qwen3.6-plus" }
$Sonnet  = if ($env:TORQ_SONNET_MODEL)  { $env:TORQ_SONNET_MODEL }  else { "nvidia/nemotron-3-super-120b-a12b" }
$Haiku   = if ($env:TORQ_HAIKU_MODEL)   { $env:TORQ_HAIKU_MODEL }   else { "z-ai/glm-5.1" }
$Subagent = if ($env:TORQ_SUBAGENT_MODEL) { $env:TORQ_SUBAGENT_MODEL } else { "google/gemma-4-26b-a4b-it" }

$env:ANTHROPIC_API_KEY               = $env:OPENROUTER_API_KEY
$env:ANTHROPIC_BASE_URL              = "http://127.0.0.1:7788"
$env:ANTHROPIC_DEFAULT_OPUS_MODEL    = $Opus
$env:ANTHROPIC_DEFAULT_SONNET_MODEL  = $Sonnet
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL   = $Haiku
$env:CLAUDE_CODE_SUBAGENT_MODEL      = $Subagent

Write-Host "  Models:"
Write-Host "    Opus     → $Opus"
Write-Host "    Sonnet   → $Sonnet"
Write-Host "    Haiku    → $Haiku"
Write-Host "    Subagent → $Subagent"
Write-Host ""

try {
  claude @args
} finally {
  Stop-Process -Id $ProxyProcess.Id -Force -ErrorAction SilentlyContinue
}
