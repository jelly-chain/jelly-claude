import '../../core/env.mjs';
import { showSplash } from '../../core/splash.mjs';
import { dispatch } from '../../core/run.mjs';

// Handle direct roast/audit commands
const args = process.argv.slice(2);
const firstArg = args[0];

if (firstArg === 'roast' || firstArg?.includes('/roast')) {
  import('./roast.mjs').then(m => m.default || m).then(fn => fn?.());
} else if (firstArg === 'audit' || firstArg?.includes('/audit')) {
  import('./audit.mjs').then(m => m.default || m).then(fn => fn?.());
} else {
  // Default: dispatch to tools if they exist
  import('./tools/index.mjs').then(tools => {
    dispatch(tools, 'audit');
  }).catch(() => {
    console.log('{"ok":true,"module":"audit","action":"ready"}');
  });
}
