# install-all.ps1 — Install all jelly-forex skills (Windows)
$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$SkillsDir  = Join-Path $ScriptDir "skills"
$Installed  = 0
$Skipped    = 0

Write-Host ""
Write-Host "  Installing all jelly-forex skills..." -ForegroundColor Cyan
Write-Host ""

Get-ChildItem -Path $SkillsDir -Directory | ForEach-Object {
  $skillName  = $_.Name
  $installer  = Join-Path $_.FullName "install.ps1"

  if (Test-Path $installer) {
    Write-Host "  -> $skillName" -ForegroundColor Cyan
    & $installer --quiet
    $Installed++
  } else {
    Write-Host "  ! $skillName — no install.ps1 found, skipping" -ForegroundColor Yellow
    $Skipped++
  }
}

Write-Host ""
Write-Host "  Done! Installed: $Installed   Skipped: $Skipped" -ForegroundColor Green
Write-Host ""
