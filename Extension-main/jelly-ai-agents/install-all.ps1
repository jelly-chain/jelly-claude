# install-all.ps1 — Install all Jelly-AI agent templates (Windows PowerShell)
# Usage: .\install-all.ps1           — install all agents
#        .\install-all.ps1 --only gpt-coder  — install one agent

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$AgentsDir = Join-Path $ScriptDir "agents"
$DestDir   = "$env:USERPROFILE\.claude\agents"
$Installed = 0
$Skipped   = 0

# --only <agent-name> parsing (mirrors jelly-claude baseline $args approach)
$Only = ""
for ($i = 0; $i -lt $args.Count; $i++) {
  if ($args[$i] -eq "--only" -and ($i + 1) -lt $args.Count) {
    $Only = $args[$i + 1]
    break
  }
}

New-Item -ItemType Directory -Force -Path $DestDir | Out-Null

Write-Host ""
Write-Host "  Installing Jelly-AI agent templates..." -ForegroundColor Cyan
Write-Host ""

foreach ($agentDir in Get-ChildItem -Path $AgentsDir -Directory) {
  if ($Only -and $agentDir.Name -ne $Only) { continue }

  $agentFile = Join-Path $agentDir.FullName "agent.md"
  if (Test-Path $agentFile) {
    Copy-Item $agentFile (Join-Path $DestDir "$($agentDir.Name).md") -Force
    Write-Host "  -> $($agentDir.Name)" -ForegroundColor Cyan
    $Installed++
  } else {
    Write-Host "  ! $($agentDir.Name) — no agent.md found, skipping" -ForegroundColor Yellow
    $Skipped++
  }
}

Write-Host ""
Write-Host "  Done! Installed: $Installed   Skipped: $Skipped" -ForegroundColor Green
Write-Host ""
Write-Host "  Use agents inside Claude Code with: /agent <agent-name>"
Write-Host ""
