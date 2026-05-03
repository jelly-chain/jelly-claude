# Windows Troubleshooting

## Shell errors

### "spawn /bin/bash ENOENT"
`core/shell.mjs` has been updated to use `cmd.exe` on Windows automatically.
If you see this error, ensure you have the latest version of jelly-claude.

### PowerShell execution policy
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Git Bash vs PowerShell
Use **PowerShell** (not Git Bash) for the `.ps1` scripts.
Use **Node.js directly** for `node modules/...` commands — works in any terminal.

---

## Node.js path issues

### "Cannot find module"
Run commands from the `jelly-claude` directory:
```powershell
cd C:\path\to\jelly-claude
node modules\market\run.mjs predict --text "test"
```

### ESM import errors
Make sure `package.json` has `"type": "module"` and you are running Node.js 18+.
Check: `node --version`

---

## Wallet issues

### Wallet files not found
Windows path: `%USERPROFILE%\.jelly-claude\wallets\`
Run: `node scripts\generate-wallet.mjs`

### Permission errors on wallet files
Right-click the `.jelly-claude` folder → Properties → Security → add your user with full control.

---

## API key issues

### Keys not loading from .env
The `.env` file must be in the `jelly-claude` root directory.
Open `.env` in Notepad — make sure there are no extra spaces around `=`.

### KALSHI_API_KEY
Kalshi requires a US account. The module still works — it simply returns an auth error.

---

## Claude Code on Windows

### claude command not found
Re-run: `npm install -g @anthropic-ai/claude-code`
Then close and reopen PowerShell.

### Proxy issues
The proxy (`proxy.mjs`) binds to `127.0.0.1:7788`. If that port is blocked by Windows Firewall,
change `PROXY_PORT` in `.env`.

---

## Performance

Windows Defender can slow down `node_modules` scanning. Add your `jelly-claude` folder
to Defender exclusions:

Settings → Windows Security → Virus & threat protection → Exclusions → Add folder
