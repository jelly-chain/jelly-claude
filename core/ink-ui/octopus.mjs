import React from 'react';
import { Text } from 'ink';
import chalk from 'chalk';

const RAW_FRAMES = [
  // Frame 0 — eyes open
  [
    '   .-----.   ',
    '  ( @    @ ) ',
    '  (  ~~~   ) ',
    "   '-----'   ",
    '  /|\\ | /|\\ ',
    ' / | \\|/ | \\',
    '/  |  |  |  \\',
  ],
  // Frame 1 — eyes blink
  [
    '   .-----.   ',
    '  ( -    - ) ',
    '  (  ~~~   ) ',
    "   '-----'   ",
    '  /|\\ | /|\\ ',
    ' / | \\|/ | \\',
    '/  |  |  |  \\',
  ],
];

// Apply magentaBright (head) → magenta (arms) gradient
function applyGradient(lines) {
  return lines.map((line, i) => {
    if (i <= 3) return chalk.magentaBright(line);
    return chalk.magenta(line);
  }).join('\n');
}

const FRAMES = RAW_FRAMES.map(applyGradient);

export function Octopus() {
  const [frame, setFrame] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => setFrame(f => (f + 1) % 2), 1200);
    return () => clearInterval(timer);
  }, []);

  return React.createElement(Text, null, FRAMES[frame]);
}
