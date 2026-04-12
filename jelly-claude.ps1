# ─────────────────────────────────────────────────────────────────────────────
# jelly-claude.ps1  —  Jelly-Chain AI coding agent launcher (Windows PowerShell)
# GitHub: https://github.com/jelly-chain/jelly-claude
# ─────────────────────────────────────────────────────────────────────────────

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile   = Join-Path $ScriptDir ".env"

# proxy.mjs bundled with this repo; fall back to parent directory if needed
$ProxyFile = $null
if (Test-Path (Join-Path $ScriptDir "proxy.mjs")) {
    $ProxyFile = Join-Path $ScriptDir "proxy.mjs"
} elseif (Test-Path (Join-Path (Split-Path -Parent $ScriptDir) "proxy.mjs")) {
    $ProxyFile = Join-Path (Split-Path -Parent $ScriptDir) "proxy.mjs"
}

# ── Load .env (optional — missing .env does not block; env vars may be set in shell) ─
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $parts = $line -split "=", 2
            if ($parts.Length -eq 2) {
                $key = $parts[0].Trim()
                $val = $parts[1].Trim().Trim('"').Trim("'")
                [System.Environment]::SetEnvironmentVariable($key, $val, "Process")
            }
        }
    }
} else {
    Write-Host ""
    Write-Host "  INFO: No .env file found - checking environment variables." -ForegroundColor Cyan
    Write-Host "  To configure keys for next time, run: Copy-Item .env.example .env"
    Write-Host ""
}

$AnthropicKey  = [System.Environment]::GetEnvironmentVariable("ANTHROPIC_API_KEY",  "Process")
$OpenRouterKey = [System.Environment]::GetEnvironmentVariable("OPENROUTER_API_KEY", "Process")

# ── Check which key is available ─────────────────────────────────────────────
if ($AnthropicKey) {
    Write-Host ""
    Write-Host "  OK  Anthropic API key detected - launching with Claude paid models." -ForegroundColor Green
    Write-Host ""
    & claude @args
    exit $LASTEXITCODE

} elseif ($OpenRouterKey) {
    Write-Host ""
    Write-Host "  OK  OpenRouter API key detected - starting proxy and launching with free model tiers." -ForegroundColor Green
    Write-Host ""

    # ── Start OpenRouter proxy ────────────────────────────────────────────────
    if (-not $ProxyFile) {
        Write-Host "  ERROR: proxy.mjs not found in $ScriptDir or parent directory." -ForegroundColor Red
        exit 1
    }

    $proxyProc = Start-Process -FilePath "node" -ArgumentList $ProxyFile `
                               -PassThru -WindowStyle Hidden

    # Wait for port 7788 to be ready (up to 10 s, 20 x 0.5 s)
    $ready = $false
    for ($i = 0; $i -lt 20; $i++) {
        try {
            $tcp = New-Object System.Net.Sockets.TcpClient
            $tcp.Connect("127.0.0.1", 7788)
            $tcp.Close()
            $ready = $true
            break
        } catch {
            Start-Sleep -Milliseconds 500
        }
    }

    if (-not $ready) {
        Write-Host "  ERROR: Proxy did not start on port 7788 within 10 seconds - aborting." -ForegroundColor Red
        Stop-Process -Id $proxyProc.Id -Force -ErrorAction SilentlyContinue
        exit 1
    }

    # ── Model tiers ──────────────────────────────────────────────────────────
    $env:ANTHROPIC_API_KEY              = $OpenRouterKey
    $env:ANTHROPIC_BASE_URL             = "http://127.0.0.1:7788"
    $env:ANTHROPIC_DEFAULT_OPUS_MODEL   = "qwen/qwen3.6-plus"
    $env:ANTHROPIC_DEFAULT_SONNET_MODEL = "nvidia/nemotron-3-super-120b-a12b"
    $env:ANTHROPIC_DEFAULT_HAIKU_MODEL  = "z-ai/glm-5.1"
    $env:CLAUDE_CODE_SUBAGENT_MODEL     = "google/gemma-4-26b-a4b-it"

    # Run claude as a child process so the finally block can clean up the proxy
    try {
        & claude @args
        $exitCode = $LASTEXITCODE
    } finally {
        Stop-Process -Id $proxyProc.Id -Force -ErrorAction SilentlyContinue
    }
    exit $exitCode

} else {
    Write-Host ""
    Write-Host "  INFO: No API key found - falling through to Claude's built-in login." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  To use free OpenRouter models instead, add to your .env:"
    Write-Host "    OPENROUTER_API_KEY=<your key>   - get one at https://openrouter.ai/keys"
    Write-Host ""
    Write-Host "  To use paid Claude models, add:"
    Write-Host "    ANTHROPIC_API_KEY=<your key>    - get one at https://console.anthropic.com"
    Write-Host ""
    & claude @args
    exit $LASTEXITCODE
}
