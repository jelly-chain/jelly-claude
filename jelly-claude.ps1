# ─────────────────────────────────────────────────────────────────────────────
# jelly-claude.ps1  —  Jelly-Chain AI coding agent launcher (Windows PowerShell)
# GitHub: https://github.com/jelly-chain/jelly-claude
# ─────────────────────────────────────────────────────────────────────────────

$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$EnvFile   = Join-Path $ScriptDir ".env"

# proxy.mjs bundled with this repo; fall back to parent directory if needed
$ProxyFile = $null
if (Test-Path (Join-Path $ScriptDir "proxy.mjs")) {
    $ProxyFile = Join-Path $ScriptDir "proxy.mjs"
} elseif (Test-Path (Join-Path (Split-Path -Parent $ScriptDir) "proxy.mjs")) {
    $ProxyFile = Join-Path (Split-Path -Parent $ScriptDir) "proxy.mjs"
}

# Path to the Jelly wrapper (replaces raw claude with branded output)
$WrapperFile = Join-Path $ScriptDir "core\jelly-wrapper.mjs"

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

# ── Telegram bridge mode — delegate entirely to jelly-claude.mjs ─────────────
# jelly-claude.mjs handles proxy setup + TG bridge in a single Node.js process.
if ($args -contains '--telegram') {
    & node (Join-Path $ScriptDir "jelly-claude.mjs") @args
    exit $LASTEXITCODE
}

# ── Check which key is available ─────────────────────────────────────────────
if ($AnthropicKey) {
    Write-Host ""
    Write-Host "  OK  Anthropic API key detected - launching with Jelly (Claude backend)." -ForegroundColor Green
    Write-Host ""
    & node $WrapperFile @args
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

    # ── Pre-spawn preflight: ensure port 7788 is free (kills stale proxy) ──────
    & node (Join-Path $ScriptDir "scripts\proxy-preflight.mjs")
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERROR: Port 7788 could not be freed - aborting." -ForegroundColor Red
        exit 1
    }

    $proxyProc = Start-Process -FilePath "node" -ArgumentList $ProxyFile `
                               -PassThru -WindowStyle Hidden

    # Wait for port 7788 to be ready (up to 10 s, 20 x 0.5 s)
    # Verify our spawned process is still alive on each poll.
    $ready = $false
    for ($i = 0; $i -lt 20; $i++) {
        if ($proxyProc.HasExited) {
            Write-Host "  ERROR: Proxy process exited unexpectedly - aborting." -ForegroundColor Red
            exit 1
        }
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

    # Final ownership check: our spawned process must still be alive
    if ($proxyProc.HasExited) {
        Write-Host "  ERROR: Proxy process died after port became ready - another process may own port 7788." -ForegroundColor Red
        exit 1
    }

    # ── Model tiers ──────────────────────────────────────────────────────────
    $env:ANTHROPIC_API_KEY              = $OpenRouterKey
    $env:ANTHROPIC_BASE_URL             = "http://127.0.0.1:7788"
    $env:ANTHROPIC_DEFAULT_OPUS_MODEL   = "deepseek/deepseek-v4-pro"
    $env:ANTHROPIC_DEFAULT_SONNET_MODEL = "x-ai/grok-4.3"
    $env:ANTHROPIC_DEFAULT_HAIKU_MODEL  = "nvidia/nemotron-3-nano-30b-a3b:exacto"
    $env:CLAUDE_CODE_SUBAGENT_MODEL     = "qwen/qwen3-next-80b-a3b-thinking"

    # Run claude via wrapper so output gets Jelly branding
    try {
        & node $WrapperFile @args
        $exitCode = $LASTEXITCODE
    } finally {
        Stop-Process -Id $proxyProc.Id -Force -ErrorAction SilentlyContinue
    }
    exit $exitCode

} else {
    Write-Host ""
    Write-Host "  INFO: No API key found - falling through to Jelly login." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  To use free OpenRouter models instead, add to your .env:"
    Write-Host "    OPENROUTER_API_KEY=<your key>   - get one at https://openrouter.ai/keys"
    Write-Host ""
    Write-Host "  To use paid Claude models, add:"
    Write-Host "    ANTHROPIC_API_KEY=<your key>    - get one at https://console.anthropic.com"
    Write-Host ""
    & node $WrapperFile @args
    exit $LASTEXITCODE
}
