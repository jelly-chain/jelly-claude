# install-all.ps1 — Install all jelly-forex agent templates (Windows)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$AgentsDir = Join-Path $ScriptDir "agents"
$DestDir   = "$env:USERPROFILE\.claude\agents"
$Installed = 0

$Only = ""
for ($i = 0; $i -lt $args.Count; $i++) {
  if ($args[$i] -eq "--only" -and ($i + 1) -lt $args.Count) {
    $Only = $args[$i + 1]
    $i++
  }
}

New-Item -ItemType Directory -Force -Path $DestDir | Out-Null

Write-Host ""
Write-Host "  Installing jelly-forex agent templates..." -ForegroundColor Cyan
Write-Host ""

Get-ChildItem -Path $AgentsDir -Directory | ForEach-Object {
  $agentName = $_.Name
  $agentMd   = Join-Path $_.FullName "agent.md"

  if ($Only -and $agentName -ne $Only) { return }

  if (Test-Path $agentMd) {
    Copy-Item $agentMd (Join-Path $DestDir "$agentName.md") -Force
    Write-Host "  [OK] $agentName" -ForegroundColor Green
    $Installed++
  } else {
    Write-Host "  [!] $agentName — no agent.md found" -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "  Done! $Installed agent templates installed to $DestDir" -ForegroundColor Green
Write-Host ""
Write-Host "  Use inside Claude Code:"
Write-Host "    /agent <agent-name>"
Write-Host ""
