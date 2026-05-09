$SkillName = "predict-fun-skill"
$Dest = Join-Path $env:USERPROFILE ".claude/skills/$SkillName"
$SrcDir = Split-Path -Parent $MyInvocation.MyCommand.Path
New-Item -ItemType Directory -Force -Path $Dest | Out-Null
Copy-Item (Join-Path $SrcDir "SKILL.md") $Dest -Force
$keysEx = Join-Path $SrcDir ".keys.example"
if (Test-Path $keysEx) { Copy-Item $keysEx $Dest -Force }
$ClaudeMd = Join-Path $env:USERPROFILE ".claude/CLAUDE.md"
if (-not (Test-Path $ClaudeMd)) { New-Item -ItemType File -Force -Path $ClaudeMd | Out-Null }
$c = Get-Content $ClaudeMd -Raw -ErrorAction SilentlyContinue
if (-not ($c -like "*skills/$SkillName*")) {
  Add-Content -Path $ClaudeMd -Value ""
  Add-Content -Path $ClaudeMd -Value "## Skill: $SkillName"
  Add-Content -Path $ClaudeMd -Value "See: ~/.claude/skills/$SkillName/SKILL.md"
}
Write-Host "  Installed: $SkillName -> $Dest" -ForegroundColor Green
