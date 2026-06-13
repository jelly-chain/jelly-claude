# install-all.ps1 — Install all Jelly-AI skills (Windows PowerShell)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SkillsDir = Join-Path $ScriptDir "skills"
$Installed = 0
$Skipped   = 0

Write-Host ""
Write-Host "  Installing all Jelly-AI skills..." -ForegroundColor Cyan
Write-Host ""

foreach ($skillDir in Get-ChildItem -Path $SkillsDir -Directory) {
  $installer = Join-Path $skillDir.FullName "install.ps1"
  if (Test-Path $installer) {
    Write-Host "  -> $($skillDir.Name)" -ForegroundColor Cyan
    & $installer --quiet
    $Installed++
  } else {
    Write-Host "  ! $($skillDir.Name) — no install.ps1 found, skipping" -ForegroundColor Yellow
    $Skipped++
  }
}

Write-Host ""
Write-Host "  Done! Installed: $Installed   Skipped: $Skipped" -ForegroundColor Green
Write-Host ""
