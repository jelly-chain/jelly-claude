import React from 'react';
import { Text } from 'ink';
import chalk from 'chalk';

// Two animation frames — compact bell / expanded bell
const RAW_FRAMES = [
  [
    '    .-------.  ',
    '   /  ~   ~  \\ ',
    '  /  (*)  (*) \\',
    ' |      ^      |',
    ' |  .-------.  |',
    '  \\_________/  ',
    '   | | | | |   ',
    '   | | | | |   ',
    '    \\|  |  |/  ',
    '      \'-+-\'   ',
  ],
  [
    '  .-----------.  ',
    ' /  ~ ~ ~ ~ ~  \\ ',
    '| (*)         (*)|',
    '|       ^        |',
    '|  .---------.   |',
    ' \\____________/  ',
    '    |  |   |  |  ',
    '    |  |   |  |  ',
    '     \\ |   | /   ',
    '       \'-.-\'   ',
  ],
];

// Apply cyan→blue gradient: top lines brighter, tentacles darker
function applyGradient(lines) {
  return lines.map((line, i) => {
    if (i <= 1) return chalk.cyanBright(line);
    if (i <= 4) return chalk.cyan(line);
    if (i === 5) return chalk.blueBright(line);
    return chalk.blue(line);
  }).join('\n');
}

const FRAMES = RAW_FRAMES.map(applyGradient);

export function JellyFish() {
  const [frame, setFrame] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => setFrame(f => (f + 1) % 2), 600);
    return () => clearInterval(timer);
  }, []);

  return React.createElement(Text, null, FRAMES[frame]);
}
