# ─────────────────────────────────────────────────────────────────────────────
# install-all.ps1  —  Install all Jelly-Claude agent templates (Windows)
# ─────────────────────────────────────────────────────────────────────────────

$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$AgentsDir  = Join-Path $ScriptDir "agents"
$DestDir    = Join-Path $env:USERPROFILE ".claude/agents"
$Only       = if ($args.Count -gt 1 -and $args[0] -eq "--only") { $args[1] } else { "" }

New-Item -ItemType Directory -Force -Path $DestDir | Out-Null

Write-Host ""
Write-Host "  Installing Jelly-Claude agent templates..." -ForegroundColor Cyan
Write-Host ""

$installed = 0

Get-ChildItem -Path $AgentsDir -Directory | ForEach-Object {
    $agentName = $_.Name
    $agentMd   = Join-Path $_.FullName "agent.md"

    if ($Only -and $agentName -ne $Only) { return }

    if (Test-Path $agentMd) {
        Copy-Item $agentMd (Join-Path $DestDir "$agentName.md") -Force
        Write-Host "  + $agentName" -ForegroundColor Green
        $installed++
    } else {
        Write-Host "  ! $agentName - no agent.md" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "  Done! $installed agent templates installed to $DestDir" -ForegroundColor Green
Write-Host "  Use inside Claude Code: /agent <agent-name>"
Write-Host ""
