# install.ps1 — Install groq-skill skill
$SkillName = "groq-skill"
$Dest      = "$env:USERPROFILE\.claude\skills\$SkillName"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
New-Item -ItemType Directory -Force -Path $Dest | Out-Null
Copy-Item "$ScriptDir\SKILL.md" $Dest -Force
if (Test-Path "$ScriptDir\.keys.example") { Copy-Item "$ScriptDir\.keys.example" $Dest -Force }
$ClaudeMd = "$env:USERPROFILE\.claude\CLAUDE.md"
New-Item -ItemType Directory -Force -Path (Split-Path $ClaudeMd) | Out-Null
if (-not (Test-Path $ClaudeMd)) { New-Item -ItemType File -Path $ClaudeMd | Out-Null }
$content = Get-Content $ClaudeMd -Raw -ErrorAction SilentlyContinue
if ($content -notmatch [regex]::Escape("skills/$SkillName")) {
  Add-Content $ClaudeMd "`n## Skill: $SkillName`nSee: ~/.claude/skills/$SkillName/SKILL.md"
}
if ($args[0] -ne "--quiet") { Write-Host "  Installed: $SkillName -> $Dest" }
