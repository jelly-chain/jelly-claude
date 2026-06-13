import '../../core/env.mjs';
import { showSplash } from '../../core/splash.mjs';
import { dispatch } from '../../core/run.mjs';
import * as tools from './tools/index.mjs';
await showSplash();
dispatch(tools, 'kalshi');