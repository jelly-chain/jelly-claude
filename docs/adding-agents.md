# Adding a New Agent

## 1. Create the agent class

Create `ai-agents/my-agent.js`:

```javascript
import { predict }     from '../core/prediction.mjs';
import { metrics }     from '../core/metrics.mjs';
import { audit }       from '../core/audit.mjs';
import { createLogger } from '../core/logger.mjs';

const log = createLogger('my-agent');

export class MyAgent {
  constructor(opts = {}) {
    this._chain = opts.chain ?? 'solana';
  }

  async execute(input, memory) {
    const t = metrics.startTimer('my-agent.execute');
    metrics.incMetric('my_agent.calls');

    try {
      // Your logic here
      const prediction = await predict({ text: input.text, chain: this._chain });

      const result = { ok: true, prediction, agent: 'my-agent', ts: Date.now() };

      if (memory) {
        await memory.set('lastMyAgentResult', result);
        memory.history.push({ type: 'my-agent', jellyScore: prediction.jellyScore });
      }

      audit.agentCall({ agent: 'my-agent', result });
      return result;
    } finally {
      t.end({ agent: 'my-agent' });
    }
  }
}

export default MyAgent;
```

## 2. Create a module (optional but recommended)

```bash
mkdir -p modules/my-module/tools
```

`modules/my-module/run.mjs`:
```javascript
import '../../core/env.mjs';
import { dispatch } from '../../core/run.mjs';
import * as tools from './tools/index.mjs';
dispatch(tools, 'my-module');
```

`modules/my-module/tools/index.mjs`:
```javascript
export { run } from './my-tool.mjs';
```

`modules/my-module/tools/my-tool.mjs`:
```javascript
import { MyAgent } from '../../../ai-agents/my-agent.js';
const agent = new MyAgent();

export async function run(args = {}) {
  if (!args.text) return { ok: false, error: 'Missing --text' };
  return agent.execute(args, null);
}
```

## 3. Add to AGENTS.md

```markdown
## my-agent
**Purpose:** Brief description of what it does.
**Required skills:** `jelly-skill`, `prediction-skill`
**Required keys:** None
**Example prompts:**
- "Do X with my-agent"
```

## 4. Create the Claude agent template

Save to `~/.claude/agents/my-agent.md`:

```markdown
---
name: my-agent
description: Brief description
---

# My Agent

[Instructions for Claude on how to use this agent]
```

## 5. Test it

```bash
node modules/my-module/run.mjs run --text "test signal"
```
