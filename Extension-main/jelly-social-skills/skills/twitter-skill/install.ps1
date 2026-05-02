# install.ps1 — Windows installer for twitter-skill
$SkillName = "twitter-skill"
$Dest      = "$env:USERPROFILE\.claude\skills\$SkillName"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
New-Item -ItemType Directory -Force -Path $Dest | Out-Null
Copy-Item "$ScriptDir\SKILL.md" "$Dest\" -Force
if (Test-Path "$ScriptDir\.keys.example") { Copy-Item "$ScriptDir\.keys.example" "$Dest\" -Force }
$ClaudeMd = "$env:USERPROFILE\.claude\CLAUDE.md"
if (-not (Test-Path $ClaudeMd)) { New-Item -ItemType File -Force -Path $ClaudeMd | Out-Null }
if (-not (Select-String -Path $ClaudeMd -Pattern "skills/$SkillName" -Quiet)) {
  Add-Content $ClaudeMd ""
  Add-Content $ClaudeMd "## Skill: $SkillName"
  Add-Content $ClaudeMd "See: ~/.claude/skills/$SkillName/SKILL.md"
}
if ($args -notcontains "--quiet") { Write-Host "  Installed: $SkillName -> $Dest" }
