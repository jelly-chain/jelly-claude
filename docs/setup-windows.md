# Windows Setup Guide (PowerShell)

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) — use the Windows installer |
| npm | 9+ | Included with Node |
| git | any | [git-scm.com](https://git-scm.com) |
| PowerShell | 5+ | Pre-installed on Windows 10/11 |

## Step 1 — Allow script execution (one time)

Open PowerShell **as Administrator**:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Step 2 — Install Claude Code

```powershell
npm install -g @anthropic-ai/claude-code
```

Verify:
```powershell
claude --version
```

## Step 3 — Clone the repos

```powershell
git clone https://github.com/jelly-chain/jelly-claude
git clone https://github.com/jelly-chain/jelly-claude-skills
git clone https://github.com/jelly-chain/jelly-claude-agents
```

## Step 4 — Run setup

```powershell
cd jelly-claude
.\setup.ps1
```

This creates wallets at `%USERPROFILE%\.jelly-claude\wallets\` and installs skills and agents.

## Step 5 — Configure your API key

Open `.env` in Notepad or VS Code:

```powershell
notepad .env
```

Add one of:
```
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...
```

## Step 6 — Launch

```powershell
# Standard mode
.\jelly-claude.ps1

# TORQ mode
.\torq.ps1
```

## Running modules on Windows

All `node modules/` commands work identically on Windows:

```powershell
# Use backslashes or forward slashes — both work
node modules\market\run.mjs predict --text "BNB pump" --chain bnb
node modules/scanner/run.mjs scan --chain bsc
node modules/wallet/run.mjs balance --address <addr>

# Health check
npm run health
```

## Common Windows issues

### "cannot be loaded because running scripts is disabled"
Run: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

### "node is not recognized"
Re-install Node.js and tick "Add to PATH" during install, then restart PowerShell.

### Long path errors
Enable long paths in Windows:
```powershell
# As Administrator:
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

### Shell detection
`core/shell.mjs` automatically detects Windows and uses `cmd.exe /c` instead of `/bin/bash`. No manual config needed.

## Wallet file locations on Windows

| File | Path |
|------|------|
| Solana wallet | `%USERPROFILE%\.jelly-claude\wallets\solana.json` |
| EVM wallet | `%USERPROFILE%\.jelly-claude\wallets\evm.json` |
| API keys | `%USERPROFILE%\.jelly-claude\.keys` |
| Skills | `%USERPROFILE%\.claude\skills\` |
| Agents | `%USERPROFILE%\.claude\agents\` |
