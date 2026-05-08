import React from 'react';
import { Box, Text } from 'ink';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

function maskAddr(addr) {
  if (!addr || addr.length < 11) return addr ?? '—';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function readPub(walletsDir, name) {
  try { return readFileSync(join(walletsDir, `${name}.pub`), 'utf8').trim(); } catch { return null; }
}

function countSkills() {
  try {
    const dir = join(homedir(), '.claude', 'skills');
    if (!existsSync(dir)) return 0;
    return readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory()).length;
  } catch { return 0; }
}

const SEP = '─'.repeat(28);

function Row({ label, value, valueColor }) {
  return React.createElement(
    Text, null,
    React.createElement(Text, { color: 'white', dimColor: true }, label),
    React.createElement(Text, { color: valueColor ?? 'white' }, value),
  );
}

export function StatusPanel({ mode = 'none', models = {}, port = 7788 }) {
  const [tick, setTick] = React.useState(0);
  const walletsDir = join(homedir(), '.jelly-claude', 'wallets');
  const solAddr = readPub(walletsDir, 'solana');
  const evmAddr = readPub(walletsDir, 'evm');
  const skillCount = countSkills();

  React.useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const modeLabel =
    mode === 'anthropic'   ? 'Anthropic (direct)'
    : mode === 'openrouter' ? `OpenRouter → :${port}`
    : 'No key (Claude login)';
  const modeColor = mode === 'none' ? 'yellow' : 'green';

  const now = new Date();
  const ts = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return React.createElement(
    Box, {
      flexDirection: 'column',
      borderStyle: 'round',
      borderColor: 'cyan',
      paddingX: 1,
      marginTop: 1,
    },
    React.createElement(Text, { bold: true, color: 'cyan' }, ' Jelly-Claude v2.0 '),
    React.createElement(Text, { dimColor: true }, SEP),
    React.createElement(Row, { label: 'Mode    ', value: modeLabel, valueColor: modeColor }),
    models.opus   && React.createElement(Row, { label: 'Opus    ', value: models.opus,   valueColor: 'blue' }),
    models.sonnet && React.createElement(Row, { label: 'Sonnet  ', value: models.sonnet, valueColor: 'blue' }),
    models.haiku  && React.createElement(Row, { label: 'Haiku   ', value: models.haiku,  valueColor: 'blue' }),
    React.createElement(Text, { dimColor: true }, SEP),
    React.createElement(Row, {
      label: 'Skills  ',
      value: String(skillCount),
      valueColor: skillCount > 0 ? 'green' : 'yellow',
    }),
    solAddr && React.createElement(Row, { label: 'SOL     ', value: maskAddr(solAddr) }),
    evmAddr && React.createElement(Row, { label: 'EVM     ', value: maskAddr(evmAddr) }),
    React.createElement(Text, { dimColor: true }, SEP),
    React.createElement(Text, { dimColor: true }, `${ts}  (${tick}s)`),
  );
}
