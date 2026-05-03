import '../../core/env.mjs';
import { dispatch } from '../../core/run.mjs';
import * as tools from './tools/index.mjs';
dispatch(tools, 'alerts');
