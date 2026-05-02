# install-all.ps1 — Install all Jelly-Social agent templates (Windows PowerShell)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$AgentsDir = Join-Path $ScriptDir "agents"
$DestDir   = "$env:USERPROFILE\.claude\agents"
$Installed = 0
$Skipped   = 0

New-Item -ItemType Directory -Force -Path $DestDir | Out-Null

Write-Host ""
Write-Host "  Installing all Jelly-Social agent templates..." -ForegroundColor Cyan
Write-Host ""

foreach ($agentDir in Get-ChildItem -Path $AgentsDir -Directory) {
  $agentFile = Join-Path $agentDir.FullName "agent.md"
  if (Test-Path $agentFile) {
    Copy-Item $agentFile (Join-Path $DestDir "$($agentDir.Name).md") -Force
    Write-Host "  -> $($agentDir.Name)" -ForegroundColor Cyan
    $Installed++
  } else {
    Write-Host "  ⚠ $($agentDir.Name) — no agent.md found, skipping" -ForegroundColor Yellow
    $Skipped++
  }
}

Write-Host ""
Write-Host "  Done! Installed: $Installed   Skipped: $Skipped" -ForegroundColor Green
Write-Host ""
Write-Host "  Use agents inside Claude Code with: /agent <agent-name>"
Write-Host ""
