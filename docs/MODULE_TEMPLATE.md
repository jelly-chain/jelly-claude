# Jelly Module Development Pattern

This document describes the standard pattern for creating new modules in the Jelly ecosystem.

## Module Structure

Each module resides in `modules/[module-name]/`.

### Required Files

1. **`run.mjs`** - Entry point for the module
2. **`tools/`** - Directory containing tool implementations
3. **`tools/index.mjs`** - Exports all tool functions
4. **`tools/[module-name].mjs`** - Main tool implementations

### Basic Pattern

#### 1. `run.mjs`

```javascript
import '../../core/env.mjs';
import { showSplash } from '../../core/splash.mjs';
import { dispatch } from '../../core/run.mjs';
import * as tools from './tools/index.mjs';
await showSplash();
dispatch(tools, '[module-name]');
```

#### 2. `tools/index.mjs`

```javascript
export {
  toolOne,
  toolTwo,
  // Add more tool exports here
} from './[module-name].mjs';

// Optional: Export module constants
export const MODULE_NAME = '[module-name]';
export const VERSION = '1.0.0';
```

#### 3. `tools/[module-name].mjs`

```javascript
import { httpJson } from '../../../core/http.mjs';
import { getCache } from '../../../core/cache.mjs';
import { getBreaker } from '../../../core/circuit-breaker.mjs';
import { createLogger } from '../../../core/logger.mjs';
import { incMetric } from '../../../core/metrics.mjs';
import { audit } from '../../../core/audit.mjs';

const cache = getCache('[module-name]', { defaultTtlMs: 60_000 });
const breaker = getBreaker('[module-name]-apis', { threshold: 5 });
const log = createLogger('[module-name]');

/**
 * Example tool function
 * @param {Object} args - Function arguments
 * @returns {Object} Result with ok flag
 */
export async function toolOne(args = {}) {
  incMetric('[module-name].toolOne');

  // Input validation
  if (!args.requiredParam) {
    return { ok: false, error: 'Missing --requiredParam' };
  }

  try {
    // Implement function logic here
    const result = await breaker.call(async () => {
      // Add your implementation
      return { processed: true, data: args };
    });

    // Audit log (optional)
    audit.action({ module: '[MODULE_NAME]', action: 'toolOne', args, result });

    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Another tool function
 */
export async function toolTwo(args = {}) {
  incMetric('[module-name].toolTwo');

  // Implementation here
  return { ok: true, message: 'toolTwo executed' };
}

// Add more tool functions as needed
```

## Core Utilities

- **Cache**: `getCache(name, options)` - Provides caching with TTL
- **Circuit Breaker**: `getBreaker(name, options)` - Prevents cascading failures
- **Logger**: `createLogger(module)` - Structured logging with correlation IDs
- **Metrics**: `incMetric(name, delta)`, `startTimer(name)` - Performance monitoring
- **Audit**: `audit.action({ module, action, args, result })` - Audit logging
- **HTTP**: `httpJson(url, options)` - HTTP requests with JSON handling

## Error Handling

All tool functions should return `{ ok: boolean, data?: any, error?: string }` format. Use try-catch blocks and return proper error messages.

## Input Validation

Validate all input parameters and return appropriate error messages for missing or invalid inputs.

## Metrics and Audit

Use `incMetric` to track function calls and `audit` to log important actions for auditing purposes.

## Caching

Use `getCache` to cache expensive operations. Set appropriate TTL values.

## Circuit Breakers

Use `getBreaker` to protect against API failures and rate limits.

## Logging

Use the logger from `createLogger` to log debug, info, warn, and error messages.

## Example Module

See the `example-tool` module for a complete example.