# Adding a New Skill

Skills teach Claude Code how to interact with a specific protocol or API.
They live at `~/.claude/skills/<skill-name>/SKILL.md`.

## Skill file structure

```
jelly-claude-skills/skills/my-skill/
├── SKILL.md          ← Main skill instructions (required)
├── install.sh        ← Install script for Mac/Linux
├── install.ps1       ← Install script for Windows
└── .keys.example     ← Example API key config (optional)
```

## Writing SKILL.md

```markdown
# my-skill

**Purpose:** What this skill enables Claude to do.
**Required keys:** `MY_API_KEY`
**Base URL:** `https://api.example.com`

---

## Authentication

```javascript
const headers = { 'Authorization': `Bearer ${process.env.MY_API_KEY}` };
```

## Endpoints

### GET /endpoint
Returns: ...

### POST /endpoint
Body: ...

---

## Example usage

[Show Claude exactly what to do for common tasks]
```

## Install script (Mac/Linux)

`install.sh`:
```bash
#!/usr/bin/env bash
SKILL_DIR="${HOME}/.claude/skills/my-skill"
mkdir -p "$SKILL_DIR"
cp SKILL.md "$SKILL_DIR/SKILL.md"
echo "✅ my-skill installed at $SKILL_DIR"
```

## Install script (Windows)

`install.ps1`:
```powershell
$skillDir = "$env:USERPROFILE\.claude\skills\my-skill"
New-Item -ItemType Directory -Force -Path $skillDir | Out-Null
Copy-Item -Path "SKILL.md" -Destination "$skillDir\SKILL.md"
Write-Host "✅ my-skill installed at $skillDir"
```

## Install all skills

```bash
node scripts/install-skills.mjs --from ../jelly-claude-skills/skills
```

## Add to SKILLS.md

```markdown
## my-skill
**Chain:** Multi-chain
**Purpose:** What it does.
**Required keys:** `MY_API_KEY`
**Use when:** [Specific situations]
```
