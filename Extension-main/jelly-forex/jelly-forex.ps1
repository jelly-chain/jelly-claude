# jelly-forex.ps1 — Launch Claude Code with jelly-forex skills loaded (Windows)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$KeysFile  = "$env:USERPROFILE\.jelly-forex\.keys"
$ProxyPort = 7788

Write-Host ""
Write-Host "  Jelly-Forex — Traditional Finance AI Agent" -ForegroundColor Cyan
Write-Host ""

# ── Load keys ────────────────────────────────────────────────────────────────
if (Test-Path $KeysFile) {
  Get-Content $KeysFile | ForEach-Object {
    if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
      [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
  }
  Write-Host "  [OK] Keys loaded from $KeysFile" -ForegroundColor Green
} else {
  Write-Host "  [!] No keys file found at $KeysFile" -ForegroundColor Yellow
  Write-Host "      Run .\setup.ps1 first." -ForegroundColor Yellow
}

# ── Check for Claude Code ─────────────────────────────────────────────────────
$claudeCmd = Get-Command claude -ErrorAction SilentlyContinue
if (-not $claudeCmd) {
  Write-Host "  [X] Claude Code not found. Run: npm install -g @anthropic-ai/claude-code" -ForegroundColor Red
  exit 1
}

# ── Start proxy.mjs ───────────────────────────────────────────────────────────
$proxyPath = Join-Path $ScriptDir "proxy.mjs"
$proxyProc = $null
if (Test-Path $proxyPath) {
  $proxyProc = Start-Process node -ArgumentList $proxyPath -PassThru -WindowStyle Hidden
  Write-Host "  [OK] Proxy started (PID $($proxyProc.Id))" -ForegroundColor Green

  # Wait for port 7788 to be ready (up to 10 seconds)
  $waited = 0
  while ($waited -lt 10) {
    try {
      $tcp = New-Object System.Net.Sockets.TcpClient
      $tcp.Connect("127.0.0.1", $ProxyPort)
      $tcp.Close()
      break
    } catch { Start-Sleep 1; $waited++ }
  }
}

# ── Paper/practice mode reminder ─────────────────────────────────────────────
Write-Host ""
Write-Host "  Paper trading and practice forex mode are active by default." -ForegroundColor Yellow
Write-Host "  Confirm live trading intent explicitly before using real money." -ForegroundColor Yellow
Write-Host ""

# ── Start Claude Code ─────────────────────────────────────────────────────────
Write-Host "  Starting Claude Code..." -ForegroundColor Cyan
Write-Host ""

try {
  Set-Location $ScriptDir
  & claude
} finally {
  if ($proxyProc -and -not $proxyProc.HasExited) {
    Stop-Process -Id $proxyProc.Id -Force -ErrorAction SilentlyContinue
    Write-Host "  [OK] Proxy stopped." -ForegroundColor Green
  }
}
