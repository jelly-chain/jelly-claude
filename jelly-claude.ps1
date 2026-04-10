# ─────────────────────────────────────────────────────────────────────────────
# jelly-claude.ps1  —  Jelly-Chain AI coding agent launcher (Windows PowerShell)
# GitHub: https://github.com/jelly-chain/jelly-claude
# ─────────────────────────────────────────────────────────────────────────────

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile = Join-Path $ScriptDir ".env"

# ── Load .env ────────────────────────────────────────────────────────────────
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
    Write-Host "  WARNING: No .env file found." -ForegroundColor Yellow
    Write-Host "  Copy .env.example to .env and fill in at least one API key."
    Write-Host "  Run: Copy-Item .env.example .env"
    Write-Host ""
    exit 1
}

$AnthropicKey = [System.Environment]::GetEnvironmentVariable("ANTHROPIC_API_KEY", "Process")
$OpenRouterKey = [System.Environment]::GetEnvironmentVariable("OPENROUTER_API_KEY", "Process")

# ── Check which key is available ─────────────────────────────────────────────
if ($AnthropicKey) {
    Write-Host ""
    Write-Host "  OK  Anthropic API key detected - launching with Claude paid models." -ForegroundColor Green
    Write-Host ""
    & claude @args

} elseif ($OpenRouterKey) {
    Write-Host ""
    Write-Host "  OK  OpenRouter API key detected - launching with OpenRouter model tiers." -ForegroundColor Green
    Write-Host ""

    # ── Model tiers ──────────────────────────────────────────────────────────
    $env:ANTHROPIC_API_KEY              = $OpenRouterKey
    $env:ANTHROPIC_BASE_URL             = "https://openrouter.ai/api/v1"
    $env:ANTHROPIC_DEFAULT_OPUS_MODEL   = "google/gemma-4-31b-it:free"
    $env:ANTHROPIC_DEFAULT_SONNET_MODEL = "arcee-ai/trinity-large-preview:free"
    $env:ANTHROPIC_DEFAULT_HAIKU_MODEL  = "nvidia/nemotron-3-super-120b-a12b"
    $env:CLAUDE_CODE_SUBAGENT_MODEL     = "nvidia/nemotron-3-super-120b-a12b:free"

    & claude @args

} else {
    Write-Host ""
    Write-Host "  ERROR: No API key found." -ForegroundColor Red
    Write-Host ""
    Write-Host "  You need either:"
    Write-Host "    ANTHROPIC_API_KEY   - get one at https://console.anthropic.com"
    Write-Host "    OPENROUTER_API_KEY  - get one at https://openrouter.ai/keys"
    Write-Host ""
    Write-Host "  Add the key to your .env file and try again."
    Write-Host ""
    exit 1
}
