import React from 'react';
import { Box, Text, useApp } from 'ink';
import { JellyFish } from './jellyfish.mjs';
import { Octopus } from './octopus.mjs';
import { StatusPanel } from './status-panel.mjs';

export function SplashApp(props) {
  const { exit } = useApp();

  React.useEffect(() => {
    const t = setTimeout(exit, 2200);
    return () => clearTimeout(t);
  }, []);

  return React.createElement(
    Box, { flexDirection: 'column', paddingY: 1 },
    React.createElement(
      Box, { flexDirection: 'row', gap: 3, paddingX: 2 },
      React.createElement(JellyFish, null),
      React.createElement(
        Box, { flexDirection: 'column' },
        React.createElement(Octopus, null),
        React.createElement(StatusPanel, props),
      ),
    ),
    React.createElement(
      Text, { dimColor: true },
      '  Starting Jelly-Claude…',
    ),
  );
}
